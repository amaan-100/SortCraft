import { cn } from "@/utils/cn";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  valueLabel?: string;
  hint?: string;
  className?: string;
  id?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
  valueLabel,
  hint,
  className,
  id,
}: SliderProps) {
  const inputId = id ?? `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          {label}
        </label>
        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-slate-400 disabled:opacity-50"
      />
      {hint && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}
