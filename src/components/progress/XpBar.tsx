export function XpBar({
  totalXp,
  xpAvailable,
  completed,
  totalLevels,
}: {
  totalXp: number;
  xpAvailable: number;
  completed: number;
  totalLevels: number;
}) {
  const pct = xpAvailable > 0 ? Math.min((totalXp / xpAvailable) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {completed} of {totalLevels} levels complete
        </p>
        <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {totalXp} / {xpAvailable} XP
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
