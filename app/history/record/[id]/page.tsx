import { ArrowLeft, Image as ImageIcon, Mic, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { toDisplayRecord } from "@/lib/journal";
import { getRecordsForUser } from "@/lib/mock-user-db";

export default async function RecordDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const stored = user ? (await getRecordsForUser(user.id)).find((r) => r.id === params.id) : undefined;
  if (!stored) notFound();
  const record = toDisplayRecord(stored);

  return (
    <div className="stagger-in relative z-10 pb-16">
      <div className="flex h-14 items-center justify-between px-5 pt-2">
        <Link
          href="/history"
          aria-label="返回"
          className="grid h-[40px] w-[40px] place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
        <h1 className="font-serif text-[16px] font-medium text-primary">那一天</h1>
        <div className="h-[40px] w-[40px]" />
      </div>

      <header className="mt-2 px-6">
        <p className="eyebrow">JOURNAL · 翻回那天</p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          <span className="text-[var(--accent-coral)]">{record.date}</span>
          <span className="ml-2 font-garamond text-[16px] italic text-secondary">
            {record.weekday} · {record.timeOfDay}
          </span>
        </h2>
        <p className="mt-2 font-garamond text-[13px] italic text-secondary">— a page from your journal —</p>
      </header>

      {/* Body card — letter-like */}
      <article className="paper-card mx-6 mt-6 px-6 py-6">
        {record.inputType === "voice" ? (
          <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-[rgba(122,155,126,0.30)] bg-[rgba(122,155,126,0.10)] px-4 py-3">
            <button
              type="button"
              aria-label="播放语音"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-sage)] text-white shadow-[0_4px_10px_rgba(122,155,126,0.30)]"
            >
              <Play className="h-4 w-4" strokeWidth={2} fill="currentColor" />
            </button>
            <div className="flex-1">
              <p className="text-[12px] font-medium text-[var(--accent-sage)]">语音记录</p>
              <p className="font-garamond text-[11px] italic text-secondary">
                {record.audioDuration} 秒 · 点播放听一下当时的自己
              </p>
            </div>
            <Mic className="h-4 w-4 text-[var(--accent-sage)]" strokeWidth={1.6} />
          </div>
        ) : null}

        <p className="whitespace-pre-line font-serif text-[16px] leading-[1.85] text-primary">
          {record.text}
        </p>

        {record.images.length > 0 ? (
          <div className="mt-6">
            <p className="mb-3 inline-flex items-center gap-2 font-garamond text-[12px] italic text-secondary">
              <ImageIcon className="h-3 w-3" strokeWidth={1.6} />
              那天的画面
            </p>
            <div className="grid grid-cols-3 gap-2">
              {record.images.map((image, idx) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-[12px] border border-white/70 bg-[rgba(212,165,116,0.16)] shadow-[var(--card-shadow)]"
                >
                  <div className="grid h-full w-full place-items-center font-garamond text-[14px] italic text-[var(--accent-deep)]">
                    {image}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex items-center justify-between border-t border-dashed border-[rgba(180,150,100,0.30)] pt-4">
          <span className="font-garamond text-[11px] italic text-tertiary">{record.count}</span>
          <span className="font-garamond text-[12px] italic text-[var(--accent-coral)]">— 小满记下了</span>
        </div>
      </article>

      <p className="mt-7 px-6 text-center font-garamond text-[12px] italic text-tertiary">
        — 没关系，那天的你已经被收好 —
      </p>
    </div>
  );
}
