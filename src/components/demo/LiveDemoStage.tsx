import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { useCountUp } from "@/hooks/useCountUp";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const BAR_COUNT = 16;
const WIDTH = 100 * (BAR_COUNT / (BAR_COUNT + 0.5));
const FRAME_MS = 28;
const HOLD_MS = 1800;

type Frame = {
  array: number[];
  compare: [number, number];
  swap: [number, number];
  comparisons: number;
  swaps: number;
};

function makeValues(count: number): number[] {
  return Array.from({ length: count }, () => Math.round(8 + Math.random() * 90));
}

/** Tiny bubble-sort frame recorder — self-contained, no engine dependency. */
function runBubble(values: number[]): Frame[] {
  const arr = [...values];
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      comparisons++;
      frames.push({ array: [...arr], compare: [j, j + 1], swap: [-1, -1], comparisons, swaps });
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swaps++;
        frames.push({ array: [...arr], compare: [-1, -1], swap: [j, j + 1], comparisons, swaps });
      }
    }
  }
  return frames;
}

function barColor(index: number, current: Frame, done: boolean): string {
  if (done) return "var(--color-brand-500)";
  if (current.swap[0] === index || current.swap[1] === index) return "#fb7185";
  if (current.compare[0] === index || current.compare[1] === index) return "#fbbf24";
  return "color-mix(in oklab, var(--color-brand-500) 26%, var(--line-strong))";
}

export function LiveDemoStage({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const initial = useMemo(() => makeValues(BAR_COUNT), []);
  const frames = useMemo(() => runBubble(initial), [initial]);
  const [frame, setFrame] = useState(reduced ? frames.length - 1 : 0);
  const ivRef = useRef<number | undefined>(undefined);
  const holdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (reduced) {
      setFrame(frames.length - 1);
      return;
    }
    if (frames.length === 0) return;
    const play = () => {
      setFrame(0);
      window.clearInterval(ivRef.current);
      ivRef.current = window.setInterval(() => {
        setFrame((f) => {
          if (f >= frames.length - 1) {
            window.clearInterval(ivRef.current);
            holdRef.current = window.setTimeout(play, HOLD_MS);
            return f;
          }
          return f + 1;
        });
      }, FRAME_MS);
    };
    play();
    return () => {
      window.clearInterval(ivRef.current);
      window.clearTimeout(holdRef.current);
    };
  }, [frames.length, reduced]);

  const current = frames[Math.min(frame, frames.length - 1)] ?? frames[frames.length - 1];
  const done = frame >= frames.length - 1;
  const progress = frames.length > 0 ? ((frame + 1) / frames.length) * 100 : 0;

  const steps = useCountUp(frame + 1, 140);
  const comparisons = useCountUp(current?.comparisons ?? 0, 140);
  const swaps = useCountUp(current?.swaps ?? 0, 140);

  return (
    <Panel
      className={className}
      title={`bubble.sort — n = ${BAR_COUNT}`}
      dots
      action={
        <span
          className={`font-mono text-[10px] ${
            done ? "text-brand-600 dark:text-brand-400" : "text-muted"
          }`}
        >
          {done ? "✔ sorted" : "scanning"}
        </span>
      }
    >
      <div className="relative flex h-44 items-end gap-1 bg-canvas px-4 pt-4" aria-hidden>
        {(current?.array ?? []).map((value, i) => (
          <div
            key={i}
            className="flex-1 origin-bottom rounded-t-[2px] transition-[height] duration-75 ease-out"
            style={{
              height: `${Math.max(3, (value / WIDTH) * 100)}%`,
              backgroundColor: current ? barColor(i, current, done) : "var(--line-strong)",
            }}
          />
        ))}
      </div>
      <div className="h-px bg-line">
        <div
          className="h-px bg-brand-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-2/40 px-4 py-2.5 font-mono text-[11px] text-ink">
        <span className="whitespace-nowrap">
          STEP <strong className="text-fg tabular-nums">{steps}</strong>
        </span>
        <span className="whitespace-nowrap">
          CMP <strong className="text-fg tabular-nums">{comparisons}</strong>
        </span>
        <span className="whitespace-nowrap">
          SWP <strong className="text-fg tabular-nums">{swaps}</strong>
        </span>
      </div>
    </Panel>
  );
}