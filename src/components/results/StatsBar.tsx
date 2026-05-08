import { Building2, Mail, Phone, Globe2, GlobeLock, Star, type LucideIcon } from "lucide-react";
import type { BusinessRow } from "@/utils/parseResults";

type Stat = { label: string; value: number | string; total?: number; icon: LucideIcon; accent: string; hint?: string };

export function StatsBar({ rows }: { rows: BusinessRow[] }) {
  const total = rows.length;
  const withRating = rows.filter((row) => row.rating !== null);
  const avgRating = withRating.length ? withRating.reduce((sum, row) => sum + (row.rating ?? 0), 0) / withRating.length : 0;
  const noWebsite = rows.filter((row) => !row.website).length;
  const stats: Stat[] = [
    { label: "Total leads", value: total, icon: Building2, accent: "text-primary" },
    { label: "With phone", value: rows.filter((row) => row.phone).length, total, icon: Phone, accent: "text-chart-3" },
    { label: "With email", value: rows.filter((row) => row.email).length, total, icon: Mail, accent: "text-warning" },
    { label: "With website", value: rows.filter((row) => row.website).length, total, icon: Globe2, accent: "text-success" },
    { label: "No website", value: noWebsite, total, icon: GlobeLock, accent: "text-destructive", hint: noWebsite > 0 ? "Prime outreach targets" : undefined },
    { label: "Avg rating", value: avgRating ? avgRating.toFixed(1) : "—", icon: Star, accent: "text-warning", hint: withRating.length ? `${withRating.length} rated` : undefined },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => {
        const numericValue = typeof stat.value === "number" ? stat.value : Number(stat.value) || 0;
        const pct = stat.total && stat.total > 0 ? Math.round((numericValue / stat.total) * 100) : null;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-soft transition hover:border-border-strong"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl tracking-tight text-foreground tabular-nums">{stat.value}</span>
                  {pct !== null && total > 0 && (
                    <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                  )}
                </div>
                {stat.hint && <p className="text-[10px] text-muted-foreground/80">{stat.hint}</p>}
              </div>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/40 ${stat.accent}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            {pct !== null && total > 0 && (
              <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border/60">
                <div className={`h-full rounded-full bg-current ${stat.accent}`} style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
