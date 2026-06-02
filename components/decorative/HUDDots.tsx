export function HUDDots({ total = 3, active = 0 }: { total?: number; active?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="rounded-full transition-all"
          style={{
            width: index === active ? 14 : 5,
            height: 5,
            background: index === active ? "rgba(110, 168, 255, 0.72)" : "rgba(110, 168, 255, 0.18)",
            boxShadow: index === active ? "0 0 6px rgba(110, 168, 255, 0.18)" : "none"
          }}
        />
      ))}
    </div>
  );
}
