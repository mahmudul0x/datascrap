import { Radar } from "lucide-react";

export function EmptyState() {
  return (
    <div className="relative flex min-h-[460px] flex-col items-center justify-center gap-6 overflow-hidden text-center">
      <div className="absolute inset-0 bg-grid-subtle opacity-30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card to-card" aria-hidden />

      <div className="relative grid h-32 w-32 place-items-center">
        <div className="absolute inset-0 rounded-full bg-radar-field opacity-70" />
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="absolute inset-6 rounded-full border border-primary/30" />
        <div className="absolute h-px w-16 origin-left translate-x-8 bg-gradient-to-r from-primary to-transparent animate-sweep" />
        <div className="relative grid h-10 w-10 place-items-center rounded-full border border-primary/40 bg-card text-primary">
          <Radar className="h-4 w-4" />
        </div>
      </div>

      <div className="relative max-w-md space-y-2">
        <h2 className="font-display text-2xl tracking-tight text-foreground">No results yet</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Configure your search query, location, and parameters in the sidebar — then hit
          <span className="mx-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">Start scraping</span>
          to discover business leads.
        </p>
      </div>
    </div>
  );
}
