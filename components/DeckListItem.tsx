"use client";

import Link from "next/link";
import { CARD_INTERACTIVE_CLASSES } from "@/lib/ui-classes";
import { DeckProgressBar } from "./DeckProgressBar";

interface DeckListItemProps {
  id: string;
  name: string;
  learned: number;
  total: number;
  lang?: string;
}

export function DeckListItem({ id, name, learned, total, lang }: DeckListItemProps) {
  const href = lang ? `/deck/${id}?lang=${encodeURIComponent(lang)}` : `/deck/${id}`;
  return (
    <Link
      href={href}
      className={CARD_INTERACTIVE_CLASSES}
    >
      <h3 className="font-semibold text-text mb-2">{name}</h3>
      <DeckProgressBar learned={learned} total={total} />
    </Link>
  );
}
