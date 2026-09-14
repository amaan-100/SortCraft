import {
  Binary,
  Crown,
  Flame,
  Footprints,
  Layers,
  Lock,
  Sparkles,
  SplitSquareHorizontal,
  Target,
} from "lucide-react";
import { badges, type Badge } from "@/data/badges";
import { cn } from "@/utils/cn";

const icons: Record<Badge["icon"], typeof Crown> = {
  footprints: Footprints,
  layers: Layers,
  target: Target,
  split: SplitSquareHorizontal,
  binary: Binary,
  flame: Flame,
  crown: Crown,
  sparkles: Sparkles,
};

const tones: Record<Badge["tone"], string> = {
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
};

export function BadgeGrid({ earned }: { earned: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((badge) => {
        const Icon = icons[badge.icon];
        const unlocked = earned.includes(badge.id);
        return (
          <div
            key={badge.id}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              unlocked
                ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                : "border-dashed border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40"
            )}
          >
            <span
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
                unlocked
                  ? tones[badge.tone]
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
              )}
            >
              {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
            </span>
            <h3
              className={cn(
                "text-sm font-semibold",
                !unlocked && "text-slate-500 dark:text-slate-500"
              )}
            >
              {badge.name}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {unlocked ? badge.description : badge.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
