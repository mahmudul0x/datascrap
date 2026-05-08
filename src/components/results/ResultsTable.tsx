import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useSerpApi } from "@/hooks/useSerpApi";
import type { BusinessRow } from "@/utils/parseResults";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./TableSkeleton";
import { columnLabels } from "./ResultsToolbar";
import { TableRow } from "./TableRow";

type SortKey = keyof Pick<BusinessRow, "name" | "address" | "phone" | "email" | "website" | "specializations" | "websiteStatus" | "rating"> | "index" | "topReview";

type SortState = { key: SortKey; direction: "asc" | "desc" } | null;

const keys: SortKey[] = ["index", "name", "address", "phone", "email", "website", "specializations", "rating", "topReview", "websiteStatus"];

const defaultWidths: Record<string, number> = {
  index: 60, name: 220, address: 240, phone: 160, email: 200, website: 220, specializations: 240, rating: 140, topReview: 300, websiteStatus: 150,
};

export function ResultsTable({ rows, visible, sort, setSort }: { rows: BusinessRow[]; visible: Record<string, boolean>; sort: SortState; setSort: (sort: SortState) => void }) {
  const { selectedIds, setSelectedIds, nextStart, lastSearch, status, results } = useApp();
  const { scrape } = useSerpApi();
  const [widths, setWidths] = useState<Record<string, number>>(defaultWidths);
  const dragRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  // Show skeleton when actively scraping AND no rows yet (initial load)
  const showSkeleton = status === "scraping" && results.length === 0;

  useEffect(() => {
    const move = (event: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const next = Math.max(80, drag.startWidth + (event.clientX - drag.startX));
      setWidths((curr) => ({ ...curr, [drag.key]: next }));
    };
    const up = () => { dragRef.current = null; document.body.style.cursor = ""; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  const startResize = (key: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { key, startX: event.clientX, startWidth: widths[key] ?? defaultWidths[key] ?? 160 };
    document.body.style.cursor = "col-resize";
  };

  const visibleKeys = useMemo(() => keys.filter((k) => visible[k]), [visible]);

  if (showSkeleton) return <TableSkeleton rows={8} columns={visibleKeys.length + 1} />;
  if (!rows.length) return <div className="rounded-xl border border-border/60 bg-card shadow-soft"><EmptyState /></div>;

  const toggleSort = (key: SortKey) => {
    if (sort?.key !== key) setSort({ key, direction: "asc" });
    else if (sort.direction === "asc") setSort({ key, direction: "desc" });
    else setSort(null);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
        <div className="max-h-[calc(100vh-360px)] min-h-[420px] overflow-auto">
          <table className="border-separate border-spacing-0 text-left text-sm" style={{ width: "max-content", minWidth: "100%" }}>
            <thead className="sticky top-0 z-20 bg-surface-elevated/95 backdrop-blur text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-30 w-10 border-b border-r border-border/60 bg-surface-elevated/95 px-3 py-3.5"></th>
                {visibleKeys.map((key) => (
                  <Header
                    key={key}
                    label={columnLabels[key]}
                    active={sort?.key === key}
                    direction={sort?.direction}
                    width={widths[key] ?? defaultWidths[key]}
                    onClick={() => toggleSort(key)}
                    onResize={(event) => startResize(key, event)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  row={row}
                  index={index}
                  selected={selectedIds.includes(row.id)}
                  visible={visible}
                  widths={widths}
                  onToggle={() => setSelectedIds((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {nextStart !== null && lastSearch && (
        <div className="flex justify-center">
          <Button variant="outline" disabled={status === "scraping"} onClick={() => scrape({ ...lastSearch, start: nextStart })} className="h-10">
            <Plus className="h-3.5 w-3.5" />
            {status === "scraping" ? "Loading…" : "Load more results"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Header({ label, active, direction, width, onClick, onResize }: { label: string; active: boolean; direction?: "asc" | "desc"; width: number; onClick: () => void; onResize: (event: React.MouseEvent) => void }) {
  return (
    <th className="relative whitespace-nowrap border-b border-border/60 px-3 py-3.5 font-semibold" style={{ width, minWidth: width }}>
      <button className="inline-flex items-center gap-1.5 transition hover:text-foreground" onClick={onClick}>
        {label}
        {active ? direction === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
      </button>
      <span
        onMouseDown={onResize}
        className="absolute right-0 top-0 z-10 flex h-full w-1.5 cursor-col-resize items-center justify-center opacity-0 transition hover:opacity-100"
        title="Drag to resize"
      >
        <span className="h-1/2 w-0.5 rounded bg-primary/60" />
      </span>
    </th>
  );
}
