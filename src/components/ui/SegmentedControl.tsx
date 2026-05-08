type SegmentedControlProps<T extends string | number> = {
  value: T;
  options: T[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string | number>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-md border border-border/60 bg-background p-1">
      {options.map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-sm px-2 py-1.5 text-sm font-semibold tabular-nums transition ${value === option ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
