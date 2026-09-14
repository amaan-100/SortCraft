import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { evaluateBadges } from "@/data/badges";
import { PASS_RATIO, TOTAL_XP_AVAILABLE, levels } from "@/data/levels";
import { supabase } from "@/lib/supabase";
import type { AnswerRecord } from "@/utils/quizAnswers";
import { useAuth } from "./AuthContext";

export interface LevelRecord {
  levelId: number;
  bestScore: number;
  questions: number;
  xpEarned: number;
  completedAt: string;
}

export interface QuizSubmitResult {
  /** True when the user must log in before anything is saved. */
  requiresAuth: boolean;
  /** True when the database (RLS / RPC) rejected the write. */
  rejected: boolean;
  message?: string;
  outcome: CompleteLevelResult | null;
  verifiedScore?: number;
  verifiedTotal?: number;
}

export interface ProgressData {
  levels: Record<number, LevelRecord>;
  usedComparison: boolean;
}

export interface CompleteLevelResult {
  passed: boolean;
  xpAwarded: number;
  newBadges: string[];
  unlockedNextLevel: number | null;
}

interface ProgressContextValue extends ProgressData {
  loading: boolean;
  syncError: string | null;
  totalXp: number;
  xpAvailable: number;
  completedLevelIds: number[];
  perfectQuizzes: number;
  earnedBadgeIds: string[];
  highestUnlockedLevel: number;
  isLevelUnlocked: (levelId: number) => boolean;
  isLevelCompleted: (levelId: number) => boolean;
  submitQuiz: (levelId: number, answers: AnswerRecord[]) => Promise<QuizSubmitResult>;
  refreshProgress: () => Promise<void>;
  markComparisonUsed: () => void;
  resetProgress: () => Promise<void>;
}

const EMPTY: ProgressData = { levels: {}, usedComparison: false };

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const storageKey = (userId: string | null) =>
  `sortcraft-progress-${userId ?? "guest"}`;

function readLocal(userId: string | null): ProgressData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    return {
      levels: parsed.levels ?? {},
      usedComparison: Boolean(parsed.usedComparison),
    };
  } catch {
    return EMPTY;
  }
}

