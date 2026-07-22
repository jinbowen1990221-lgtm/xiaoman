import Image from "next/image";

export function CoinMascot({
  size = 64,
  result,
  face = "star",
  options
}: {
  size?: number;
  result?: string | null;
  face?: "star" | "blank";
  /** When idle (no result) on a blank coin, engrave the first option on the coin. */
  options?: [string, string];
}) {
  const src = face === "blank" ? "/images/home/coin-blank.webp" : "/images/home/coin-star.webp";

  // text shown on the coin: result after flip, else the first option while idle
  const engraved = result ?? options?.[0] ?? null;

  function fontSizeFor(text: string) {
    if (text.length > 3) return size * 0.18;
    if (text.length === 3) return size * 0.22;
    if (text.length === 2) return size * 0.27;
    return size * 0.36;
  }

  return (
    // float animation lives on the wrapper so the coin + engraved text move as one piece
    <div
      className={`relative ${result ? "" : "coin-float"}`}
      style={{ height: size, width: size }}
    >
      <Image
        src={src}
        alt=""
        width={480}
        height={476}
        unoptimized
        className="h-full w-full object-contain"
      />

      {engraved ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <span
            className="max-w-[62%] truncate text-center font-serif font-semibold leading-none text-[#8A4B1E]"
            style={{
              fontSize: fontSizeFor(engraved),
              letterSpacing: engraved.length > 1 ? "0.04em" : 0,
              textShadow: "0 1px 1px rgba(255,240,200,0.6)"
            }}
          >
            {engraved}
          </span>
        </span>
      ) : null}
    </div>
  );
}
