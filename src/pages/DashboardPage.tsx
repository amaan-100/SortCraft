import { Link } from "react-router-dom";
import {
  Award,
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
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
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
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
          {icon}
        </span>
        <div>
          <p className="overline text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight">{value}</p>
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
          <p className="overline text-muted">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1.5 text-sm text-ink">
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
        <p className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-300">
          {syncError}
        </p>
      )}
      {loading && (
        <p className="mb-4 text-xs text-muted">Loading your saved progress…</p>
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

      <Panel
        dots={false}
        title="PROGRESS"
        className="mt-6"
        bodyClassName="p-4"
      >
        <XpBar
          totalXp={totalXp}
          xpAvailable={xpAvailable}
          completed={completedLevelIds.length}
          totalLevels={levels.length}
        />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          dots={false}
          title="CONTINUE LEARNING"
          className="lg:col-span-2 min-w-0"
          bodyClassName="space-y-4 p-4"
        >
          <div className="rounded-md border border-line bg-surface-2/40 p-4">
            <p className="overline text-brand-600 dark:text-brand-400">
              Up next · Level {nextLevel.id}
            </p>
            <h3 className="mt-1 text-base font-semibold">{nextLevel.title}</h3>
            <p className="mt-1 text-sm text-ink">{nextLevel.subtitle}</p>
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
                <p className="text-sm text-muted">
                  No quizzes taken yet — start with Level 1.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li
                      key={r.levelId}
                      className="flex items-center justify-between rounded-md border border-line bg-surface-2/40 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Level {r.levelId} ·{" "}
                        {levels.find((l) => l.id === r.levelId)?.title}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {r.bestScore}/{r.questions} · {r.xpEarned} XP
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </Panel>

        <Panel dots={false} title="LEVEL MAP">
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
                          : "bg-line-strong"
                    }`}
                  />
                  <span
                    className={
                      unlocked ? "text-fg/80" : "text-muted"
                    }
                  >
                    {l.id}. {l.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Badges</h2>
        <BadgeGrid earned={earnedBadgeIds} />
      </section>

      <p className="mt-8 text-xs text-muted">
        Signed in as{" "}
        <span className="font-semibold text-fg">
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
