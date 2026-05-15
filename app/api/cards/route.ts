import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import * as db from "@/lib/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const cards = await db.getCards(userId);
    return NextResponse.json(cards);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { foreign_word, translation, custom_translation, foreign_language, translation_language, deck_ids } = body;

    if (!foreign_word?.trim() || !translation?.trim()) {
      return NextResponse.json({ error: "foreign_word and translation are required" }, { status: 400 });
    }

    const card = await db.createCard(userId, {
      foreign_word: foreign_word.trim(),
      translation: translation.trim(),
      custom_translation: custom_translation?.trim() || undefined,
      foreign_language: foreign_language || undefined,
      translation_language: translation_language || undefined,
      deck_ids: deck_ids ?? [],
    });
    return NextResponse.json(card, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { id, learned } = body;

    if (!id || typeof learned !== "boolean") {
      return NextResponse.json({ error: "id and learned are required" }, { status: 400 });
    }

    await db.updateCardLearned(userId, id, learned);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const lang = searchParams.get("lang");
    const targetLang = searchParams.get("targetLang");
    const deckId = searchParams.get("deckId");

    if (lang && targetLang) {
      await db.deleteCardsByLanguagePair(userId, lang, targetLang);
    } else if (lang) {
      await db.deleteCardsByLanguage(userId, lang);
    } else if (id) {
      await db.deleteCard(userId, id);
    } else {
      return NextResponse.json({ error: "id or lang is required" }, { status: 400 });
    }

    if (deckId) {
      await db.resetDeckProgress(userId, deckId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
