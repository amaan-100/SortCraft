import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Key,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { algorithms } from "@/algorithms";
import { badges as allBadges } from "@/data/badges";
import { getLevel, levels } from "@/data/levels";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Quiz, type QuizResult } from "@/components/quiz/Quiz";
import { ComplexityCard } from "@/components/visualizer/ComplexityCard";
import { AuthPrompt } from "@/components/auth/AuthPrompt";
import { QuizHistory } from "@/components/quiz/QuizHistory";
import { useProgress } from "@/context/ProgressContext";
import { useAuth } from "@/context/AuthContext";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function LevelDetailPage() {
  const { levelId } = useParams();
  const id = Number(levelId);
  const level = getLevel(id);
  const reduced = usePrefersReducedMotion();
  const { user } = useAuth();
  const { isLevelUnlocked, isLevelCompleted, submitQuiz } = useProgress();
  const {
    attempts,
    loading: attemptsLoading,
    error: attemptsError,
    reload,
  } = useQuizAttempts(id);

  const [quizKey, setQuizKey] = useState(0);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<{
    passed: boolean;
    xp: number;
    newBadges: string[];
    score: string;
    saved: boolean;
    error?: string;
  } | null>(null);

  if (!level) return <Navigate to="/levels" replace />;
  if (!isLevelUnlocked(level.id)) return <Navigate to="/levels" replace />;

  const algo = level.algorithm ? algorithms[level.algorithm] : null;
  const nextLevel = levels.find((l) => l.id === level.id + 1);

  /** Remount the quiz with fresh answer state while keeping prior attempts. */
  const retake = () => {
    setOutcome(null);
    setRequiresAuth(false);
    setSubmitting(false);
    setQuizKey((k) => k + 1);
  };

  const handleFinish = async (result: QuizResult) => {
    // Only persisted (and XP-awarding) submissions need an account.
    if (!user) {
      const previewPassed = result.total > 0 && result.correct / result.total >= 0.6;
      setRequiresAuth(true);
      setOutcome({
        passed: previewPassed,
        xp: 0,
        newBadges: [],
        score: `${result.correct}/${result.total}`,
        saved: false,
        error:
          "Not saved — create an account or log in to unlock the next level and earn XP.",
      });
      return;
    }

    setSubmitting(true);
    const res = await submitQuiz(level.id, result.answers);
    setSubmitting(false);
    if (res.requiresAuth) {
      setRequiresAuth(true);
      setOutcome({
        passed: false,
        xp: 0,
        newBadges: [],
        score: `${result.correct}/${result.total}`,
        saved: false,
        error: "Your session expired. Log in again to submit this attempt.",
      });
      return;
    }
    if (res.rejected) {
      setOutcome({
        passed: false,
        xp: 0,
        newBadges: [],
        score: `${result.correct}/${result.total}`,
        saved: false,
        error: res.message
          ? res.message
          : "Could not save your result. Please try again.",
      });
      return;
    }

    setRequiresAuth(false);
    setOutcome({
      passed: Boolean(res.outcome?.passed),
      xp: res.outcome?.xpAwarded ?? 0,
      newBadges: res.outcome?.newBadges ?? [],
      score: `${res.verifiedScore ?? result.correct}/${res.verifiedTotal ?? result.total}`,
      saved: true,
    });
    await reload();
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/levels"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to the learning path
      </Link>

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Level {level.id} · {level.xpReward} XP
          {isLevelCompleted(level.id) && " · completed"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {level.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {level.subtitle}
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Lesson"
              icon={<BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
            />
            <div className="space-y-4 p-4">
              {level.lesson.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>

          {algo && <ComplexityCard algorithm={algo} />}

          <Card className="min-w-0">
            <CardHeader
              title="Test yourself"
              icon={<Award className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
            />
            <div className="p-4">
              {requiresAuth ? (
                <AuthPrompt redirectTo={`/levels/${level.id}`} />
              ) : (
                <Quiz
                  key={quizKey}
                  questions={level.quiz}
                  onFinish={handleFinish}
                />
              )}
            </div>
          </Card>

          {submitting && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying and saving your quiz attempt…
            </div>
          )}

          <QuizHistory
            levelId={level.id}
            attempts={attempts}
            loading={attemptsLoading}
            error={attemptsError}
            onRetake={retake}
          />

          {outcome && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={
                  outcome.passed
                    ? "border-emerald-400 dark:border-emerald-500/50"
                    : "border-amber-400 dark:border-amber-500/50"
                }
              >
                <div className="p-4">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    {outcome.saved && outcome.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    )}
                    {!outcome.saved
                      ? `Quiz preview scored ${outcome.score}`
                      : outcome.passed
                        ? `Level ${level.id} complete — scored ${outcome.score}`
                      : `Scored ${outcome.score} — not quite yet`}
                  </h2>
                  {outcome.error && (
                    <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                      {outcome.error}
                    </p>
                  )}
                  {outcome.saved && outcome.xp > 0 && (
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                      +{outcome.xp} XP earned and saved.
                    </p>
                  )}
                  {outcome.newBadges.length > 0 && (
                    <p className="mt-1 text-sm text-violet-600 dark:text-violet-400">
                      New badge
                      {outcome.newBadges.length > 1 ? "s" : ""}:{" "}
                      {outcome.newBadges
                        .map((b) => allBadges.find((x) => x.id === b)?.name ?? b)
                        .join(", ")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {outcome.saved && outcome.passed && nextLevel && (
                      <Link to={`/levels/${nextLevel.id}`}>
                        <Button>
                          Continue to Level {nextLevel.id}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link to="/levels">
                      <Button variant="outline">Back to the path</Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="ghost">View dashboard</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader
              title="Key points"
              icon={<Key className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
            />
            <ul className="space-y-2 p-4 text-sm text-slate-700 dark:text-slate-300">
              {level.keyPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Practise it</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {algo
                ? `Step through ${algo.name} in the visualizer before taking the quiz.`
                : "Race several algorithms on the same array to see this lesson in action."}
            </p>
            <Link
              to={algo ? `/visualizer?algo=${algo.id}` : "/compare"}
              className="mt-3 block"
            >
              <Button variant="outline" className="w-full justify-center">
                <Play className="h-4 w-4" />
                {algo ? `Open ${algo.name}` : "Open comparison lab"}
              </Button>
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
