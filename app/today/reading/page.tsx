"use client";

import { motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/top-nav";

type Reading = {
  reading: string;
  quote: { text: string; author: string; source: string };
};

export default function TodayReadingPage() {
  const [data, setData] = useState<Reading | null>(null);
  const [empty, setEmpty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/today-reading")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: (Reading & { empty?: boolean }) | null) => {
        if (cancelled) return;
        if (!d || d.empty) setEmpty(true);
        else setData(d);
      })
      .catch(() => {
        if (!cancelled) setEmpty(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="secondary-page-pad relative z-10 min-h-dvh pb-16">
      <TopNav title="今日解读" />

      <section className="stagger-in mt-2">
        <p className="eyebrow">READING · 今天的你</p>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          <span className="ink-underline">读一段</span>，刚好是此刻
        </h1>

        {!loaded ? (
          <div className="mt-8 flex items-center gap-2 text-secondary">
            <span className="font-serif text-[15px]">小满在为你翻一段</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent-coral)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </span>
          </div>
        ) : empty || !data ? (
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="font-serif text-[16px] text-secondary">今天你还没写下什么</p>
            <Link href="/record" className="bob-button-dark flex h-[48px] w-[200px] items-center justify-center">
              去记一笔今天
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 小满's distillation + connection */}
            <p className="mt-6 text-[15px] font-light leading-[1.9] text-primary">{data.reading}</p>

            {/* a little book showing the source */}
            <div className="mt-8 flex justify-center">
              <BookCover source={data.quote.source} author={data.quote.author} />
            </div>

            {/* the quote, on a "book page" */}
            <article
              className="relative mt-5 overflow-hidden rounded-l-[6px] rounded-r-[16px] border border-[rgba(180,150,100,0.28)] px-7 py-7"
              style={{
                background:
                  "repeating-linear-gradient(180deg, transparent 0 33px, rgba(180,150,100,0.06) 33px 34px), #FBF6EC",
                boxShadow: "8px 12px 30px rgba(180,150,100,0.20)"
              }}
            >
              {/* bound spine on the left */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[10px]"
                style={{ background: "linear-gradient(90deg, rgba(180,150,100,0.30), rgba(180,150,100,0.06))" }}
              />
              {/* faint stitching */}
              <span aria-hidden="true" className="absolute left-[4px] top-6 h-1 w-1 rounded-full bg-[rgba(160,120,80,0.4)]" />
              <span aria-hidden="true" className="absolute bottom-6 left-[4px] h-1 w-1 rounded-full bg-[rgba(160,120,80,0.4)]" />
              <QuoteIcon
                aria-hidden="true"
                className="absolute right-5 top-5 h-7 w-7 text-[rgba(199,93,62,0.16)]"
                strokeWidth={1.4}
                fill="currentColor"
              />
              <p className="relative font-serif text-[21px] font-medium leading-[1.85] text-primary">
                {data.quote.text}
              </p>
              <p className="relative mt-5 text-right font-garamond text-[14px] italic text-[var(--accent-deep)]">
                — {data.quote.author}{data.quote.source}
              </p>
            </article>

            <p className="mt-5 font-garamond text-[12px] italic text-tertiary">
              · 皆选自真实的中外文学名著，小满只替你挑了最贴近今天的一段
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

/** A small CSS "book" showing the source — a bit of physicality. */
function BookCover({ source, author }: { source: string; author: string }) {
  const title = source.replace(/[《》]/g, "");
  return (
    <div
      className="relative h-[128px] w-[94px] shrink-0 rounded-l-[3px] rounded-r-[7px]"
      style={{
        transform: "rotate(-4deg)",
        background: "linear-gradient(135deg, #C75D3E 0%, #A84A3A 100%)",
        boxShadow: "0 14px 28px rgba(120,55,40,0.32), inset 0 0 0 1px rgba(255,255,255,0.10)"
      }}
    >
      {/* spine highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[8px] rounded-l-[3px]"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.22), transparent)" }}
      />
      {/* page edges on the right */}
      <span
        aria-hidden="true"
        className="absolute inset-y-[3px] right-[-3px] w-[3px] rounded-r-[2px]"
        style={{ background: "repeating-linear-gradient(180deg, #efe6d6 0 2px, #d8ccb8 2px 3px)" }}
      />
      <div className="flex h-full flex-col justify-between py-3 pl-4 pr-2.5">
        <p className="font-serif text-[12.5px] font-medium leading-[1.3] text-[rgba(255,248,240,0.96)]">
          {title}
        </p>
        <p className="font-garamond text-[9.5px] italic leading-tight text-[rgba(255,248,240,0.82)]">
          {author}
        </p>
      </div>
    </div>
  );
}
