"use client";

type WheelColumnProps<T extends string | number> = {
  label: string;
  values: T[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
};

export function WheelColumn<T extends string | number>({
  label,
  values,
  value,
  disabled = false,
  onChange
}: WheelColumnProps<T>) {
  const index = Math.max(0, values.findIndex((item) => item === value));
  const previous = values[Math.max(0, index - 1)];
  const next = values[Math.min(values.length - 1, index + 1)];

  return (
    <div className={`flex-1 text-center ${disabled ? "opacity-35" : ""}`}>
      <p className="mb-2 text-[11px] text-tertiary">{label}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(previous)}
        className="h-8 w-full text-sm text-tertiary"
      >
        {previous}
      </button>
      <div className="border-y-hairline border-accent py-3 font-serif text-xl font-medium text-primary">
        {value}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(next)}
        className="h-8 w-full text-sm text-tertiary"
      >
        {next}
      </button>
    </div>
  );
}
