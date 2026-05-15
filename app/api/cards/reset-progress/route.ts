import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import * as db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { deckId, lang, targetLang } = body;

    if (!deckId) {
      return NextResponse.json({ error: "deckId is required" }, { status: 400 });
    }

    await db.resetDeckProgress(userId, deckId, lang, targetLang);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
