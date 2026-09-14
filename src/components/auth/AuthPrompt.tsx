import { Link } from "react-router-dom";
import { LogIn, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * Shown when a signed-out user attempts a protected learning action (submitting
 * a quiz / completing a level). Nothing is saved, no XP is awarded. The prompt
 * preserves the protected route so the user can return after logging in.
 */
export function AuthPrompt({
  redirectTo,
  message,
}: {
  redirectTo: string;
  message?: string;
}) {
  return (
    <Card className="w-full">
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Sign in to save your progress</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            {message ??
              "You can preview the lesson and questions, but quiz scores, XP and level progress are saved to your account. Log in or create a free account to continue."}
          </p>
        </div>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
          <Link
            to="/signup"
            state={{ from: redirectTo }}
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </Card>
  );
}
