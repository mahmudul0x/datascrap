import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, X, Search, Loader2 } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  fetchSuggestions?: (query: string) => Promise<string[]>;
  placeholder?: string;
};

export function LocationAutocomplete({ value, onChange, suggestions = [], fetchSuggestions, placeholder }: Props) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [chip, setChip] = useState(value);
  const [remote, setRemote] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    setDraft(value);
    setChip(value);
  }, [value]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced async fetch
  useEffect(() => {
    if (!fetchSuggestions) return;
    const q = draft.trim();
    if (q.length < 2) { setRemote([]); setLoading(false); return; }
    const id = requestRef.current + 1;
    requestRef.current = id;
    setLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const results = await fetchSuggestions(q);
        if (requestRef.current === id) setRemote(results);
      } catch {
        if (requestRef.current === id) setRemote([]);
      } finally {
        if (requestRef.current === id) setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [draft, fetchSuggestions]);

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const local = q ? suggestions.filter((item) => item.toLowerCase().includes(q)) : suggestions;
    const merged = [...remote, ...local.filter((item) => !remote.includes(item))];
    return merged.slice(0, 10);
  }, [draft, suggestions, remote]);

  useEffect(() => setActive(0), [draft, open]);
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const select = (item: string) => {
    setDraft(item);
    setChip(item);
    onChange(item);
    setOpen(false);
  };

  const clearChip = () => {
    setChip("");
    setDraft("");
    onChange("");
    setOpen(true);
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[active]) {
        event.preventDefault();
        select(filtered[active]);
      } else if (draft.trim()) {
        setChip(draft.trim());
        onChange(draft.trim());
        setOpen(false);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={draft}
          onChange={(event) => { setDraft(event.target.value.slice(0, 160)); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      {chip && (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
            <MapPin className="h-3 w-3" />
            <span className="max-w-[200px] truncate">{chip}</span>
            <button type="button" onClick={clearChip} className="rounded-full p-0.5 hover:bg-primary/20" aria-label="Clear location">
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-sm shadow-elevated"
        >
          {filtered.map((item, index) => (
            <li
              key={item}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => { event.preventDefault(); select(item); }}
              onMouseEnter={() => setActive(index)}
              className={`cursor-pointer rounded-md px-2.5 py-1.5 ${index === active ? "bg-accent text-accent-foreground" : "text-foreground"}`}
            >
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && filtered.length === 0 && draft.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-3 text-xs text-muted-foreground shadow-elevated">
          No matches — press <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to use “{draft.trim()}”.
        </div>
      )}
    </div>
  );
}
