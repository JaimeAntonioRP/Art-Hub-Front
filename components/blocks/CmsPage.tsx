import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, type Block } from "@/lib/content";
import { BlockRenderer } from "./BlockRenderer";

/** Portada mínima si la API no responde: el sitio no queda en blanco. */
const HOME_FALLBACK: Block[] = [
  {
    type: "hero",
    data: {
      eyebrow: "Arte cusqueño",
      title: "Catálogo de",
      highlight: "obras cusqueñas",
      primary_label: "Explorar catálogo",
      primary_url: "/obras",
    },
  },
];

export async function cmsMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return {};

  const description = page.description ?? undefined;

  // La portada usa el título por defecto del sitio: no se envía la clave, porque
  // `title: undefined` lo dejaría en blanco.
  return slug === "inicio" ? { description } : { title: page.title, description };
}

/** Página armada en el panel (Sitio web → Páginas). */
export async function CmsPage({ slug }: { slug: string }) {
  const page = await getPage(slug);

  if (!page) {
    if (slug === "inicio") return <BlockRenderer blocks={HOME_FALLBACK} />;
    notFound();
  }

  return <BlockRenderer blocks={page.blocks} />;
}
