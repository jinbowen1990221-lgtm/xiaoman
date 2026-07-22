import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createNote, getNotesForUser } from "@/lib/mock-user-db";

function persistenceUnavailable(error: unknown) {
  console.error("[notes-api] persistence unavailable", error);
  return NextResponse.json({ error: "暂时没收好，请稍后再试" }, { status: 503 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notes: [] }, { status: 401 });
  try {
    return NextResponse.json({ notes: await getNotesForUser(user.id) });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    choice?: string;
    text?: string;
    possibility?: number;
  };

  try {
    const note = await createNote(user.id, {
      choice: body.choice ?? "今日",
      text: body.text ?? "",
      possibility: typeof body.possibility === "number" ? body.possibility : 0
    });

    return NextResponse.json({ note });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}
