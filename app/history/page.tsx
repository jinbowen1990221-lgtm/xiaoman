import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { buildThemes, emotionCurve } from "@/lib/ai";
import { buildObservations, buildSummary, toDisplayRecord } from "@/lib/journal";
import { getNotesForUser, getRecordsForUser } from "@/lib/mock-user-db";
import { HistoryTabs } from "@/components/history-tabs";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const nickname = user?.nickname ?? "朋友";

  const stored = user ? await getRecordsForUser(user.id) : [];
  const notes = user ? await getNotesForUser(user.id) : [];

  const records = stored.map(toDisplayRecord);
  const summary = buildSummary(stored);
  const observations = buildObservations(stored);
  const themes = buildThemes(stored);
  const curve = emotionCurve(stored);
  const savedNotes = notes.map((n) => {
    const d = new Date(n.created_at);
    return {
      id: n.id,
      date: `${d.getMonth() + 1} 月 ${d.getDate()} 日`,
      choice: n.choice,
      text: n.text,
      possibility: n.possibility
    };
  });

  return (
    <div className="stagger-in relative z-10 px-6 pb-28 pt-4">
      <header>
        <span className="postmark">
          <Heart className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
          一封小满写给你的信
        </span>
        <h1 className="mt-4 font-serif text-[30px] font-medium leading-tight text-primary">
          亲爱的 <span className="scribble-underline">{nickname}</span>，
        </h1>
      </header>

      <HistoryTabs
        summary={summary}
        observations={observations}
        themes={themes}
        curve={curve}
        savedNotes={savedNotes}
        records={records}
      />

      {/* warm sign-off */}
      <div className="mt-8 flex flex-col items-end gap-1 pr-2">
        <p className="font-garamond text-[15px] italic text-secondary">— Yours, slowly listening</p>
        <p className="font-serif text-[20px] text-[var(--accent-coral)]">小满 ♡</p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-[rgba(180,150,100,0.30)]" />
        <span className="font-garamond text-[11px] italic text-tertiary">— 慢慢翻，不急 —</span>
        <span className="h-px w-12 bg-[rgba(180,150,100,0.30)]" />
      </div>
    </div>
  );
}
