import { useApp } from "@/context/AppContext";
import type { TopReview } from "@/utils/parseResults";

export function useReviews() {
  const { apiKey, setResults, lastSearch } = useApp();

  const fetchTopReview = async (rowId: string, dataId: string, placeId: string) => {
    if (!apiKey || (!dataId && !placeId)) return;

    setResults((current) => current.map((row) => row.id === rowId ? { ...row, reviewStatus: "loading" } : row));

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, dataId, placeId, language: lastSearch?.language ?? "en" }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "Failed to fetch review");

      const topReview: TopReview | null = data.topReview ?? null;
      setResults((current) => current.map((row) => row.id === rowId ? { ...row, topReview, reviewStatus: topReview ? "loaded" : "none" } : row));
    } catch {
      setResults((current) => current.map((row) => row.id === rowId ? { ...row, reviewStatus: "error" } : row));
    }
  };

  const fetchAllPending = async (rowIds: string[]) => {
    for (const id of rowIds) {
      // Sequential to avoid SerpAPI rate limit spikes
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
  };

  return { fetchTopReview, fetchAllPending };
}
