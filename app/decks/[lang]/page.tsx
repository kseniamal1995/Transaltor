import { LanguageDeckPageContent } from "@/components/LanguageDeckPageContent";

export default async function LanguageDeckPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ targetLang?: string }>;
}) {
  const { lang } = await params;
  const { targetLang } = await searchParams;
  return <LanguageDeckPageContent lang={lang} targetLang={targetLang} />;
}
