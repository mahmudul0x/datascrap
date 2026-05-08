import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { checkWebsiteStatus } from "@/hooks/useWebsiteStatus";
import { parseSerpResults, type BusinessRow } from "@/utils/parseResults";

type SearchParams = {
  query: string;
  location: string;
  maxResults: number;
  language: string;
  start?: number | null;
};

function friendlyError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid") && lower.includes("api")) return "Your SerpAPI key is invalid. Click 'Change API Key' to update it.";
  if (lower.includes("run out") || lower.includes("quota")) return "API quota exceeded. Upgrade your SerpAPI plan.";
  if (lower.includes("failed to fetch") || lower.includes("networkerror")) return "Network error. Check your connection and try again.";
  return message || "Network error. Check your connection and try again.";
}

async function fetchSerpPage(input: { query: string; location: string; language: string; apiKey: string; start: number | null }) {
  const response = await fetch("/api/serpapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(friendlyError(data.error ?? "Network error. Check your connection and try again."));
  return data;
}

export function useSerpApi() {
  const { apiKey, results, setResults, setIsDemo, setStatus, setProgress, setError, setNextStart, setSelectedIds, setScrapeMeta } = useApp();

  const runStatusChecks = (ids: string[]) => {
    ids.forEach(async (id) => {
      const row = results.find((item) => item.id === id);
      const status = await checkWebsiteStatus(row?.website ?? "");
      setResults((current) => current.map((item) => (item.id === id ? { ...item, websiteStatus: status } : item)));
    });
  };

  const scrape = async ({ query, location, maxResults, language, start = null }: SearchParams) => {
    if (!apiKey) return;
    const safeQuery = query.trim().slice(0, 160);
    const safeLocation = location.trim().slice(0, 160);
    const safeMax = Math.min(Math.max(maxResults, 1), 200);
    if (!safeQuery || !safeLocation) return;

    setStatus("scraping");
    setError("");
    setProgress(start ? 18 : 6);
    const startedAt = Date.now();
    const expectedPages = Math.max(1, Math.ceil(safeMax / 20));
    setScrapeMeta({ page: 0, totalPages: expectedPages, collected: 0, target: safeMax, startedAt, phase: "fetching" });

    try {
      const collected: BusinessRow[] = [];
      let nextStart: number | null = start ?? 0;
      let pages = 0;

      while (collected.length < safeMax && nextStart !== null && pages < 10) {
        const data = await fetchSerpPage({ query: safeQuery, location: safeLocation, language, apiKey, start: nextStart || null });
        const parsed = parseSerpResults(data.local_results ?? [], (start ? results.length : 0) + collected.length);
        collected.push(...parsed.slice(0, safeMax - collected.length));
        pages += 1;
        setProgress(Math.min(70, 14 + Math.round((collected.length / safeMax) * 56)));
        setScrapeMeta((prev) => ({ ...prev, page: pages, totalPages: Math.max(prev.totalPages, pages), collected: collected.length, phase: "fetching" }));
        nextStart = data.serpapi_pagination?.next ? nextStart + Math.max(parsed.length, 20) : null;
        if (!parsed.length) nextStart = null;
      }

      if (!collected.length) throw new Error("No results found for this search. Try a broader query or different location.");

      setNextStart(collected.length >= safeMax ? nextStart : null);
      setSelectedIds([]);
      setResults((current) => (start ? [...current, ...collected] : collected));
      setIsDemo(false);
      setProgress(72);
      setScrapeMeta((prev) => ({ ...prev, collected: collected.length, phase: "checking" }));

      collected.forEach(async (row, index) => {
        const websiteStatus = await checkWebsiteStatus(row.website);
        setResults((current) => current.map((item) => (item.id === row.id ? { ...item, websiteStatus } : item)));
        setProgress(Math.min(100, 72 + Math.round(((index + 1) / collected.length) * 28)));
      });

      toast(`Scrape complete — ${collected.length} results found`);
      setScrapeMeta((prev) => ({ ...prev, phase: "done" }));
    } catch (caught) {
      const message = caught instanceof Error ? friendlyError(caught.message) : "Network error. Check your connection and try again.";
      setError(message);
      toast.error(message, { duration: Infinity });
      setScrapeMeta((prev) => ({ ...prev, phase: "idle" }));
    } finally {
      setStatus("idle");
      setProgress(100);
      window.setTimeout(() => {
        setProgress(0);
        setScrapeMeta({ page: 0, totalPages: 0, collected: 0, target: 0, startedAt: null, phase: "idle" });
      }, 1500);
    }
  };

  return { scrape, runStatusChecks };
}
