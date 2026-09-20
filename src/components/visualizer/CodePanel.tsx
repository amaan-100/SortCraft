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
          <div className="flex items-center gap-0.5 rounded-md border border-line bg-surface-2 p-0.5">
            {(["pseudocode", "java"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn(
                  "rounded px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors",
                  tab === t
                    ? "bg-brand-500 text-[#04201d]"
                    : "text-ink hover:text-fg"
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
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-2 hover:text-fg"
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

      <div className="max-h-[360px] w-full min-w-0 max-w-full overflow-auto bg-canvas">
        <pre className="min-w-full font-mono text-[12px] leading-6">
          {(tab === "pseudocode" ? algorithm.pseudocode : javaLines).map((line, i) => {
            const highlighted = tab === "pseudocode" && activeLine === i;
            return (
              <div
                key={i}
                className={cn(
                  "flex gap-3 px-3",
                  highlighted
                    ? "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                    : "text-ink"
                )}
              >
                <span
                  className={cn(
                    "w-6 shrink-0 select-none text-right text-muted",
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
        <p className="border-t border-line px-4 py-2 text-xs text-rose-500">
          {copyError}
        </p>
      )}
      {tab === "java" && (
        <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
          Line highlighting follows the pseudocode tab during the animation.
        </p>
      )}
    </Card>
  );
}