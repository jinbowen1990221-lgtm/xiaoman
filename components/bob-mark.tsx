export function CompanionMark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full bg-accent font-medium text-white"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.55) }}
      aria-hidden="true"
    >
      满
    </span>
  );
}
