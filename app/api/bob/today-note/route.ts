import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildBobSystemPrompt } from "@/lib/bob-prompt";
import { getCoinFlipsForUser } from "@/lib/mock-user-db";
import { noteResult, todayNote } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    userId?: string;
    selectedWord?: string;
  };
  const user = await getCurrentUser();
  const systemPrompt = user
    ? buildBobSystemPrompt(user, [
        {
          id: "mock-record-1",
          content: user.initial_thought ?? "今天没什么特别的。",
          createdAt: new Date().toISOString()
        }
      ], await getCoinFlipsForUser(user.id, 8))
    : null;

  if (body.selectedWord) {
    return NextResponse.json({
      text: noteResult.text,
      possibility: noteResult.possibility,
      systemPrompt
    });
  }

  return NextResponse.json({
    text: todayNote.text,
    possibility: todayNote.possibility,
    systemPrompt
  });
}
