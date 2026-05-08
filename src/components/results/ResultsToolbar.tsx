import { ChevronDown, ClipboardCopy, Download, FileSpreadsheet, Trash2, Columns3, Search, Loader2, Globe2, GlobeLock, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";
import { useExport } from "@/hooks/useExport";
import { useSheetExport } from "@/hooks/useSheetExport";
import type { BusinessRow } from "@/utils/parseResults";

export const columnLabels = { index: "#", name: "Firm Name", address: "Address", phone: "Phone", email: "Email", website: "Website", specializations: "Specializations", rating: "Google Rating", topReview: "Website Reviews", websiteStatus: "Website Status" };

export type WebsiteFilter = "all" | "with" | "without";

const filterOptions: { value: WebsiteFilter; label: string; icon: typeof LayoutGrid }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "with", label: "With website", icon: Globe2 },
  { value: "without", label: "No website", icon: GlobeLock },
];

type Props = {
  rows: BusinessRow[];
  filter: string;
  setFilter: (value: string) => void;
  visible: Record<string, boolean>;
  setVisible: (value: Record<string, boolean>) => void;
  websiteFilter: WebsiteFilter;
  setWebsiteFilter: (value: WebsiteFilter) => void;
};

export function ResultsToolbar({ rows, filter, setFilter, visible, setVisible, websiteFilter, setWebsiteFilter }: Props) {
  const { results, selectedIds, setSelectedIds, setResults, setIsDemo, setNextStart, setError } = useApp();
  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
  const exportRows = selectedRows.length ? selectedRows : rows;
  const { exportCsv, exportExcel, copyClipboard } = useExport(exportRows);
  const { sendToSheet, isConnected, sending } = useSheetExport();
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const clear = () => {
    setResults([]); setSelectedIds([]); setIsDemo(false); setNextStart(null); setError(""); toast.error("Results cleared");
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-card p-3 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter results…"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" className="h-10"><Columns3 className="h-4 w-4" /> Columns</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(columnLabels).map(([key, label]) => <DropdownMenuCheckboxItem key={key} checked={visible[key]} onCheckedChange={(checked) => setVisible({ ...visible, [key]: Boolean(checked) })}>{label}</DropdownMenuCheckboxItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {selectedIds.length} selected
            </span>
          )}
          <label className="flex h-10 items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground">
            <input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((row) => row.id) : [])} className="h-3.5 w-3.5 accent-primary" />
            Select all
          </label>
          <Button
            variant="outline"
            className="h-10"
            disabled={!exportRows.length || sending}
            onClick={() => sendToSheet(exportRows)}
            title={isConnected ? "Push to Google Sheet" : "Connect a Google Sheet first (sidebar → Integrations)"}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-success" />}
            Push to Sheet
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button disabled={!exportRows.length} className="h-10"><Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={exportCsv}><Download /> Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportExcel().catch((error) => toast.error(error.message))}><FileSpreadsheet /> Export Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyClipboard().catch(() => toast.error("Clipboard permission denied"))}><ClipboardCopy /> Copy to clipboard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={clear} disabled={!results.length} className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive" aria-label="Clear results"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
        <span className="mr-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Filter</span>
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const active = websiteFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setWebsiteFilter(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-border-strong hover:text-foreground"}`}
            >
              <Icon className="h-3 w-3" />{option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
