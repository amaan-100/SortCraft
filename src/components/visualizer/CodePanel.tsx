import { useEffect, useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import type { Algorithm } from "@/algorithms/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

type Tab = "pseudocode" | "java";

export function CodePanel({
  algorithm,
  activeLine,
}: {
  algorithm: Algorithm;
  activeLine: number | null;
}) {
  const [tab, setTab] = useState<Tab>("pseudocode");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const code =
    tab === "pseudocode" ? algorithm.pseudocode.join("\n") : algorithm.javaCode;

  const handleCopy = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopyError("Copying is blocked by your browser. Select the code manually.");
    }
  };

  const javaLines = algorithm.javaCode.split("\n");

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(["pseudocode", "java"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                  tab === t
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {t === "java" ? "Java" : "Pseudocode"}
              </button>
            ))}
          </div>
        }
        icon={<Code2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
        action={
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        }
      />

      <div className="max-h-[360px] w-full min-w-0 max-w-full overflow-auto bg-slate-50 dark:bg-slate-950/60">
        <pre className="min-w-full font-mono text-[12px] leading-6">
          {(tab === "pseudocode" ? algorithm.pseudocode : javaLines).map((line, i) => {
            const highlighted = tab === "pseudocode" && activeLine === i;
            return (
              <div
                key={i}
                className={cn(
                  "flex gap-3 px-3",
                  highlighted
                    ? "bg-brand-500/15 text-brand-900 dark:text-brand-100"
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                <span
                  className={cn(
                    "w-6 shrink-0 select-none text-right text-slate-400 dark:text-slate-600",
                    highlighted && "font-bold text-brand-600 dark:text-brand-400"
                  )}
                >
                  {i + 1}
                </span>
                <code className="whitespace-pre">{line === "" ? " " : line}</code>
              </div>
            );
          })}
        </pre>
      </div>

      {copyError && (
        <p className="border-t border-slate-200 px-4 py-2 text-xs text-rose-600 dark:border-slate-800 dark:text-rose-400">
          {copyError}
        </p>
      )}
      {tab === "java" && (
        <p className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-500">
          Line highlighting follows the pseudocode tab during the animation.
        </p>
      )}
    </Card>
  );
}
