import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createRecord, getRecordsForUser } from "@/lib/mock-user-db";

function persistenceUnavailable(error: unknown) {
  console.error("[records-api] persistence unavailable", error);
  return NextResponse.json({ error: "暂时没存好，请稍后再试" }, { status: 503 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ records: [] }, { status: 401 });
  }
  try {
    return NextResponse.json({ records: await getRecordsForUser(user.id) });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    content?: string;
    images?: string[];
    input_type?: "text" | "voice";
    audio_duration?: number | null;
    mood?: string | null;
  };

  try {
    const record = await createRecord(user.id, {
      content: body.content ?? "",
      images: body.images ?? [],
      input_type: body.input_type ?? "text",
      audio_duration: body.audio_duration ?? null,
      mood: body.mood ?? null
    });

    return NextResponse.json({ record });
  } catch (error) {
    return persistenceUnavailable(error);
  }
}
