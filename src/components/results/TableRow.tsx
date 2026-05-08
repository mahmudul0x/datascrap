import { ExternalLink, Star, MessageSquareQuote, Loader2, AlertCircle, Quote } from "lucide-react";
import { normalizeUrl, type BusinessRow } from "@/utils/parseResults";
import { WebsiteStatusBadge } from "./WebsiteStatusBadge";
import { useReviews } from "@/hooks/useReviews";

const fallback = "—";

export function TableRow({ row, index, selected, visible, widths, onToggle }: { row: BusinessRow; index: number; selected: boolean; visible: Record<string, boolean>; widths?: Record<string, number>; onToggle: () => void }) {
  const { fetchTopReview } = useReviews();
  const colStyle = (key: string) => widths?.[key] ? { width: widths[key], minWidth: widths[key], maxWidth: widths[key] } : undefined;

  return (
    <tr className="group animate-fadeIn border-b border-border/70 bg-card transition hover:bg-accent/25" style={{ animationDelay: `${index * 30}ms` }}>
      <td className="sticky left-0 z-10 w-10 border-r border-border/40 bg-card px-3 py-3 group-hover:bg-accent/25"><input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 accent-primary" aria-label={`Select ${row.name}`} /></td>
      {visible.index && <td className="px-3 py-3 text-muted-foreground" style={colStyle("index")}>{index + 1}</td>}
      {visible.name && <td className="truncate px-3 py-3 font-semibold text-foreground" style={colStyle("name")}>{row.name}</td>}
      {visible.address && <td className="truncate px-3 py-3 text-muted-foreground" style={colStyle("address")} title={row.address}>{row.address || fallback}</td>}
      {visible.phone && <td className="truncate px-3 py-3 font-mono text-sm" style={colStyle("phone")}>{row.phone ? <a href={`tel:${row.phone}`} className="text-foreground hover:text-primary">{row.phone}</a> : fallback}</td>}
      {visible.email && <td className="truncate px-3 py-3 font-mono text-sm" style={colStyle("email")}>{row.email ? <a href={`mailto:${row.email}`} className="text-foreground hover:text-primary">{row.email}</a> : fallback}</td>}
      {visible.website && <td className="truncate px-3 py-3 font-mono text-sm" style={colStyle("website")}>{row.website ? <a href={normalizeUrl(row.website)} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 text-primary hover:underline"><span className="truncate">{row.website}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <span className="text-xs text-muted-foreground/70">No website</span>}</td>}
      {visible.specializations && <td className="truncate px-3 py-3 text-muted-foreground" style={colStyle("specializations")} title={row.specializations}>{row.specializations || fallback}</td>}
      {visible.rating && <td className="px-3 py-3" style={colStyle("rating")}>{row.rating !== null ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-warning text-warning" /><span className="font-semibold text-foreground">{row.rating.toFixed(1)}</span><span className="text-xs text-muted-foreground">({row.reviews ?? 0})</span></span> : <span className="text-muted-foreground">{fallback}</span>}</td>}
      {visible.topReview && (
        <td className="px-3 py-3 align-top" style={colStyle("topReview")}>
          <ReviewCell row={row} onLoad={() => fetchTopReview(row.id, row.dataId, row.placeId)} />
        </td>
      )}
      {visible.websiteStatus && <td className="px-3 py-3" style={colStyle("websiteStatus")}><WebsiteStatusBadge status={row.websiteStatus} /></td>}
    </tr>
  );
}

function ReviewCell({ row, onLoad }: { row: BusinessRow; onLoad: () => void }) {
  if (row.reviewStatus === "none" || (!row.dataId && !row.placeId && !row.topReview)) {
    return <span className="text-xs text-muted-foreground">{fallback}</span>;
  }

  if (row.reviewStatus === "loading") {
    return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</span>;
  }

  if (row.reviewStatus === "error") {
    return (
      <button type="button" onClick={onLoad} className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline">
        <AlertCircle className="h-3.5 w-3.5" />Retry
      </button>
    );
  }

  if (row.reviewStatus === "loaded" && row.topReview) {
    const r = row.topReview;
    return (
      <div className="space-y-1">
        <p className="line-clamp-3 text-xs leading-relaxed text-foreground">
          <Quote className="mr-1 inline h-3 w-3 text-muted-foreground" aria-hidden />
          {r.snippet}
        </p>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate font-medium">— {r.author}{r.rating !== null && <span className="ml-1 inline-flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-warning text-warning" />{r.rating}</span>}</span>
          {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">View<ExternalLink className="h-2.5 w-2.5" /></a>}
        </div>
      </div>
    );
  }

  return (
    <button type="button" onClick={onLoad} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary">
      <MessageSquareQuote className="h-3.5 w-3.5" />
      Load review
    </button>
  );
}
