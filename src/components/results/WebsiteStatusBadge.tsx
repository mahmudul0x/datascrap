import type { WebsiteStatus } from "@/utils/parseResults";

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  const content = {
    active: { label: "Active", dot: "bg-success", className: "border-success/25 bg-success/10 text-success" },
    inactive: { label: "Inactive", dot: "bg-destructive", className: "border-destructive/25 bg-destructive/10 text-destructive" },
    checking: { label: "Checking", dot: "bg-warning animate-pulse", className: "border-warning/25 bg-warning/10 text-warning" },
    none: { label: "—", dot: "bg-muted-foreground/40", className: "border-border/60 bg-secondary/40 text-muted-foreground" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${content.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${content.dot}`} />
      {content.label}
    </span>
  );
}
