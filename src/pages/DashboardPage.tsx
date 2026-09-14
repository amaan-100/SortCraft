import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  SplitSquareHorizontal,
  Target,
  Trophy,
} from "lucide-react";
import { badges } from "@/data/badges";
import { levels } from "@/data/levels";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { BadgeGrid } from "@/components/progress/BadgeGrid";
import { XpBar } from "@/components/progress/XpBar";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
            {label}
          </p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { profile, displayName } = useAuth();
  const {
    totalXp,
    xpAvailable,
    completedLevelIds,
    earnedBadgeIds,
    highestUnlockedLevel,
    perfectQuizzes,
    levels: records,
    loading,
    syncError,
    resetProgress,
  } = useProgress();

  const name = displayName;
  const nextLevel =
    levels.find((l) => !completedLevelIds.includes(l.id)) ?? levels[levels.length - 1];

  const recent = Object.values(records)
    .sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {name} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Build your understanding, one algorithm at a time.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("Reset all level progress, XP and badges?"))
              void resetProgress();
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset progress
        </Button>
      </header>

      {syncError && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          {syncError}
        </p>
      )}
      {loading && (
        <p className="mb-4 text-xs text-slate-500">Loading your saved progress…</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Trophy className="h-5 w-5" />}
          label="Current level"
          value={highestUnlockedLevel}
        />
        <StatTile
          icon={<Sparkles className="h-5 w-5" />}
          label="Total XP"
          value={totalXp}
        />
        <StatTile
          icon={<Award className="h-5 w-5" />}
          label="Badges"
          value={`${earnedBadgeIds.length} / ${badges.length}`}
        />
        <StatTile
          icon={<Target className="h-5 w-5" />}
          label="Perfect quizzes"
          value={perfectQuizzes}
        />
      </div>

      <Card className="mt-6 p-4">
        <XpBar
          totalXp={totalXp}
          xpAvailable={xpAvailable}
          completed={completedLevelIds.length}
          totalLevels={levels.length}
        />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Continue learning"
            icon={<BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
          />
          <div className="space-y-4 p-4">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                Up next · Level {nextLevel.id}
              </p>
              <h3 className="mt-1 text-base font-semibold">{nextLevel.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {nextLevel.subtitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/levels/${nextLevel.id}`}>
                  <Button size="sm">
                    <Play className="h-4 w-4" />
                    {completedLevelIds.includes(nextLevel.id) ? "Review" : "Start"} level
                  </Button>
                </Link>
                <Link to="/levels">
                  <Button size="sm" variant="outline">
                    All levels
                  </Button>
                </Link>
                <Link to="/compare">
                  <Button size="sm" variant="ghost">
                    <SplitSquareHorizontal className="h-4 w-4" />
                    Comparison lab
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Recent activity</h3>
              {recent.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  No quizzes taken yet — start with Level 1.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li
                      key={r.levelId}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Level {r.levelId} ·{" "}
                        {levels.find((l) => l.id === r.levelId)?.title}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {r.bestScore}/{r.questions} · {r.xpEarned} XP
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Level map"
            icon={<Trophy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
          />
          <ul className="max-h-[360px] space-y-1.5 overflow-auto p-4 text-sm">
            {levels.map((l) => {
              const done = completedLevelIds.includes(l.id);
              const unlocked = l.id === 1 || completedLevelIds.includes(l.id - 1);
              return (
                <li key={l.id} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      done
                        ? "bg-emerald-500"
                        : unlocked
                          ? "bg-brand-500"
                          : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                  <span
                    className={
                      unlocked
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600"
                    }
                  >
                    {l.id}. {l.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Badges</h2>
        <BadgeGrid earned={earnedBadgeIds} />
      </section>

      <p className="mt-8 text-xs text-slate-500 dark:text-slate-500">
        Signed in as{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {displayName}
        </span>
        {profile?.username ? ` · @${profile.username}` : ""} ·{" "}
        <Link to="/settings" className="text-brand-600 hover:underline dark:text-brand-400">
          Account settings
        </Link>
      </p>
    </div>
  );
}