function writeLocal(userId: string | null, data: ProgressData) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    /* storage may be unavailable (private mode) — progress stays in memory */
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, refreshProfile } = useAuth();
  const userId = user?.id ?? null;
  const hasIdentity = Boolean(userId);

  const [data, setData] = useState<ProgressData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hydrated = useRef(false);

  /** Load progress for the active identity (remote first, local fallback). */
  useEffect(() => {
    let cancelled = false;
    hydrated.current = false;

    // Guest progress from older builds is intentionally left in localStorage
    // but never loaded or advanced. Signed-out visitors only preview lessons.
    const local = userId ? readLocal(userId) : EMPTY;

    const hydrate = async () => {
      if (!supabase || !userId) {
        if (!cancelled) {
          setData(local);
          hydrated.current = true;
        }
        return;
      }

      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("level_progress")
          .select("level_id,best_score,questions,xp_earned,completed_at")
          .eq("user_id", userId);
        if (error) throw error;

        const remote: ProgressData = { levels: {}, usedComparison: local.usedComparison };
        (rows ?? []).forEach((row) => {
          remote.levels[row.level_id as number] = {
            levelId: row.level_id as number,
            bestScore: row.best_score as number,
            questions: row.questions as number,
            xpEarned: row.xp_earned as number,
            completedAt: (row.completed_at as string) ?? new Date().toISOString(),
          };
        });

        if (!cancelled) {
          setData(remote);
          writeLocal(userId, remote);
          hydrated.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setSyncError(
            err instanceof Error
              ? `Could not load saved progress (${err.message}). Using this device's local copy.`
              : "Could not load saved progress. Using this device's local copy."
          );
          setData(local);
          hydrated.current = true;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ---- derived values -----------------------------------------------------
  const records = useMemo(() => Object.values(data.levels), [data.levels]);
  const completedLevelIds = useMemo(
    () =>
      records
        .filter((r) => r.questions > 0 && r.bestScore / r.questions >= PASS_RATIO)
        .map((r) => r.levelId)
        .sort((a, b) => a - b),
    [records]
  );
  const totalXp = useMemo(
    () => records.reduce((sum, r) => sum + r.xpEarned, 0),
    [records]
  );
  const perfectQuizzes = useMemo(
    () => records.filter((r) => r.questions > 0 && r.bestScore === r.questions).length,
    [records]
  );
  const earnedBadgeIds = useMemo(
    () =>
      evaluateBadges({
        completedLevelIds,
        totalXp,
        perfectQuizzes,
        usedComparison: data.usedComparison,
      }),
    [completedLevelIds, totalXp, perfectQuizzes, data.usedComparison]
  );
  const highestUnlockedLevel = useMemo(() => {
    let unlocked = 1;
    for (const level of levels) {
      if (completedLevelIds.includes(level.id)) unlocked = Math.min(level.id + 1, levels.length);
      else break;
    }
    return unlocked;
  }, [completedLevelIds]);

  const isLevelUnlocked = useCallback(
    (levelId: number) =>
      !hasIdentity || levelId === 1 || completedLevelIds.includes(levelId - 1),
    [hasIdentity, completedLevelIds]
  );
  const isLevelCompleted = useCallback(
    (levelId: number) => completedLevelIds.includes(levelId),
    [completedLevelIds]
  );

  /** Re-fetches level_progress rows and the profile totals. */
  const refreshProgressInternal = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data: rows, error } = await supabase
      .from("level_progress")
      .select("level_id, best_score, questions, xp_earned, completed_at")
      .eq("user_id", userId);

    if (error) {
      setSyncError("Could not refresh progress from Supabase. Your last saved view is still shown.");
      return;
    }

    if (rows) {
      setData((prev) => {
        const next: ProgressData = { ...prev, levels: {} };
        for (const row of rows as Array<Record<string, unknown>>) {
          const lid = row.level_id as number;
          next.levels[lid] = {
            levelId: lid,
            bestScore: row.best_score as number,
            questions: row.questions as number,
            xpEarned: row.xp_earned as number,
            completedAt: (row.completed_at as string) ?? new Date().toISOString(),
          };
        }
        writeLocal(userId, next);
        return next;
      });
    }
    await refreshProfile();
    setSyncError(null);
  }, [userId, refreshProfile]);

  const refreshProgress = useCallback(async () => {
    await refreshProgressInternal();
  }, [refreshProgressInternal]);

  /**
   * Authoritative submission path. The browser supplies selected options, but
   * the RPC recomputes score, pass/fail and XP from its protected answer key.
   */
  const submitQuiz = useCallback<ProgressContextValue["submitQuiz"]>(
    async (levelId, answers) => {
      if (!hasIdentity) {
        return { requiresAuth: true, rejected: false, outcome: null };
      }
      if (!supabase) {
        return {
          requiresAuth: false,
          rejected: true,
          message: "Supabase is not connected.",
          outcome: null,
        };
      }

      // `correct` is deliberately omitted. The hardened function derives score,
      // pass/fail and XP from questionId + selected; the browser cannot supply
      // any result or reward fields to the RPC.
      const selectedAnswers = answers.map(({ questionId, selected }) => ({
        questionId,
        selected,
      }));

      const { data: raw, error } = await supabase.rpc("record_quiz_attempt", {
        p_level_id: levelId,
        p_answers: selectedAnswers,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        const missingRpc = msg.includes("function") || msg.includes("schema cache");
        const rejected =
          msg.includes("not authenticated") ||
          msg.includes("locked") ||
          msg.includes("permission") ||
          msg.includes("invalid");
        return {
          requiresAuth: false,
          rejected: true,
          message: missingRpc
            ? "Quiz saving is not ready. Apply the latest Supabase migrations, then try again."
            : rejected
              ? "Supabase rejected this attempt because it was unauthorised, locked, or invalid."
              : "Could not save this attempt. Please try again.",
          outcome: null,
        };
      }

      const payload =
        typeof raw === "object" && raw !== null
          ? (raw as Record<string, unknown>)
          : {};
      const progress =
        typeof payload.progress === "object" && payload.progress !== null
          ? (payload.progress as Record<string, unknown>)
          : {};
      const score = Number(payload.score);
      const total = Number(payload.total);
      const passed = payload.passed === true;
      const xpAwarded = Math.max(Number(payload.xp_awarded) || 0, 0);
      const bestScore = Number(progress.best_score);
      const questions = Number(progress.questions);
      const xpEarned = Number(progress.xp_earned);

      if (![score, total, bestScore, questions, xpEarned].every(Number.isFinite)) {
        await refreshProgressInternal();
        return {
          requiresAuth: false,
          rejected: true,
          message: "The attempt was saved, but its result could not be read. Refresh to try again.",
          outcome: null,
        };
      }

      const record: LevelRecord = {
        levelId,
        bestScore,
        questions,
        xpEarned,
        completedAt:
          typeof progress.completed_at === "string"
            ? progress.completed_at
            : new Date().toISOString(),
      };
      const next: ProgressData = {
        ...data,
        levels: { ...data.levels, [levelId]: record },
      };

      const completedAfter = Object.values(next.levels)
        .filter((item) => item.questions > 0 && item.bestScore / item.questions >= PASS_RATIO)
        .map((item) => item.levelId);
      const badgesAfter = evaluateBadges({
        completedLevelIds: completedAfter,
        totalXp: Object.values(next.levels).reduce((sum, item) => sum + item.xpEarned, 0),
        perfectQuizzes: Object.values(next.levels).filter(
          (item) => item.questions > 0 && item.bestScore === item.questions
        ).length,
        usedComparison: next.usedComparison,
      });

      setData(next);
      writeLocal(userId, next);
      await refreshProfile();
      setSyncError(null);

      return {
        requiresAuth: false,
        rejected: false,
        verifiedScore: score,
        verifiedTotal: total,
        outcome: {
          passed,
          xpAwarded,
          newBadges: badgesAfter.filter((badge) => !earnedBadgeIds.includes(badge)),
          unlockedNextLevel:
            passed && levelId < levels.length && !completedLevelIds.includes(levelId)
              ? levelId + 1
              : null,
        },
      };
    },
    [
      hasIdentity,
      data,
      userId,
      refreshProfile,
      refreshProgressInternal,
      earnedBadgeIds,
      completedLevelIds,
    ]
  );

  const markComparisonUsed = useCallback(() => {
    if (!hasIdentity) return;
    setData((prev) => {
      if (prev.usedComparison) return prev;
      const next = { ...prev, usedComparison: true };
      writeLocal(userId, next);
      return next;
    });
  }, [hasIdentity, userId]);

  const resetProgress = useCallback(async () => {
    if (supabase && userId) {
      const { error } = await supabase.rpc("reset_learning_progress");
      if (error) {
        setSyncError("Could not reset progress. Nothing was removed; please try again.");
        return;
      }
    }
    setData(EMPTY);
    writeLocal(userId, EMPTY);
    await refreshProfile();
    setSyncError(null);
  }, [userId, refreshProfile]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      ...data,
      loading,
      syncError,
      totalXp,
      xpAvailable: TOTAL_XP_AVAILABLE,
      completedLevelIds,
      perfectQuizzes,
      earnedBadgeIds,
      highestUnlockedLevel,
      isLevelUnlocked,
      isLevelCompleted,
      submitQuiz,
      refreshProgress,
      markComparisonUsed,
      resetProgress,
    }),
    [
      data,
      loading,
      syncError,
      totalXp,
      completedLevelIds,
      perfectQuizzes,
      earnedBadgeIds,
      highestUnlockedLevel,
      isLevelUnlocked,
      isLevelCompleted,
      submitQuiz,
      refreshProgress,
      markComparisonUsed,
      resetProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside a ProgressProvider");
  return ctx;
}
