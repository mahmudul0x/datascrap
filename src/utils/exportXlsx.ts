import type { BusinessRow } from "./parseResults";
import { exportColumns, rowsToMatrix } from "./exportCsv";

declare global {
  interface Window {
    XLSX?: {
      utils: {
        aoa_to_sheet: (data: string[][]) => unknown;
        book_new: () => unknown;
        book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void;
      };
      writeFile: (workbook: unknown, filename: string) => void;
    };
  }
}

let sheetPromise: Promise<void> | null = null;

function loadSheetJs() {
  if (window.XLSX) return Promise.resolve();
  if (sheetPromise) return sheetPromise;
  sheetPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Excel export library failed to load."));
    document.head.appendChild(script);
  });
  return sheetPromise;
}

export async function exportXlsx(rows: BusinessRow[]) {
  await loadSheetJs();
  if (!window.XLSX) throw new Error("Excel export library unavailable.");
  const worksheet = window.XLSX.utils.aoa_to_sheet([exportColumns, ...rowsToMatrix(rows)]);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "MapScraper Results");
  window.XLSX.writeFile(workbook, "mapscraper-results.xlsx");
}
