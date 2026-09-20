const items = [
  { color: "bg-line-strong", label: "Unsorted" },
  { color: "bg-rose-500", label: "Comparing" },
  { color: "bg-amber-400", label: "Selected / key / range" },
  { color: "bg-violet-500", label: "Pivot" },
  { color: "bg-orange-500", label: "Swapping / moving" },
  { color: "bg-emerald-500", label: "In final position" },
];

export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-surface-2/40 px-4 py-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-[3px] ${item.color}`} aria-hidden />
          <span className="text-[11px] text-ink">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}