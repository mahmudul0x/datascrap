import { useEffect, useState } from "react";
import { toast } from "sonner";
import { exportColumns, rowsToMatrix } from "@/utils/exportCsv";
import type { BusinessRow } from "@/utils/parseResults";
import { useApp } from "@/context/AppContext";

const URL_KEY = "msp_sheets_url";
const NAME_KEY = "msp_sheets_name";

export function useSheetExport() {
  const { lastSearch } = useApp();
  const [url, setUrl] = useState("");
  const [sheetName, setSheetName] = useState("MapScraper");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setUrl(localStorage.getItem(URL_KEY) ?? "");
    setSheetName(localStorage.getItem(NAME_KEY) ?? "MapScraper");
  }, []);

  const save = (nextUrl: string, nextName: string) => {
    localStorage.setItem(URL_KEY, nextUrl);
    localStorage.setItem(NAME_KEY, nextName);
    setUrl(nextUrl);
    setSheetName(nextName);
    toast.success("Google Sheet connection saved");
  };

  const sendToSheet = async (rows: BusinessRow[]) => {
    if (!url) {
      toast.error("Connect a Google Sheet webhook first");
      return false;
    }
    if (!rows.length) {
      toast.error("No rows to send");
      return false;
    }
    setSending(true);
    try {
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: url,
          sheetName,
          headers: exportColumns,
          rows: rowsToMatrix(rows),
          meta: { query: lastSearch?.query ?? "", location: lastSearch?.location ?? "" },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) throw new Error(data.error ?? "Failed to push to sheet");
      toast.success(`Pushed ${rows.length} rows to Google Sheet`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to push to sheet");
      return false;
    } finally {
      setSending(false);
    }
  };

  return { url, sheetName, sending, save, sendToSheet, isConnected: Boolean(url) };
}
