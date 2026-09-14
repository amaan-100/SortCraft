import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Lock, PlayCircle, Sparkles } from "lucide-react";
import { levels } from "@/data/levels";
import { algorithms } from "@/algorithms";
import { Card } from "@/components/ui/Card";
import { XpBar } from "@/components/progress/XpBar";
import { useProgress } from "@/context/ProgressContext";
import { cn } from "@/utils/cn";

export default function LevelsPage() {
  const {
    isLevelUnlocked,
    isLevelCompleted,
    levels: records,
    totalXp,
    xpAvailable,
    completedLevelIds,
    syncError,
  } = useProgress();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Learning path</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ten levels, from “what is sorting?” to choosing the right algorithm. Pass a
          level’s quiz to unlock the next one.
        </p>
      </header>

      {syncError && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          {syncError}
        </p>
      )}

      <Card className="mb-6 p-4">
        <XpBar
          totalXp={totalXp}
          xpAvailable={xpAvailable}
          completed={completedLevelIds.length}
          totalLevels={levels.length}
        />
      </Card>

      <ol className="space-y-3">
        {levels.map((level) => {
          const unlocked = isLevelUnlocked(level.id);
          const completed = isLevelCompleted(level.id);
          const record = records[level.id];
          const algo = level.algorithm ? algorithms[level.algorithm] : null;

          const body = (
            <div
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center",
                unlocked
                  ? "border-slate-200 bg-white hover:border-brand-400 dark:border-slate-800 dark:bg-slate-900"
                  : "border-dashed border-slate-300 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40"
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  completed
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : unlocked
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                )}
              >
                {completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : unlocked ? (
                  level.id
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <h2
                  className={cn(
                    "text-sm font-semibold",
                    !unlocked && "text-slate-500 dark:text-slate-500"
                  )}
                >
                  Level {level.id} · {level.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {level.subtitle}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {level.minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {level.xpReward} XP
                  </span>
                  <span>{level.quiz.length} questions</span>
                  {algo && <span>Visualizer: {algo.name}</span>}
                  {record && (
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      best {record.bestScore}/{record.questions}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={cn(
                  "inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-medium sm:self-center",
                  unlocked
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                )}
              >
                {unlocked ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    {completed ? "Review" : "Start"}
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Locked
                  </>
                )}
              </span>
            </div>
          );

          return (
            <li key={level.id}>
              {unlocked ? (
                <Link to={`/levels/${level.id}`} className="block">
                  {body}
                </Link>
              ) : (
                <div
                  title={`Complete Level ${level.id - 1} to unlock`}
                  className="cursor-not-allowed"
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
