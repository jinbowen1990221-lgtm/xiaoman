"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bookmark, ChevronRight, Heart, Image as ImageIcon, Mic } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Observation = { title: string; detail: string; hook: string };
type Theme = { label: string; count: number; quote: string };
type SavedNote = { id: string; date: string; choice: string; text: string; possibility: number };
type Record = {
  id: string;
  date: string;
  weekday: string;
  timeOfDay: string;
  month: number;
  day: number;
  count: string;
  preview: string;
  text: string;
  inputType: "text" | "voice";
  audioDuration?: number;
  images: string[];
};

type TabKey = "all" | "saved" | "noticed" | "journal";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "saved", label: "收下的话" },
  { key: "noticed", label: "小满看见的" },
  { key: "journal", label: "日记" }
];

export function HistoryTabs({
  summary,
  observations,
  themes,
  curve,
  savedNotes,
  records
}: {
  summary: string | null;
  observations: Observation[];
  themes: Theme[];
  curve: number[];
  savedNotes: SavedNote[];
  records: Record[];
}) {
  const [active, setActive] = useState<TabKey>("all");
  const empty = records.length === 0 && savedNotes.length === 0;

  return (
    <div>
      {/* Tab bar */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-[12px] transition-colors ${
                isActive
                  ? "text-white"
                  : "border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary backdrop-blur-xl hover:scale-[1.03]"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="history-tab-pill"
                  className="absolute inset-0 rounded-full bg-[var(--btn-dark)] shadow-[0_6px_14px_rgba(42,37,32,0.16)]"
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              ) : null}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4"
        >
          {empty ? (
            <EmptyAll />
          ) : active === "all" ? (
            <AllView summary={summary} observations={observations} savedNotes={savedNotes} records={records} onGoTab={setActive} />
          ) : active === "saved" ? (
            <SavedView savedNotes={savedNotes} />
          ) : active === "noticed" ? (
            <NoticedView summary={summary} observations={observations} themes={themes} curve={curve} />
          ) : (
            <JournalView records={records} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- shared empty state ---------- */
function EmptyHint({ line, sub }: { line: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[20px] border border-white/70 bg-[rgba(255,251,243,0.6)] px-6 py-10 text-center shadow-[var(--card-shadow)] backdrop-blur-xl">
      <Heart className="heart-pulse h-4 w-4 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
      <p className="font-serif text-[16px] text-primary">{line}</p>
      {sub ? <p className="font-garamond text-[13px] italic text-secondary">{sub}</p> : null}
    </div>
  );
}

function EmptyAll() {
  return (
    <div className="space-y-4">
      <EmptyHint line="我们才刚认识" sub="还没有可以翻的东西 —— 先去记一笔今天？" />
      <Link
        href="/record"
        className="bob-button-dark mx-auto flex h-[48px] w-[200px] items-center justify-center"
      >
        去记录今天
      </Link>
    </div>
  );
}

/* ---------- ALL ---------- */
function AllView({
  summary,
  observations,
  savedNotes,
  records,
  onGoTab
}: {
  summary: string | null;
  observations: Observation[];
  savedNotes: SavedNote[];
  records: Record[];
  onGoTab: (k: TabKey) => void;
}) {
  return (
    <div className="space-y-7">
      {savedNotes.length > 0 ? (
        <Block title="收下的话" subtitle="— what you kept —" onMore={savedNotes.length > 2 ? () => onGoTab("saved") : undefined}>
          {savedNotes.slice(0, 2).map((n) => (
            <SavedRow key={n.id} note={n} />
          ))}
        </Block>
      ) : null}

      {observations.length > 0 ? (
        <Block title="小满看见的" subtitle="— small things noticed —" onMore={observations.length > 2 ? () => onGoTab("noticed") : undefined}>
          {observations.slice(0, 2).map((it) => (
            <InsightRow key={it.title} insight={it} />
          ))}
        </Block>
      ) : null}

      {records.length > 0 ? (
        <Block title="日记" subtitle="— your pages —" onMore={records.length > 3 ? () => onGoTab("journal") : undefined}>
          {records.slice(0, 3).map((r) => (
            <RecordRow key={r.id} record={r} />
          ))}
        </Block>
      ) : null}
    </div>
  );
}

function Block({
  title,
  subtitle,
  onMore,
  children
}: {
  title: string;
  subtitle: string;
  onMore?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="font-serif text-[18px] font-medium leading-tight text-primary">{title}</h3>
          <p className="mt-0.5 font-garamond text-[12px] italic text-secondary">{subtitle}</p>
        </div>
        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            className="inline-flex items-center gap-1 font-garamond text-[12px] italic text-[var(--accent-coral)] hover:underline"
          >
            更多
            <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
          </button>
        ) : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

/* ---------- SAVED ---------- */
function SavedView({ savedNotes }: { savedNotes: SavedNote[] }) {
  if (savedNotes.length === 0) {
    return <EmptyHint line="还没有收下的话" sub="在「今日预感」里点『收下』，它就会留在这里。" />;
  }
  return (
    <div>
      <p className="font-garamond text-[13px] italic text-secondary">— the words you kept —</p>
      <div className="mt-4 space-y-2.5">
        {savedNotes.map((note) => (
          <SavedRow key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

function SavedRow({ note }: { note: SavedNote }) {
  return (
    <Link
      href={`/history/note/${note.id}`}
      className="tap-soft relative block overflow-hidden rounded-[18px] border border-[rgba(199,93,62,0.22)] bg-[rgba(255,247,238,0.72)] px-4 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
    >
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-coral)]" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent-coral)] text-white">
          <Bookmark className="h-3.5 w-3.5" strokeWidth={1.8} fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[15px] font-medium text-primary">
              {note.date} · <span className="text-[var(--accent-coral)]">{note.choice}</span>
            </h2>
            <span className="font-garamond text-[11px] italic text-secondary">{note.possibility}%</span>
          </div>
          <p className="mt-1.5 truncate text-[13px] font-light leading-5 text-secondary">{note.text}</p>
        </div>
      </div>
    </Link>
  );
}

/* ---------- NOTICED ---------- */
function NoticedView({
  summary,
  observations,
  themes,
  curve
}: {
  summary: string | null;
  observations: Observation[];
  themes: Theme[];
  curve: number[];
}) {
  if (!summary || observations.length === 0) {
    return <EmptyHint line="我还在认识你" sub="多记几次，我就能慢慢看清你的样子。" />;
  }
  return (
    <div>
      <section className="relative overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-coral)] text-[12px] font-medium text-white">
            满
          </div>
          <span className="font-garamond text-[12px] uppercase tracking-[0.18em] text-secondary">this week · 这一周你</span>
        </div>
        <p className="text-[15px] font-light leading-[1.75] text-primary">{summary}</p>

        {curve.length >= 2 ? (
          <div className="mt-4 border-t border-dashed border-[rgba(180,150,100,0.25)] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-garamond text-[11px] italic text-secondary">心情的起伏</span>
              <span className="font-garamond text-[11px] italic text-tertiary">近 {curve.length} 次</span>
            </div>
            <Sparkline values={curve} />
          </div>
        ) : null}
      </section>

      {/* long-term memory — recurring themes, grounded in real words */}
      {themes.length > 0 ? (
        <section className="mt-5 overflow-hidden rounded-[22px] border border-[rgba(199,93,62,0.20)] bg-[rgba(255,247,238,0.6)] px-5 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
          <p className="font-garamond text-[12px] uppercase tracking-[0.18em] text-secondary">小满记得的你</p>
          <div className="mt-3 space-y-3">
            {themes.map((t) => (
              <div key={t.label} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-[var(--accent-coral)] px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {t.label} · {t.count}
                </span>
                <p className="min-w-0 flex-1 truncate font-garamond text-[13px] italic text-secondary">
                  “{t.quote}”
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 font-garamond text-[11px] italic text-tertiary">— 这些是你反复提起的 —</p>
        </section>
      ) : null}

      <p className="mt-5 font-garamond text-[13px] italic text-secondary">— small things 小满 has noticed —</p>
      <div className="mt-3 space-y-3">
        {observations.map((item) => (
          <InsightRow key={item.title} insight={item} />
        ))}
      </div>
    </div>
  );
}

/* gentle emotion sparkline */
function Sparkline({ values }: { values: number[] }) {
  const w = 100;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
    const y = h - 4 - ((v - min) / span) * (h - 8);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--accent-coral)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill="var(--accent-coral)" />
    </svg>
  );
}

function InsightRow({ insight }: { insight: Observation }) {
  return (
    <article className="rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/55 text-[12px] font-medium text-[var(--accent-coral)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          满
        </div>
        <div className="flex-1">
          <h2 className="text-[14px] font-medium text-primary">{insight.title}</h2>
          <p className="mt-2 text-[13px] font-light leading-[1.7] text-secondary">{insight.detail}</p>
          <p className="mt-3 font-garamond text-[13px] italic text-[var(--accent-coral)]">{insight.hook}</p>
        </div>
      </div>
    </article>
  );
}

/* ---------- JOURNAL ---------- */
function JournalView({ records }: { records: Record[] }) {
  // group by day-of-month for the calendar (records already share the displayed month in practice)
  const recordsByDay = useMemo(() => {
    const map = new Map<number, Record>();
    records.forEach((r) => {
      if (!map.has(r.day)) map.set(r.day, r);
    });
    return map;
  }, [records]);

  // calendar shows the month of the most recent record (or current month if none)
  const refMonth = records[0]?.month ?? new Date().getMonth() + 1;
  const refYear = new Date().getFullYear();

  const mostRecentDay = records[0]?.day ?? null;
  const [selectedDay, setSelectedDay] = useState<number | null>(mostRecentDay);
  const selectedRecord = selectedDay ? recordsByDay.get(selectedDay) : null;

  if (records.length === 0) {
    return <EmptyHint line="日历还是空的" sub="记下第一笔，这一天就会亮起来。" />;
  }

  return (
    <div>
      <p className="font-garamond text-[13px] italic text-secondary">— a calendar of you —</p>

      <Calendar
        year={refYear}
        month={refMonth}
        recordsByDay={recordsByDay}
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
      />

      <div className="mt-5">
        {selectedRecord ? (
          <Link
            href={`/history/record/${selectedRecord.id}`}
            className="tap-soft group block overflow-hidden rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
          >
            <RecordRowInner record={selectedRecord} />
          </Link>
        ) : selectedDay ? (
          <div className="rounded-[18px] border border-white/70 bg-[rgba(255,251,243,0.6)] px-4 py-5 text-center shadow-[var(--card-shadow)] backdrop-blur-xl">
            <p className="font-serif text-[15px] text-secondary">{refMonth} 月 {selectedDay} 日</p>
            <p className="mt-1.5 font-garamond text-[12px] italic text-tertiary">那天你没记下什么 · 没关系</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 font-garamond text-[12px] italic text-tertiary">
            <Heart className="h-3 w-3 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
            点一天看看那天的你
          </div>
        )}
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: Record }) {
  return (
    <Link
      href={`/history/record/${record.id}`}
      className="tap-soft group block overflow-hidden rounded-[18px] border border-white/70 bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow)] backdrop-blur-xl"
    >
      <RecordRowInner record={record} />
    </Link>
  );
}

function RecordRowInner({ record }: { record: Record }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-[15px] font-medium text-primary">{record.date}</h2>
          <span className="font-garamond text-[11px] italic text-secondary">
            {record.weekday} · {record.timeOfDay}
          </span>
        </div>
        <p className="mt-1.5 truncate text-[13px] font-light leading-5 text-secondary">{record.preview}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-tertiary">
          {record.inputType === "voice" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(122,155,126,0.14)] px-2 py-0.5 text-[var(--accent-sage)]">
              <Mic className="h-2.5 w-2.5" strokeWidth={1.8} />
              语音
            </span>
          ) : null}
          {record.images.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(212,165,116,0.16)] px-2 py-0.5 text-[var(--accent-deep)]">
              <ImageIcon className="h-2.5 w-2.5" strokeWidth={1.8} />
              {record.images.length} 张图
            </span>
          ) : null}
          <span className="font-garamond italic">{record.count}</span>
        </div>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
    </div>
  );
}

/* ---------- CALENDAR ---------- */
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function Calendar({
  year,
  month,
  recordsByDay,
  selectedDay,
  onSelect
}: {
  year: number;
  month: number;
  recordsByDay: Map<number, Record>;
  selectedDay: number | null;
  onSelect: (day: number | null) => void;
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  // JS getDay: 0=Sun..6=Sat; we want Monday-first offset
  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset = (firstDow + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mt-4 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] px-4 py-5 shadow-[var(--card-shadow)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-serif text-[16px] font-medium text-primary">{year} · {month} 月</span>
        <span className="font-garamond text-[12px] italic text-secondary">
          {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][month - 1]}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-center font-garamond text-[11px] italic text-tertiary">
            {w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`pad-${i}`} className="aspect-square" />;
          const hasRecord = recordsByDay.has(day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(isSelected ? null : day)}
              className={`relative aspect-square rounded-[10px] text-[13px] transition-all ${
                isSelected
                  ? "bg-[var(--accent-coral)] text-white shadow-[0_4px_10px_rgba(199,93,62,0.28)]"
                  : hasRecord
                    ? "bg-white/55 text-primary hover:scale-[1.05]"
                    : "text-secondary hover:bg-white/35"
              }`}
            >
              <span className="font-serif">{day}</span>
              {hasRecord ? (
                <span
                  className={`absolute left-1/2 top-[64%] -translate-x-1/2 ${isSelected ? "text-white" : "text-[var(--accent-coral)]"}`}
                  style={{ fontSize: 7 }}
                  aria-hidden="true"
                >
                  ♥
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
