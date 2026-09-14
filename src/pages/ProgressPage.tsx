import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Circle, Lock, TrendingUp } from "lucide-react";
import { levels } from "@/data/levels";
import { badges } from "@/data/badges";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScrollableTable } from "@/components/ui/ScrollableTable";
import { BadgeGrid } from "@/components/progress/BadgeGrid";
import { XpBar } from "@/components/progress/XpBar";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";

export default function ProgressPage() {
  const { displayName } = useAuth();
  const {
    levels: records,
    totalXp,
    xpAvailable,
    completedLevelIds,
    earnedBadgeIds,
    isLevelUnlocked,
    loading,
    syncError,
  } = useProgress();

  const rows = levels.map((level) => ({
    level,
    record: records[level.id],
    unlocked: isLevelUnlocked(level.id),
    completed: completedLevelIds.includes(level.id),
  }));

  const hasAnyActivity = Object.keys(records).length > 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {displayName}’s progress
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Every level, quiz score and badge you have earned so far.
        </p>
      </header>

      {syncError && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          {syncError}
        </p>
      )}

      <Card className="mb-6 p-4">
        {loading ? (
          <div className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        ) : (
          <XpBar
            totalXp={totalXp}
            xpAvailable={xpAvailable}
            completed={completedLevelIds.length}
            totalLevels={levels.length}
          />
        )}
      </Card>

      <Card className="mb-6 min-w-0 max-w-full overflow-hidden">
        <CardHeader
          title="Level progress"
          icon={<TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        />
        {!hasAnyActivity ? (
          <div className="p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You haven’t completed any levels yet.
            </p>
            <Link to="/levels/1" className="mt-4 inline-block">
              <Button size="sm">Start Level 1</Button>
            </Link>
          </div>
        ) : (
          <ScrollableTable label="Level by level progress">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">
                Your status, best quiz score and XP earned for each of the ten levels.
              </caption>
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                <tr>
                  {["Level", "Status", "Best score", "XP", "Last attempt"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap px-4 py-2 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ level, record, unlocked, completed }) => (
                  <tr
                    key={level.id}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <th scope="row" className="px-4 py-2 text-left font-medium">
                      <span className="block min-w-[10rem] truncate">
                        {level.id}. {level.title}
                      </span>
                    </th>
                    <td className="whitespace-nowrap px-4 py-2">
                      {completed ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </span>
                      ) : unlocked ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Circle className="h-4 w-4" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
                          <Lock className="h-3.5 w-3.5" />
                          Locked
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-mono tabular-nums">
                      {record ? `${record.bestScore}/${record.questions}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-mono tabular-nums">
                      {record?.xpEarned ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                      {record
                        ? new Date(record.completedAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        )}
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Badges{" "}
          <span className="text-sm font-normal text-slate-500">
            ({earnedBadgeIds.length} of {badges.length})
          </span>
        </h2>
        <BadgeGrid earned={earnedBadgeIds} />
      </section>
    </div>
  );
}
