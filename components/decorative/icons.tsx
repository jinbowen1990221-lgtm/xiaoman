export function HexagonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 3.5H16L20.5 12L16 20.5H8L3.5 12L8 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" fill="currentColor" />
    </svg>
  );
}

export function WeatherIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="11" cy="12" r="5" fill="#FFD46C" />
      <path d="M11 4V1M11 23V20M3 12H0M22 12H19M5.3 6.3L3.1 4.1M18.9 19.9L16.7 17.7" stroke="#FFD46C" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 24C8.7 24 6 21.5 6 18.5C6 15.9 7.9 13.8 10.5 13.2C11.6 10.7 14.1 9 17 9C20.9 9 24 12.1 24 16C27 16.2 29.4 18.5 29.4 21.4C29.4 24.5 26.8 27 23.6 27H12" fill="#DCEBFF" stroke="#8AB4F8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChartDecoration() {
  return (
    <svg width="92" height="56" viewBox="0 0 92 56" fill="none">
      <path d="M8 46V30M26 46V18M44 46V24M62 46V10M80 46V20" stroke="#5B8DEF" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 50H88" stroke="#5B8DEF" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  );
}
