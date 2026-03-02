import { StudyPageContent } from "@/components/StudyPageContent";

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  return <StudyPageContent deckId={id} lang={lang} />;
}
