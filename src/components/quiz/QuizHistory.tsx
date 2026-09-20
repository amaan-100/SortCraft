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
          <p className="animate-pulse text-sm text-muted">Loading your attempts…</p>
        ) : error ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </p>
        ) : attempts.length === 0 ? (
          <p className="text-sm text-muted">No previous attempts yet.</p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((attempt) => {
              const isOpen = expanded === attempt.id;
              const review = enrichWithQuestions(attempt.answers, levelId);
              return (
                <li
                  key={attempt.id}
                  className="overflow-hidden rounded-md border border-line"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : attempt.id)}
                    aria-expanded={isOpen}
                    className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block font-medium",
                          attempt.passed
                            ? "text-emerald-500"
                            : "text-fg"
                        )}
                      >
                        {resultMessage(attempt)}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {formatAttemptDate(attempt.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {isOpen ? "Hide" : "Review"}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="space-y-3 border-t border-line px-3 py-3">
                      {review.map((item, i) => (
                        <li key={item.questionId}>
                          <p className="text-xs font-medium text-fg">
                            {i + 1}. {item.question?.prompt ?? item.questionId}
                          </p>
                          <p
                            className={cn(
                              "mt-1 flex items-center gap-1.5 text-xs",
                              item.correct
                                ? "text-emerald-500"
                                : "text-rose-500"
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
                          <p className="mt-1 text-xs leading-relaxed text-ink">
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