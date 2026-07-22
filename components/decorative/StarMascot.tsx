import Image from "next/image";

export function StarMascot({ size = 140 }: { size?: number }) {
  return (
    <div className="relative" style={{ height: size, width: size }}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          inset: -(size * 0.13),
          background: "radial-gradient(circle, rgba(232,182,101,0.40), transparent 65%)",
          animation: "glowPulse 3s ease-in-out infinite"
        }}
      />
      <Image
        src="/images/home/star-mascot.webp"
        alt=""
        width={480}
        height={480}
        sizes={`${size}px`}
        priority
        className="home-float relative h-full w-full object-contain"
        style={{ filter: "drop-shadow(0 10px 18px rgba(180,120,40,0.20))" }}
      />
    </div>
  );
}
