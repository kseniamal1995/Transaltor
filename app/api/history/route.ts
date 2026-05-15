import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import * as db from "@/lib/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const history = await db.getHistory(userId);
    return NextResponse.json(history);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { foreign_word, translation, custom_translation, foreign_language, translation_language } = body;

    if (!foreign_word?.trim() || !translation?.trim()) {
      return NextResponse.json({ error: "foreign_word and translation are required" }, { status: 400 });
    }

    const item = await db.addToHistory(userId, {
      foreign_word: foreign_word.trim(),
      translation: translation.trim(),
      custom_translation: custom_translation?.trim() || undefined,
      foreign_language: foreign_language || undefined,
      translation_language: translation_language || undefined,
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (id) {
      await db.removeFromHistory(userId, id);
    } else {
      await db.clearHistory(userId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
