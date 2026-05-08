import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";

export function ApiKeyModal() {
  const { apiKey, modalOpen, setModalOpen, setApiKeyValue } = useApp();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => setValue(apiKey), [apiKey, modalOpen]);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="border-border/60 bg-card text-card-foreground shadow-elevated sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="font-display text-2xl tracking-tight">Connect SerpAPI</DialogTitle>
          <DialogDescription className="text-sm">
            Your API key is stored locally in your browser. It is never sent to any third-party server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground" htmlFor="api-key">API key</label>
          <div className="flex h-11 rounded-md border border-input bg-background transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
            <input
              id="api-key"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              type={show ? "text" : "password"}
              className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
              placeholder="serp_•••••••••••"
            />
            <button type="button" onClick={() => setShow(!show)} className="px-3 text-muted-foreground transition hover:text-foreground" aria-label="Toggle key visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <a className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline" href="https://serpapi.com" target="_blank" rel="noreferrer">
            Get a free SerpAPI key
            <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex items-start gap-2.5 rounded-md border border-border/60 bg-secondary/40 p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Stored in <span className="font-mono text-foreground">localStorage</span>. Cleared anytime by signing out of your browser.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => value.trim() && setApiKeyValue(value.trim())}>Save & connect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
