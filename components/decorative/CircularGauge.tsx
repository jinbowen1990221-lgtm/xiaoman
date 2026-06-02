export function CircularGauge({
  percentage,
  size = 114,
  label = "今日趋势",
  caption = "POSSIBILITY"
}: {
  percentage: number;
  size?: number;
  label?: string;
  caption?: string;
}) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {Array.from({ length: 8 }).map((_, index) => {
          const angle = (index * 45 * Math.PI) / 180;
          const r = radius + 8;
          const cx = size / 2 + r * Math.cos(angle);
          const cy = size / 2 + r * Math.sin(angle);
          return <circle key={index} cx={cx} cy={cy} r="1.25" fill="#6EA8FF" opacity="0.22" />;
        })}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(110, 168, 255, 0.14)" strokeWidth="5" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6EA8FF"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
            filter: "drop-shadow(0 0 4px rgba(110, 168, 255, 0.24))"
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mb-1 text-[10px] tracking-[0.08em] text-tertiary">{label}</span>
        <span className="text-[30px] font-semibold leading-none text-accent">{Math.round(percentage)}%</span>
        <span className="mt-1 text-[9px] tracking-[0.18em] text-tertiary">{caption}</span>
      </div>
    </div>
  );
}
