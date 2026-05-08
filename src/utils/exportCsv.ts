import type { BusinessRow } from "./parseResults";

export const exportColumns = ["#", "Firm Name", "Address", "Phone", "Email", "Website", "Specializations", "Google Rating", "Review Count", "Top Review", "Review Author", "Review Link", "Website Status"];

export function rowsToMatrix(rows: BusinessRow[]) {
  return rows.map((row, index) => [
    String(index + 1), row.name, row.address, row.phone || "—", row.email || "—", row.website || "—", row.specializations || "—",
    row.rating !== null ? row.rating.toFixed(1) : "—",
    row.reviews !== null ? String(row.reviews) : "—",
    row.topReview?.snippet || "—",
    row.topReview?.author || "—",
    row.topReview?.link || "—",
    row.websiteStatus === "none" ? "—" : row.websiteStatus,
  ]);
}

export function toCsv(rows: BusinessRow[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [exportColumns, ...rowsToMatrix(rows)].map((line) => line.map(escape).join(",")).join("\n");
}

export function downloadTextFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
