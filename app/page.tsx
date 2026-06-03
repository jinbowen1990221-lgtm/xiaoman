import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AIStatusPill } from "@/components/decorative/AIStatusPill";
import { CoinMascot } from "@/components/decorative/CoinMascot";
import { ForesightCard } from "@/components/foresight-card";
import { HomeWeather } from "@/components/home-weather";
import { LotteryCard } from "@/components/lottery-card";
import { LotteryFavoriteButton } from "@/components/lottery-favorite-button";
import { TodayNoteText } from "@/components/today-note-text";
import { getCurrentUser } from "@/lib/auth";
import { buildDailyNoteFallback } from "@/lib/daily-note";
import { beijingDay, formatChineseDate, getGreeting } from "@/lib/date";
import { getRecordsForUser } from "@/lib/mock-user-db";
import { scoreForRecords } from "@/lib/ai";
import { emptyLotteryNumbers, generateLotteryNumbers } from "@/lib/lottery";

export default async function TodayPage() {
  const user = await getCurrentUser();
  const nickname = user?.nickname ?? "朋友";
  const records = user ? await getRecordsForUser(user.id) : [];
  const hasRecords = records.length > 0;
  const latest = records[0];

  // 今日趋势 from real sentiment (today's records, else recent)
  const todayStr = beijingDay();
  const todayRecords = records.filter((r) => beijingDay(r.created_at) === todayStr);
  const trend = scoreForRecords(todayRecords.length ? todayRecords : records);
  const latestQuote = latest
    ? (() => {
        const t = latest.content.replace(/\n+/g, " ").trim();
        return t.length > 14 ? `${t.slice(0, 14)}…` : t;
      })()
    : null;
  const pillText = hasRecords
    ? `收到你说的「${latestQuote}」，我记着了`
    : "还不太认识你，先跟我说一句今天吧";

  const dateLabel = formatChineseDate()
    .replace("日星期", "日 星期")
    .replace(/ · .+$/, " · 今天");
  // Lucky numbers are derived from the user's birthday + the ISO week, so they
  // stay stable all week and refresh every Monday. No birthday → gentle prompt.
  const preferredType = user?.preferred_lottery ?? "double_color";
  const hasBirthday = Boolean(user?.birthday);
  const homeLottery = hasBirthday
    ? generateLotteryNumbers(user!.birthday!, user!.id, preferredType)
    : emptyLotteryNumbers(preferredType);

  return (
    <div className="stagger-in relative z-10 pb-28">
      <header className="px-6 pt-4">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h1 className="font-serif text-[30px] font-medium leading-tight text-primary">
              {getGreeting()}，<span className="ink-underline">{nickname}</span>
            </h1>
            <p className="mt-3 whitespace-nowrap text-[14px] font-light leading-6 text-secondary">
              {dateLabel}
            </p>
          </div>

          <HomeWeather />
        </div>
      </header>

      <div className="mx-6 mt-5">
        <AIStatusPill text={pillText} href={hasRecords ? "/history" : "/record"} />
      </div>

      {hasRecords ? (
        <section className="group relative mx-6 mt-4 overflow-hidden rounded-[28px] border border-white/70 bg-[var(--card-bg)] px-5 pb-6 pt-5 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_38px_rgba(180,150,100,0.14)]">
          <p className="font-garamond text-[12px] font-semibold uppercase tracking-[0.20em] text-secondary">
            TODAY&apos;S NOTE
          </p>

          {/* bottle illustration — smaller, shifted further right to give more room to the text */}
          <Image
            src="/images/home/bottle-stars.png"
            alt=""
            width={482}
            height={517}
            priority
            className="home-float pointer-events-none absolute -right-8 top-4 z-0 h-[220px] w-[200px] object-contain drop-shadow-[0_14px_26px_rgba(180,150,100,0.24)]"
          />

          {/* note text — wider, more breathing room */}
          <p
            className="relative z-10 mt-5 font-serif text-[20px] font-medium leading-[1.7] text-primary"
            style={{ width: "min(230px, 60%)", wordBreak: "normal", overflowWrap: "anywhere" }}
          >
            <TodayNoteText fallback={buildDailyNoteFallback(records)} userId={user?.id ?? "anon"} />
          </p>

          {/* footer row — link on left, possibility circle on right (overlapping cloud) */}
          <div className="relative z-10 mt-6 flex items-center justify-between gap-4">
            <Link
              href="/today/reading"
              className="group/link inline-flex items-center gap-1.5 border-b border-[rgba(180,150,100,0.40)] pb-1 text-[14px] font-light text-primary transition-colors hover:border-[var(--accent-coral)] hover:text-[var(--accent-coral)]"
            >
              查看今日解读
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5"
                strokeWidth={1.6}
              />
            </Link>

            <div
              className="grid h-[108px] w-[108px] shrink-0 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,247,232,0.78), rgba(255,247,232,0.22) 70%, rgba(255,247,232,0) 88%)",
                border: "1px solid rgba(212,165,116,0.18)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.40), 0 6px 18px rgba(180,150,100,0.10)"
              }}
            >
              <div className="relative text-center">
                <p className="text-[11px] font-light tracking-[0.08em] text-secondary">今日趋势</p>
                <p className="poss-number mt-1 font-serif text-[28px] font-semibold leading-none text-[var(--accent-coral)]">
                  {trend}%
                </p>
                <p className="mt-1 font-garamond text-[12px] italic text-secondary">possibility</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* New user — no records yet: a warm welcome instead of fake insights */
        <Link
          href="/record"
          className="group relative mx-6 mt-4 block overflow-hidden rounded-[28px] border border-white/70 bg-[var(--card-bg)] px-6 pb-7 pt-6 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_38px_rgba(180,150,100,0.14)]"
        >
          <p className="font-garamond text-[12px] font-semibold uppercase tracking-[0.20em] text-secondary">
            DAY ONE
          </p>
          <Image
            src="/images/home/bottle-stars.png"
            alt=""
            width={482}
            height={517}
            priority
            className="home-float pointer-events-none absolute -right-10 top-6 z-0 h-[190px] w-[175px] object-contain opacity-90 drop-shadow-[0_14px_26px_rgba(180,150,100,0.22)]"
          />
          <h2
            className="relative z-10 mt-5 font-serif text-[22px] font-medium leading-[1.6] text-primary"
            style={{ width: "min(230px, 64%)" }}
          >
            先跟我说说<span className="text-[var(--accent-coral)]">今天</span>，<br />
            剩下的交给我。
          </h2>
          <p
            className="relative z-10 mt-3 text-[13px] font-light leading-6 text-secondary"
            style={{ width: "min(250px, 66%)" }}
          >
            你记下的每一天，都会变成我读懂你、<span className="text-[var(--accent-deep)]">预感你明天</span>的线索。
          </p>
          <span className="relative z-10 mt-6 inline-flex items-center gap-1.5 border-b border-[rgba(180,150,100,0.40)] pb-1 text-[14px] font-light text-primary transition-colors group-hover:border-[var(--accent-coral)] group-hover:text-[var(--accent-coral)]">
            去记下第一笔
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.6} />
          </span>
        </Link>
      )}

      <div className="mx-6 mt-4">
        <ForesightCard />
      </div>

      <div className="mx-6 mt-4">
        {hasBirthday ? (
          <LotteryCard
            numbers={homeLottery}
            empty={false}
            showMoreLink
            favoriteSlot={<LotteryFavoriteButton numbers={homeLottery} />}
          />
        ) : (
          <Link href="/me/birthday" className="block">
            <LotteryCard numbers={homeLottery} empty showMoreLink={false} />
          </Link>
        )}
      </div>

      <Link href="/coin" className="mx-6 mt-4 flex min-h-[88px] items-center gap-4 overflow-hidden rounded-[24px] border border-white/70 bg-[var(--card-bg)] px-5 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01]">
        <div className="relative h-[60px] w-[60px] shrink-0">
          <CoinMascot size={60} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-[19px] font-medium text-primary">帮你做决定</h2>
          <p className="mt-1 truncate text-[13px] font-light text-secondary">纠结时，小满陪你推演</p>
        </div>
        <div className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full border border-white/70 bg-white/45 text-primary">
          <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </Link>
    </div>
  );
}
