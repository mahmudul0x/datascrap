import { toast } from "sonner";
import { downloadTextFile, toCsv, rowsToMatrix, exportColumns } from "@/utils/exportCsv";
import { exportXlsx } from "@/utils/exportXlsx";
import type { BusinessRow } from "@/utils/parseResults";

export function useExport(rows: BusinessRow[]) {
  const exportCsv = () => {
    downloadTextFile(toCsv(rows), "mapscraper-results.csv", "text/csv;charset=utf-8");
    toast.success(`Exported ${rows.length} rows to CSV`);
  };

  const exportExcel = async () => {
    await exportXlsx(rows);
    toast.success(`Exported ${rows.length} rows to Excel`);
  };

  const copyClipboard = async () => {
    const text = [exportColumns, ...rowsToMatrix(rows)].map((row) => row.join("\t")).join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return { exportCsv, exportExcel, copyClipboard };
}
