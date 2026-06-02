import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotesForUser } from "@/lib/mock-user-db";

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const stored = user ? (await getNotesForUser(user.id)).find((n) => n.id === params.id) : undefined;
  if (!stored) notFound();
  const d = new Date(stored.created_at);
  const note = {
    date: `${d.getMonth() + 1} 月 ${d.getDate()} 日`,
    choice: stored.choice,
    text: stored.text,
    possibility: stored.possibility
  };

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
        <h1 className="font-serif text-[16px] font-medium text-primary">收下的预感</h1>
        <div className="h-[40px] w-[40px]" />
      </div>

      <header className="mt-2 px-6">
        <p className="eyebrow">SAVED · 收下的预感</p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          <span className="text-[var(--accent-coral)]">{note.date}</span> · {note.choice}
        </h2>
        <p className="mt-2 font-garamond text-[13px] italic text-secondary">— a note you kept —</p>
      </header>

      <article className="mx-6 mt-6 overflow-hidden rounded-[24px] border border-[rgba(199,93,62,0.22)] bg-[rgba(255,247,238,0.86)] px-6 py-6 shadow-[var(--card-shadow)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-coral)] text-white shadow-[0_4px_10px_rgba(199,93,62,0.30)]">
            <Bookmark className="h-4 w-4" strokeWidth={1.8} fill="currentColor" />
          </div>
          <span className="font-garamond text-[12px] italic text-secondary">你那天选的是「{note.choice}」</span>
        </div>

        <p className="mt-5 font-serif text-[17px] leading-[1.85] text-primary">{note.text}</p>

        <div className="mt-6 border-t border-dashed border-[rgba(199,93,62,0.25)] pt-4">
          <div className="flex items-baseline justify-between">
            <span className="font-garamond text-[11px] uppercase tracking-[0.15em] text-secondary">POSSIBILITY</span>
            <span className="font-serif text-[28px] font-semibold leading-none text-[var(--accent-coral)]">
              {note.possibility}%
            </span>
          </div>
        </div>
      </article>

      <p className="mt-7 px-6 text-center font-garamond text-[12px] italic text-tertiary">
        — 这条预感小满会替你留着 —
      </p>
    </div>
  );
}
