import { useCallback, useState } from "react";
import { Radar, X, Settings2, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";
import { QueryAutocomplete } from "@/components/ui/QueryAutocomplete";
import { ScrapeProgressPanel } from "@/components/layout/ScrapeProgressPanel";
import { SheetsModal } from "@/components/modals/SheetsModal";
import { useApp } from "@/context/AppContext";
import { useSerpApi } from "@/hooks/useSerpApi";
import { useSheetExport } from "@/hooks/useSheetExport";
import { callSerpApi } from "@/lib/serpApiProxy";
import { businessKeywords } from "@/data/keywords";

const languages = [
  { label: "English", value: "en" },
  { label: "Bangla", value: "bn" },
  { label: "Dutch", value: "nl" },
  { label: "German", value: "de" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "Hindi", value: "hi" },
  { label: "Arabic", value: "ar" },
];

const popularLocations = [
  "Amsterdam, Netherlands", "London, United Kingdom", "New York, NY, United States", "Dubai, United Arab Emirates",
  "Dhaka, Bangladesh", "Singapore", "Berlin, Germany", "Paris, France", "Toronto, Canada", "Sydney, Australia",
];

async function fetchLocationSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  try {
    const params = new URLSearchParams({ mode: "locations", q: query, limit: "10" });
    const data = await callSerpApi(params).catch(() => []);
    const list = Array.isArray(data) ? data : [];
    return list
      .map((item: any) => item.canonical_name || item.name)
      .filter((value): value is string => Boolean(value && value.length))
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function Sidebar() {
  const { apiKey, hasServerApiKey, results, status, sidebarOpen, setSidebarOpen, setModalOpen, setLastSearch } = useApp();
  const { scrape } = useSerpApi();
  const { url: sheetUrl, sheetName, save: saveSheet, isConnected } = useSheetExport();
  const [query, setQuery] = useState("lawyers");
  const [location, setLocation] = useState("Amsterdam, Netherlands");
  const [maxResults, setMaxResults] = useState(20);
  const [language, setLanguage] = useState("en");
  const [sheetsOpen, setSheetsOpen] = useState(false);

  const cleanedQuery = query.trim().slice(0, 160);
  const cleanedLocation = location.trim().slice(0, 160);
  const canScrape = Boolean((apiKey || hasServerApiKey) && cleanedQuery && cleanedLocation && status !== "scraping");

  const startScrape = () => {
    if (!canScrape) return;
    const search = { query: cleanedQuery, location: cleanedLocation, maxResults, language };
    setLastSearch(search);
    scrape(search);
  };

  const memoFetch = useCallback(fetchLocationSuggestions, []);

  const panel = (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-5 md:hidden">
        <span className="text-sm font-semibold">Search Controls</span>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><X /></Button>
      </div>
      <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 md:pt-20">
        <section className="space-y-4">
          <SectionHeader number="01" title="Search" />
          <div className="space-y-2">
            <Label>Query</Label>
            <QueryAutocomplete value={query} onChange={setQuery} suggestions={businessKeywords} placeholder="Click to browse 200+ keywords…" />
            <p className="text-[11px] text-muted-foreground">Click input to see all options · type to filter · press Enter to use custom query</p>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              suggestions={popularLocations}
              fetchSuggestions={memoFetch}
              placeholder="Search any city or country…"
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader number="02" title="Parameters" />
          <div className="space-y-2"><Label>Max results</Label><SegmentedControl value={maxResults} options={[20, 50, 100, 200]} onChange={setMaxResults} /></div>
          <div className="space-y-2">
            <Label>Language</Label>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
              {languages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader number="03" title="Execute" />
          <Button className="h-11 w-full text-sm font-semibold tracking-tight shadow-glow" disabled={!canScrape} onClick={startScrape}>
            {status === "scraping" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Radar className="h-4 w-4 animate-radar" />}
            {status === "scraping" ? "Scraping…" : "Start scraping"}
          </Button>
          <ScrapeProgressPanel />
        </section>

        <section className="space-y-3">
          <SectionHeader number="04" title="Integrations" />
          <button
            onClick={() => setSheetsOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 text-left text-xs transition hover:border-primary/50 hover:bg-accent"
          >
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-success" />
              <span className="font-semibold text-foreground">Google Sheet</span>
            </span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success"><CheckCircle2 className="h-3 w-3" />Connected</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><Settings2 className="h-3 w-3" />Setup</span>
            )}
          </button>
        </section>
      </div>
      <footer className="space-y-2.5 border-t border-sidebar-border bg-sidebar/80 px-5 py-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-wider text-muted-foreground">Results</span>
          <span className="font-mono text-sm font-semibold text-foreground">{results.length}</span>
        </div>
        <button className="text-xs font-medium text-primary hover:underline" onClick={() => setModalOpen(true)}>Change API key →</button>
      </footer>
    </aside>
  );

  return (
    <>
      <div className="fixed left-0 top-0 z-30 hidden h-screen md:block">{panel}</div>
      {sidebarOpen && <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur md:hidden" onClick={() => setSidebarOpen(false)}><div className="h-full" onClick={(event) => event.stopPropagation()}>{panel}</div></div>}
      <SheetsModal open={sheetsOpen} initialUrl={sheetUrl} initialSheetName={sheetName} onClose={() => setSheetsOpen(false)} onSave={(u, n) => { saveSheet(u, n); setSheetsOpen(false); }} />
    </>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-border/40 pb-1.5">
      <span className="font-mono text-[10px] font-medium text-muted-foreground/70">{number}</span>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) { return <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{children}</label>; }
