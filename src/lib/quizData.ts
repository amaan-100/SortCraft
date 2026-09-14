import { supabase } from "@/lib/supabase";
import type { QuizAttempt } from "@/utils/quizAnswers";
import { parseAnswerJson } from "@/utils/quizAnswers";

/**
 * Reads a level's previous quiz attempts (most recent first). RLS in the
 * migration restricts rows to the authenticated caller. Returns [] when
 * Supabase is not configured or the read fails (safe, non-fatal).
 */
export interface QuizAttemptLoadResult {
  attempts: QuizAttempt[];
  error: string | null;
}

export async function loadQuizAttempts(levelId: number): Promise<QuizAttemptLoadResult> {
  if (!supabase) {
    return { attempts: [], error: "Supabase is not connected." };
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      "id, level_id, algorithm_slug, score, total_questions, passed, answers, created_at"
    )
    .eq("level_id", levelId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn(`[SortCraft/loadQuizAttempts] ${error?.message ?? "no data"}`);
    return {
      attempts: [],
      error:
        "Could not load previous attempts. Apply the latest migration if quiz history is not set up yet.",
    };
  }

  const attempts = data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      levelId: r.level_id as number,
      algorithmSlug: (r.algorithm_slug as string | null) ?? null,
      score: r.score as number,
      total: r.total_questions as number,
      passed: r.passed as boolean,
      answers: parseAnswerJson(r.answers),
      createdAt: (r.created_at as string) ?? new Date().toISOString(),
    };
  });
  return { attempts, error: null };
}
