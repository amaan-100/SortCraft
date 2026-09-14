import { useState } from "react";
import { Check, History, RotateCcw, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  enrichWithQuestions,
  formatAttemptDate,
  resultMessage,
  type QuizAttempt,
} from "@/utils/quizAnswers";
import { cn } from "@/utils/cn";

/**
 * Read-only list of previous quiz attempts for a level, with full answer review.
 * Each attempt can be expanded to show every selected answer, whether it was
 * correct, and the question's explanation. Retakes are triggered by the parent.
 */
export function QuizHistory({
  levelId,
  attempts,
  loading,
  error,
  onRetake,
}: {
  levelId: number;
  attempts: QuizAttempt[];
  loading: boolean;
  error?: string | null;
  onRetake: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(
    attempts.length > 0 ? attempts[0].id : null
  );

  return (
    <Card className="min-w-0">
      <CardHeader
        title="Previous attempts"
        icon={<History className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        action={
          attempts.length > 0 ? (
            <Button variant="outline" size="sm" onClick={onRetake}>
              <RotateCcw className="h-4 w-4" />
              Retake quiz
            </Button>
          ) : undefined
        }
      />
      <div className="p-4">
        {loading ? (
          <p className="animate-pulse text-sm text-slate-400">
            Loading your attempts…
          </p>
        ) : error ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            {error}
          </p>
        ) : attempts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No previous attempts yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((attempt) => {
              const isOpen = expanded === attempt.id;
              const review = enrichWithQuestions(attempt.answers, levelId);
              return (
                <li key={attempt.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setExpanded(isOpen ? null : attempt.id)}
                    aria-expanded={isOpen}
                    className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block font-medium",
                          attempt.passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-700 dark:text-slate-200"
                        )}
                      >
                        {resultMessage(attempt)}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-500">
                        {formatAttemptDate(attempt.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {isOpen ? "Hide" : "Review"}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="space-y-3 border-t border-slate-200 px-3 py-3 dark:border-slate-800">
                      {review.map((item, i) => (
                        <li key={item.questionId}>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {i + 1}. {item.question?.prompt ?? item.questionId}
                          </p>
                          <p
                            className={cn(
                              "mt-1 flex items-center gap-1.5 text-xs",
                              item.correct
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {item.correct ? (
                              <Check className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 shrink-0" />
                            )}
                            Your answer:{" "}
                            {item.question?.options[item.selected] ??
                              `option ${item.selected + 1}`}
                            {!item.correct && item.answerIndex !== undefined && (
                              <>
                                {" "}
                                · correct: {item.question?.options[item.answerIndex]}
                              </>
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {item.explanation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
