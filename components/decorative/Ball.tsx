export function Ball({
  number,
  type,
  size = 40
}: {
  number: number;
  type: "red" | "blue";
  size?: number;
  withPedestal?: boolean;
}) {
  const background = type === "red" ? "var(--accent-gold)" : "var(--accent-sage)";

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.32), inset 0 -1px 3px rgba(100,70,30,0.10)",
        flexShrink: 0
      }}
    >
      <span
        className="font-serif leading-none text-white"
        style={{ fontSize: size * 0.42, fontWeight: 500 }}
      >
        {String(number).padStart(2, "0")}
      </span>
    </div>
  );
}
