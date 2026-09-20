import { Link } from "react-router-dom";
import { LogIn, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-md border border-brand-500/40 bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-base font-semibold">Sign in to save your progress</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink">
          {message ??
            "You can preview the lesson and questions, but quiz scores, XP and level progress are saved to your account. Log in or create a free account to continue."}
        </p>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        <Link to="/login" state={{ from: redirectTo }}>
          <Button>
            <LogIn className="h-4 w-4" />
            Log in
          </Button>
        </Link>
        <Link to="/signup" state={{ from: redirectTo }}>
          <Button variant="outline">Sign up free</Button>
        </Link>
      </div>
    </div>
  );
}
