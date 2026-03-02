"use client";

import Link from "next/link";
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
      className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
      <DeckProgressBar learned={learned} total={total} />
    </Link>
  );
}
