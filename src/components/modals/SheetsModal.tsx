import { useEffect, useState } from "react";
import { ExternalLink, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  initialUrl: string;
  initialSheetName: string;
  onClose: () => void;
  onSave: (url: string, sheetName: string) => void;
};

export function SheetsModal({ open, initialUrl, initialSheetName, onClose, onSave }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [name, setName] = useState(initialSheetName);

  useEffect(() => { if (open) { setUrl(initialUrl); setName(initialSheetName); } }, [open, initialUrl, initialSheetName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-background/85 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="relative w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 shadow-elevated">
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent" aria-label="Close"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-success/15 text-success"><FileSpreadsheet className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-2xl tracking-tight">Connect Google Sheet</h2>
            <p className="text-xs text-muted-foreground">Push scraped data straight into your spreadsheet via Apps Script.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Setup (one-time):</p>
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Open your Google Sheet → <span className="font-medium text-foreground">Extensions → Apps Script</span>.</li>
            <li>Paste the script below, save, then <span className="font-medium text-foreground">Deploy → New deployment → Web app</span>.</li>
            <li>Set access to <span className="font-medium text-foreground">“Anyone”</span>, deploy, copy the Web app URL, and paste it here.</li>
          </ol>
          <details className="mt-2 rounded-md border border-border bg-background/60 p-2">
            <summary className="cursor-pointer text-xs font-medium text-foreground">Show Apps Script code</summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-background p-2 text-[10px] leading-relaxed text-foreground">{`function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(body.sheetName) || ss.insertSheet(body.sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(body.headers);
  body.rows.forEach(r => sheet.appendRow(r));
  return ContentService.createTextOutput(JSON.stringify({ok:true, added: body.rows.length}))
    .setMimeType(ContentService.MimeType.JSON);
}`}</pre>
          </details>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Web app URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sheet tab name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="MapScraper"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <a href="https://developers.google.com/apps-script/guides/web" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            Apps Script docs <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="h-9">Cancel</Button>
            <Button disabled={!url.trim()} onClick={() => onSave(url.trim(), name.trim() || "MapScraper")} className="h-9">Save connection</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
