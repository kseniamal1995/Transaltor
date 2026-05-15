import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import * as db from "@/lib/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const decks = await db.getDecks(userId);
    return NextResponse.json(decks);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const deck = await db.createDeck(userId, name);
    return NextResponse.json(deck, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { id, name } = body;
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "id and name are required" }, { status: 400 });
    }
    await db.renameDeck(userId, id, name.trim());
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
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await db.deleteDeck(userId, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
