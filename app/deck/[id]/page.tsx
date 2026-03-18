import { DeckViewContent } from "@/components/DeckViewContent";

export default async function DeckPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; targetLang?: string }>;
}) {
  const { id } = await params;
  const { lang, targetLang } = await searchParams;
  return <DeckViewContent deckId={id} lang={lang} targetLang={targetLang} />;
}
