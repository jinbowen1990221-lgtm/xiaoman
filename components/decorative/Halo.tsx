export function Halo({ size = 200, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(110, 168, 255, 0.16) 0%, rgba(110, 168, 255, 0.05) 42%, transparent 72%)",
        filter: "blur(10px)"
      }}
    />
  );
}
