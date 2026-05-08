import { CheckCircle2, Github, Lock, Menu, Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

export function Navbar() {
  const { apiKey, status, setModalOpen, setSidebarOpen, lightMode, setLightMode } = useApp();
  const scraping = status === "scraping";

  const statusContent = scraping
    ? { dotClass: "bg-primary animate-pulse", textClass: "text-primary", label: "Scraping" }
    : apiKey
      ? { dotClass: "bg-success", textClass: "text-foreground", label: "Connected" }
      : { dotClass: "bg-muted-foreground", textClass: "text-muted-foreground", label: "No API key" };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 glass px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu /></Button>
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-md bg-gradient-to-br from-primary to-chart-3 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 2 L4 7 L4 17 L12 22 L20 17 L20 7 Z" />
              <path d="M12 2 L12 22" />
              <path d="M4 7 L20 17" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-foreground">MapScraper</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Pro</span>
          </div>
        </a>
        <div className="ml-2 hidden h-5 w-px bg-border md:block" />
        <nav className="hidden items-center gap-1 md:flex">
          <span className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">Dashboard</span>
        </nav>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium sm:flex">
        <span className="relative flex h-2 w-2">
          {scraping && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${statusContent.dotClass}`} />
        </span>
        <span className={statusContent.textClass}>{statusContent.label}</span>
      </div>

      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" onClick={() => setLightMode(!lightMode)} aria-label="Toggle theme">{lightMode ? <Moon /> : <Sun />}</Button>
        <Button variant="ghost" size="icon" asChild aria-label="GitHub"><a href="https://github.com" target="_blank" rel="noreferrer"><Github /></a></Button>
        <Button variant="ghost" size="icon" onClick={() => setModalOpen(true)} aria-label="Settings"><Settings /></Button>
      </div>
    </header>
  );
}
