import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Clock, Lock, Sparkles } from "lucide-react";
import { levels } from "@/data/levels";
import { algorithms } from "@/algorithms";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
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
      <header className="mb-8">
        <p className="overline text-muted">Learn</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Learning path
        </h1>
        <p className="mt-1.5 text-sm text-ink">
          Ten levels, from “what is sorting?” to choosing the right algorithm. Pass a
          level’s quiz to unlock the next one.
        </p>
      </header>

      {syncError && (
        <p className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          {syncError}
        </p>
      )}

      <Panel dots={false} title="PROGRESS" className="mb-8" bodyClassName="p-4">
        <XpBar
          totalXp={totalXp}
          xpAvailable={xpAvailable}
          completed={completedLevelIds.length}
          totalLevels={levels.length}
        />
      </Panel>

      {/* The path — nodes on a vertical rail that stops at the last node. */}
      <ol className="relative">
        {levels.map((level, i) => {
          const unlocked = isLevelUnlocked(level.id);
          const completed = isLevelCompleted(level.id);
          const record = records[level.id];
          const algo = level.algorithm ? algorithms[level.algorithm] : null;

          const node = (
            <span
              aria-hidden
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs",
                completed
                  ? "border-brand-500 bg-brand-500 text-[#04201d]"
                  : unlocked
                    ? "border-brand-500 bg-surface text-brand-600 shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-brand-500)_12%,transparent)] dark:text-brand-400"
                    : "border-dashed border-line-strong bg-surface text-muted"
              )}
            >
              {completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : unlocked ? (
                level.id
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
            </span>
          );

          const body = (
            <div
              className={cn(
                "flex min-w-0 flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center",
                unlocked && !completed
                  ? "border-line bg-surface hover:border-line-strong"
                  : completed
                    ? "border-brand-500/40 bg-surface"
                    : "border-dashed border-line bg-surface-2/40"
              )}
            >
              <div className="min-w-0 flex-1">
                <h2
                  className={cn(
                    "text-sm font-semibold",
                    !unlocked && "text-ink"
                  )}
                >
                  Level {level.id} · {level.title}
                </h2>
                <p className="mt-0.5 text-xs text-ink">{level.subtitle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {level.minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {level.xpReward} XP
                  </span>
                  <span>{level.quiz.length} questions</span>
                  {algo && <span>visualizer: {algo.name}</span>}
                  {record && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      best {record.bestScore}/{record.questions}
                    </span>
                  )}
                </div>
              </div>

              {unlocked ? (
                <Button variant={completed ? "outline" : "secondary"} size="sm">
                  {completed ? "Review" : "Start"}
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 self-start rounded-md border border-line bg-surface-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted sm:self-center">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>
          );

          return (
            <li
              key={level.id}
              className={cn(
                "relative pb-5 pl-[56px]",
                i < levels.length - 1 && "rail-connector"
              )}
            >
              <span className="absolute left-0 top-1">{node}</span>
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