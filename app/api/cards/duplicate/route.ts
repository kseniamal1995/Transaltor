import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import * as db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = request.nextUrl;
    const foreignWord = searchParams.get("foreignWord");
    const deckId = searchParams.get("deckId");

    if (!foreignWord || !deckId) {
      return NextResponse.json({ error: "foreignWord and deckId are required" }, { status: 400 });
    }

    const isDuplicate = await db.isCardDuplicate(userId, foreignWord, deckId);
    return NextResponse.json({ isDuplicate });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
