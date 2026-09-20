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
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-brand-500 text-[#04201d]">
          <BarChart3 className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink">{subtitle}</p>
      </div>

      {!configured && (
        <div className="mb-4 flex gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-300">
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
      <div className="mt-4 text-center text-sm text-muted">
        {footer}
      </div>
    </div>
  );
}
