import type { ReactNode } from "react";
import { BarChart3, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { configured } = useAuth();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <BarChart3 className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      {!configured && (
        <div className="mb-4 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            Supabase environment variables are missing. Add{" "}
            <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to a{" "}
            <code className="font-mono">.env</code> file to enable accounts. The
            visualizer works without an account.
          </p>
        </div>
      )}

      <Card className="p-6">{children}</Card>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        {footer}
      </div>
    </div>
  );
}
