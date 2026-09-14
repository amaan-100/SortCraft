import { useCallback, useEffect, useState } from "react";
import { loadQuizAttempts } from "@/lib/quizData";
import { useAuth } from "@/context/AuthContext";
import type { QuizAttempt } from "@/utils/quizAnswers";

interface QuizAttemptsStore {
  attempts: QuizAttempt[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Reads a level's previous attempts (most recent first). Saving lives in
 * ProgressContext (which owns XP / level state); this hook only re-fetches the
 * history list.
 */
export function useQuizAttempts(levelId: number): QuizAttemptsStore {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setAttempts([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await loadQuizAttempts(levelId);
    setAttempts(result.attempts);
    setError(result.error);
    setLoading(false);
  }, [levelId, userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { attempts, loading, error, reload };
}
