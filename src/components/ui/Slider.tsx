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
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-ink"
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-fg">
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
        className="w-full text-fg disabled:opacity-50"
      />
      {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}