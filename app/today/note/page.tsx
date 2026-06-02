import { Suspense } from "react";
import { TopNav } from "@/components/top-nav";
import { NoteResult } from "@/components/note-result";

export default function TodayNotePage() {
  return (
    <div className="secondary-page-pad min-h-dvh">
      <TopNav title="今日预感" subtitle="step 2/2" backHref="/today/open" />
      <Suspense>
        <NoteResult />
      </Suspense>
    </div>
  );
}
