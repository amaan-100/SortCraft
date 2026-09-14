const items = [
  { color: "bg-slate-400 dark:bg-slate-600", label: "Unsorted" },
  { color: "bg-rose-500", label: "Comparing" },
  { color: "bg-amber-400", label: "Selected / key / active range" },
  { color: "bg-violet-500", label: "Pivot" },
  { color: "bg-orange-500", label: "Swapping / moving" },
  { color: "bg-emerald-500", label: "In final position" },
];

export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
        >
          <span className={`h-3 w-3 rounded-sm ${item.color}`} aria-hidden />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
