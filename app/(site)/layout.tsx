import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();

  return {
    title: { default: site.brand.name, template: `%s · ${site.brand.name}` },
    description: site.meta_description ?? undefined,
    icons: site.brand.logo_url ? { icon: site.brand.logo_url } : undefined,
  };
}

/** Header y footer se arman con los Ajustes del sitio del panel (GET /api/site). */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();

  return (
    <>
      <SiteHeader site={site} />
      {children}
      <SiteFooter site={site} />
    </>
  );
}
