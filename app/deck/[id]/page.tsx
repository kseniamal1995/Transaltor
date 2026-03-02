import { DeckViewContent } from "@/components/DeckViewContent";

export default async function DeckPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  return <DeckViewContent deckId={id} lang={lang} />;
}
