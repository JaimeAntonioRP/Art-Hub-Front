import { CmsPage, cmsMetadata } from "@/components/blocks/CmsPage";

/** Páginas creadas en el panel (por ejemplo, términos o privacidad). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return cmsMetadata((await params).slug);
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CmsPage slug={(await params).slug} />;
}
