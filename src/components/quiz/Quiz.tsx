import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CircleHelp, RotateCcw, Trophy, X } from "lucide-react";
import type { QuizQuestion } from "@/data/levels";
import { PASS_RATIO } from "@/data/levels";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { AnswerRecord } from "@/utils/quizAnswers";
import { cn } from "@/utils/cn";

export interface QuizResult {
  correct: number;
  total: number;
  /** Per-question answers keyed by STABLE question id (not array position). */
  answers: AnswerRecord[];
}

export function Quiz({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (result: QuizResult) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Per-question answers keyed by the question's stable id.
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const check = () => {
    if (choice === null) return;
    setRevealed(true);
    setAnswers((prev) => {
      const withoutCurrent = prev.filter((a) => a.questionId !== question.id);
      return [
        ...withoutCurrent,
        {
          questionId: question.id,
          selected: choice,
          correct: choice === question.answer,
        },
      ];
    });
  };

  const advance = () => {
    if (isLast) {
      const total = questions.length;
      const correct = answers.filter((a) => a.correct).length;
      setFinished(true);
      onFinish({ correct, total, answers });
      return;
    }
    setIndex((i) => i + 1);
    setChoice(null);
    setRevealed(false);
  };

  /** Fresh, empty answer state when the quiz is restarted. */
  const restart = () => {
    setIndex(0);
    setChoice(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    const ratio = correct / questions.length;
    const passed = ratio >= PASS_RATIO;
    return (
      <Card>
        <CardHeader
          title="Quiz results"
          icon={<Trophy className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        />
        <div className="p-6 text-center">
          <p
            className={cn(
              "text-4xl font-extrabold",
              passed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {correct} / {questions.length}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {passed
              ? "You reached the pass mark. Your saved result appears below after verification."
              : `You need at least ${Math.ceil(PASS_RATIO * questions.length)} correct answers to pass. Review the lesson and try again.`}
          </p>
          <Button variant="outline" className="mt-5" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
            Retake quiz
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={`Question ${index + 1} of ${questions.length}`}
        icon={<CircleHelp className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        action={
          <span className="font-mono text-xs text-slate-500">
            score {answers.filter((a) => a.correct).length}
          </span>
        }
      />
      <div className="p-4">
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>

        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {question.prompt}
        </p>

        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => {
            const isChoice = choice === i;
            const isAnswer = question.answer === i;
            const showCorrect = revealed && isAnswer;
            const showWrong = revealed && isChoice && !isAnswer;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setChoice(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  showCorrect
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : showWrong
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : isChoice
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50",
                  revealed && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    showCorrect
                      ? "border-emerald-500 text-emerald-600"
                      : showWrong
                        ? "border-rose-500 text-rose-600"
                        : "border-slate-300 text-slate-500 dark:border-slate-600"
                  )}
                >
                  {showCorrect ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : showWrong ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="text-slate-800 dark:text-slate-200">{option}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
          >
            <strong className="font-semibold">Why: </strong>
            {question.explanation}
          </motion.div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          {!revealed ? (
            <Button onClick={check} disabled={choice === null}>
              Check answer
            </Button>
          ) : (
            <Button onClick={advance}>{isLast ? "Finish quiz" : "Next question"}</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
