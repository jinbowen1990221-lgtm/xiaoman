import { NextResponse } from "next/server";
import { openTodayOptions } from "@/lib/mock-data";

export async function POST() {
  return NextResponse.json({
    options: openTodayOptions
  });
}
