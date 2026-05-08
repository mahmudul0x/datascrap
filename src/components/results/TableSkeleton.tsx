export function TableSkeleton({ rows = 8, columns = 8 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-panel">
      <div className="min-h-[420px] overflow-hidden">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-surface-elevated/95 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="border-b border-border/60 px-3 py-3.5">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/60">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-3 py-4">
                    <div
                      className="h-3 animate-pulse rounded bg-muted/30"
                      style={{ width: `${40 + ((rowIndex * 17 + colIndex * 23) % 50)}%`, animationDelay: `${(rowIndex * columns + colIndex) * 40}ms` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
