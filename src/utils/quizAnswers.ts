import type { QuizQuestion } from "@/data/levels";
import { getQuestion } from "@/data/levels";

/** A single answer as saved to / read from the database. */
export interface AnswerRecord {
  questionId: string;
  selected: number;
  correct: boolean;
}

export interface ReviewItem extends AnswerRecord {
  question?: QuizQuestion;
  explanation?: string;
  answerIndex?: number;
}

export interface QuizAttempt {
  id: string;
  levelId: number;
  algorithmSlug: string | null;
  score: number;
  total: number;
  passed: boolean;
  answers: AnswerRecord[];
  createdAt: string;
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Sanitises arbitrary JSON from the database into typed answer records. */
export function parseAnswerJson(value: unknown): AnswerRecord[] {
  if (!Array.isArray(value)) return [];
  const records: AnswerRecord[] = [];
  for (const item of value) {
    if (!isJsonObject(item)) continue;
    const questionId = typeof item.questionId === "string" ? item.questionId : "";
    const selected = typeof item.selected === "number" ? item.selected : -1;
    const correct = item.correct === true;
    if (questionId.length === 0 || selected < 0) continue;
    records.push({ questionId, selected, correct });
  }
  return records;
}

/**
 * Enriches raw answer rows with the question's prompt/options so the history
 * view can re-render exactly what was asked and why an answer was right/wrong.
 * Questions are resolved by STABLE ID (never array position), so a reordered
 * quiz cannot corrupt saved history.
 */
export function enrichWithQuestions(
  answers: AnswerRecord[],
  levelId: number
): ReviewItem[] {
  return answers.map((answer) => {
    const question = getQuestion(levelId, answer.questionId);
    const defaultExplanation = question?.explanation ?? "Explanation unavailable.";
    return {
      ...answer,
      question,
      explanation: defaultExplanation,
      answerIndex: question?.answer,
    };
  });
}

export function formatAttemptDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function resultMessage(attempt: QuizAttempt): string {
  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  return `${attempt.passed ? "Passed" : "Not passed"} · ${pct}% (${attempt.score}/${attempt.total})`;
}

