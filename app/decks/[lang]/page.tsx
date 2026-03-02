import { LanguageDeckPageContent } from "@/components/LanguageDeckPageContent";

export default async function LanguageDeckPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <LanguageDeckPageContent lang={lang} />;
}
