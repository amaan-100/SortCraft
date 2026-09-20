import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Animate a number toward `target` (eased, rAF-driven). Falls back to an
 * instant set when the user prefers reduced motion.
 */
export function useCountUp(target: number, duration = 600): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const valueRef = useRef(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      valueRef.current = target;
      return;
    }
    const from = valueRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      valueRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return value;
}