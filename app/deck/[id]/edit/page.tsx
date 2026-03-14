import { DeckEditContent } from "@/components/DeckEditContent";

export default async function DeckEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  return <DeckEditContent deckId={id} lang={lang} />;
}
