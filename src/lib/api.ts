import type { Level } from "@/data/levels";
import type { AlgorithmId, SortOrder, SortStep } from "@/algorithms/types";

/**
 * Client for the optional Java (Spring Boot) backend.
 *
 * The Java engine is an enhancement: when it is reachable, sorting steps and
 * quiz scoring are computed on the Java server (the JVM is the authority).
 * When it is not reachable (for example the deployed Vercel site), every
 * call site falls back to the identical in-browser TypeScript engine, so the
 * app keeps working with zero network dependency.
 */

const JAVA_BACKEND_URL = (
  import.meta.env.VITE_JAVA_BACKEND_URL as string | undefined
)?.replace(/\/+$/, "") ?? "http://localhost:8080";

type BackendStatus = "unknown" | "up" | "down";

let status: BackendStatus = "unknown";
let healthCheck: Promise<boolean> | null = null;

/** Singleton health probe with a short timeout; repeated callers share one check. */
export function detectJavaBackend(): Promise<boolean> {
  if (status !== "unknown") return Promise.resolve(status === "up");
  if (healthCheck) return healthCheck;

  healthCheck = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${JAVA_BACKEND_URL}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`health ${res.status}`);
      const data = (await res.json()) as { status?: string };
      status = data.status === "ok" ? "up" : "down";
    } catch {
      status = "down";
    }
    return status === "up";
  })();

  return healthCheck;
}

export function isJavaBackendAvailable(): boolean {
  return status === "up";
}

export function getJavaBackendUrl(): string {
  return JAVA_BACKEND_URL;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${JAVA_BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return (await res.json()) as T;
}

/**
 * Computes sorting steps on the Java server. Returns null when the backend is
 * down or unreachable so the caller can fall back to the in-browser engine.
 */
export async function fetchSortSteps(
  array: number[],
  algorithm: AlgorithmId,
  order: SortOrder
): Promise<SortStep[] | null> {
  if (!isJavaBackendAvailable()) return null;
  try {
    return await postJson<SortStep[]>("/api/sort", { array, algorithm, order });
  } catch {
    status = "down";
    return null;
  }
}

export interface QuizAnswer {
  questionId: string;
  selected: number;
}

export interface JavaQuizScore {
  score: number;
  total: number;
  passed: boolean;
  xp: number;
  xpReward: number;
  checked: { questionId: string; selected: number; correct: boolean }[];
}

/**
 * Scores a quiz on the Java server using the authoritative answer key.
 * Returns null (not an error) when the backend is unreachable.
 */
export async function fetchQuizScore(
  levelId: number,
  answers: QuizAnswer[]
): Promise<JavaQuizScore | null> {
  if (!isJavaBackendAvailable()) return null;
  try {
    return await postJson<JavaQuizScore>("/api/quiz/score", { levelId, answers });
  } catch {
    status = "down";
    return null;
  }
}

/** Loads the Java level catalog when the backend is reachable, else null. */
export async function fetchLevels(): Promise<Level[] | null> {
  if (!isJavaBackendAvailable()) return null;
  try {
    const res = await fetch(`${JAVA_BACKEND_URL}/api/levels`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`levels -> ${res.status}`);
    return (await res.json()) as Level[];
  } catch {
    status = "down";
    return null;
  }
}