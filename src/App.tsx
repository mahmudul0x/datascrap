import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ApiKeyModal } from "@/components/modals/ApiKeyModal";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ResultsTable } from "@/components/results/ResultsTable";
import { ResultsToolbar, columnLabels, type WebsiteFilter } from "@/components/results/ResultsToolbar";
import { StatsBar } from "@/components/results/StatsBar";
import { AppProvider, useApp } from "@/context/AppContext";
import type { BusinessRow } from "@/utils/parseResults";

const initialVisible = Object.fromEntries(Object.keys(columnLabels).map((key) => [key, true]));
type SortState = { key: keyof typeof columnLabels; direction: "asc" | "desc" } | null;

export default function App() {
  return (
    <AppProvider>
      <MapScraperDashboard />
      <ApiKeyModal />
      <Toaster position="bottom-right" richColors closeButton duration={3000} />
    </AppProvider>
  );
}

function MapScraperDashboard() {
  const { results, isDemo, error, setModalOpen } = useApp();
  const [filter, setFilter] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>("all");
  const [visible, setVisible] = useState<Record<string, boolean>>(initialVisible);
  const [sort, setSort] = useState<SortState>(null);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let rows = q ? results.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(q))) : results;
    if (websiteFilter === "with") rows = rows.filter((row) => Boolean(row.website));
    else if (websiteFilter === "without") rows = rows.filter((row) => !row.website);
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      if (sort.key === "index") {
        const compare = results.indexOf(a) - results.indexOf(b);
        return sort.direction === "asc" ? compare : -compare;
      }
      const rawA = a[sort.key as keyof BusinessRow];
      const rawB = b[sort.key as keyof BusinessRow];
      const av = sort.key === "topReview" ? (a.topReview?.snippet ?? "") : rawA;
      const bv = sort.key === "topReview" ? (b.topReview?.snippet ?? "") : rawB;
      const aNum = typeof av === "number" ? av : null;
      const bNum = typeof bv === "number" ? bv : null;
      let compare: number;
      if (aNum !== null || bNum !== null) {
        compare = (aNum ?? -Infinity) - (bNum ?? -Infinity);
      } else {
        compare = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sort.direction === "asc" ? compare : -compare;
    });
  }, [filter, websiteFilter, results, sort]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grain opacity-60" aria-hidden />
      <Navbar />
      <Sidebar />
      <main className="relative pt-14 md:pl-[300px]">
        <div className="min-h-[calc(100vh-56px)] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          <PageHeader />
          <StatsBar rows={results} />
          {error && (
            <div className="animate-fadeIn flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
              <button onClick={() => setModalOpen(true)} className="font-semibold hover:underline">Change API key</button>
            </div>
          )}
          {isDemo && (
            <div className="animate-fadeIn flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
              <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Demo</span>
              <span className="text-foreground/90">Sample data shown — set your API key to scrape real results.</span>
            </div>
          )}
          <ResultsToolbar rows={filteredRows} filter={filter} setFilter={setFilter} visible={visible} setVisible={setVisible} websiteFilter={websiteFilter} setWebsiteFilter={setWebsiteFilter} />
          <ResultsTable rows={filteredRows} visible={visible} sort={sort} setSort={setSort} />
        </div>
      </main>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="space-y-1.5 border-b border-border/40 pb-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
        Lead intelligence
      </div>
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        Discover business leads from <span className="italic text-primary">Google Maps</span>.
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Search any vertical in any city, enrich with contact details, and export structured data — all in seconds.
      </p>
    </div>
  );
}
