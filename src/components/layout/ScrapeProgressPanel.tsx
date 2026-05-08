import { useEffect, useState } from "react";
import { Activity, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";

function formatDuration(ms: number) {
  if (ms < 1000) return "<1s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

export function ScrapeProgressPanel() {
  const { status, progress, scrapeMeta } = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== "scraping") return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [status]);

  const idle = status !== "scraping" && scrapeMeta.phase === "idle";
  if (idle && progress === 0) {
    return <ProgressBar value={progress} />;
  }

  const elapsed = scrapeMeta.startedAt ? now - scrapeMeta.startedAt : 0;
  const ratio = scrapeMeta.target > 0 ? Math.min(scrapeMeta.collected / scrapeMeta.target, 1) : progress / 100;
  const eta = ratio > 0.05 && status === "scraping" ? Math.max(0, elapsed / ratio - elapsed) : 0;

  const phaseLabel = scrapeMeta.phase === "fetching"
    ? "Fetching results"
    : scrapeMeta.phase === "checking"
      ? "Checking websites"
      : scrapeMeta.phase === "done"
        ? "Complete"
        : "Preparing";

  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-secondary/40 p-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
          {scrapeMeta.phase === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : status === "scraping" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Activity className="h-3.5 w-3.5 text-primary" />}
          {phaseLabel}
        </span>
        <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <ProgressBar value={progress} />
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Stat label="Page" value={`${scrapeMeta.page}/${scrapeMeta.totalPages || "?"}`} />
        <Stat label="Results" value={`${scrapeMeta.collected}/${scrapeMeta.target || "?"}`} />
        <Stat label={<span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />ETA</span>} value={status === "scraping" && eta > 0 ? formatDuration(eta) : formatDuration(elapsed)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-md bg-background/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
