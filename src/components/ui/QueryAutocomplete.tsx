import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
};

export function QueryAutocomplete({ value, onChange, suggestions, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 60);
    const matches = suggestions.filter((item) => item.toLowerCase().includes(q));
    return matches.slice(0, 60);
  }, [value, suggestions]);

  useEffect(() => setActive(0), [value, open]);
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const select = (item: string) => {
    onChange(item);
    setOpen(false);
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
      } else {
        setOpen(false);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(event) => { onChange(event.target.value.slice(0, 160)); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-elevated">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" />{suggestions.length}+ suggestions</span>
            <span>{filtered.length} match</span>
          </div>
          {filtered.length > 0 ? (
            <ul ref={listRef} role="listbox" className="max-h-64 overflow-auto p-1 text-sm">
              {filtered.map((item, index) => (
                <li
                  key={item}
                  role="option"
                  aria-selected={index === active}
                  onMouseDown={(event) => { event.preventDefault(); select(item); }}
                  onMouseEnter={() => setActive(index)}
                  className={`cursor-pointer rounded-md px-2.5 py-1.5 ${index === active ? "bg-accent text-accent-foreground" : "text-foreground"}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-xs text-muted-foreground">
              No preset matches — press <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to use “{value.trim()}” as your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
