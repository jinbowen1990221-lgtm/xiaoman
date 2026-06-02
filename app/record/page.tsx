import { Heart } from "lucide-react";
import { AIStatusPill } from "@/components/decorative/AIStatusPill";
import { MoodRow } from "@/components/mood-row";
import { RecordComposer } from "@/components/record-composer";
import { shortDateLabel } from "@/lib/date";

export default function RecordPage() {
  return (
    <div className="stagger-in relative z-10 px-6 pb-36 pt-4">
      <header>
        <span className="postmark">
          <Heart className="heart-pulse h-3.5 w-3.5 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
          {shortDateLabel()} · 上午
        </span>
        <h1 className="mt-4 font-serif text-[30px] font-medium leading-tight text-primary">
          <span className="scribble-underline">今天</span>想说点什么？
        </h1>
        <p className="mt-3 text-[14px] font-light leading-6 text-secondary">
          不用讲得完整，<span className="font-garamond italic text-[var(--accent-deep)]">一句话</span>也行。我会记住。
        </p>
      </header>

      <div className="mt-5">
        <AIStatusPill text="听着，想到什么都行..." />
      </div>

      <MoodRow />

      <RecordComposer />
    </div>
  );
}
