import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNote, getNotesForUser } from "@/lib/mock-user-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notes: [] }, { status: 401 });
  return NextResponse.json({ notes: await getNotesForUser(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    choice?: string;
    text?: string;
    possibility?: number;
  };

  const note = await createNote(user.id, {
    choice: body.choice ?? "今日",
    text: body.text ?? "",
    possibility: typeof body.possibility === "number" ? body.possibility : 0
  });

  return NextResponse.json({ note });
}
