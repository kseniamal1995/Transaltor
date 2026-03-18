import { DeckEditContent } from "@/components/DeckEditContent";

export default async function DeckEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; targetLang?: string }>;
}) {
  const { id } = await params;
  const { lang, targetLang } = await searchParams;
  return <DeckEditContent deckId={id} lang={lang} targetLang={targetLang} />;
}
