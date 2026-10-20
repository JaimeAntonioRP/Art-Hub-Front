import { API_BASE, type Artwork } from "@/lib/api";

/** Contenido editable desde el panel de ArtHub (Ajustes del sitio y Páginas). */

export type NavLink = { label: string; url: string };

export type SiteData = {
  brand: { name: string; tagline: string | null; logo_url: string | null };
  meta_description: string | null;
  utility: { text: string | null; link_label: string | null; link_url: string | null };
  header_menu: NavLink[];
  footer: { about: string | null; columns: { title: string; links: NavLink[] }[]; copyright: string | null };
  contact: { email: string | null; phone: string | null; address: string | null };
  social_links: { network: string; url: string }[];
};

type Buttons = {
  primary_label?: string;
  primary_url?: string;
  secondary_label?: string;
  secondary_url?: string;
};

export type FeaturedArtwork = Pick<
  Artwork,
  "id" | "code" | "title" | "artist_name" | "image_url" | "technique" | "year" | "dimensions"
  | "price" | "currency" | "show_price" | "availability" | "model_3d_url"
>;

export type Block =
  | { type: "hero"; data: Buttons & { eyebrow?: string; title: string; highlight?: string; text?: string; image_url?: string; show_featured_artwork?: boolean; artworks?: FeaturedArtwork[] } }
  | { type: "text"; data: { eyebrow?: string; title?: string; body: string } }
  | { type: "features"; data: { eyebrow?: string; title?: string; intro?: string; items: { icon?: string; title: string; text?: string }[] } }
  | { type: "steps"; data: { eyebrow?: string; title?: string; intro?: string; items: { title: string; text?: string }[] } }
  | { type: "image_text"; data: Pick<Buttons, "primary_label" | "primary_url"> & { eyebrow?: string; title: string; text?: string; image_url?: string; image_side?: "left" | "right" } }
  | { type: "featured_artworks"; data: { eyebrow?: string; title?: string; button_label?: string; artworks: FeaturedArtwork[] } }
  | { type: "team"; data: { eyebrow?: string; title?: string; intro?: string; members: { name: string; role?: string; role_label?: string; photo_url?: string; bio?: string; institutions?: string[] }[] } }
  | { type: "video"; data: { eyebrow?: string; title?: string; text?: string; video_url: string; poster_url?: string } }
  | { type: "faq"; data: { title?: string; items: { question: string; answer: string }[] } }
  | { type: "cta"; data: Buttons & { title: string; text?: string } };

export type PageData = { slug: string; title: string; description: string | null; blocks: Block[] };

/** Los cambios del panel aparecen en el sitio en menos de un minuto. */
const REVALIDATE_SECONDS = 60;

const FALLBACK_SITE: SiteData = {
  brand: { name: "ArtHub", tagline: "Arte · Tecnología · Confianza", logo_url: "/logifinal.png" },
  meta_description: null,
  utility: { text: null, link_label: null, link_url: null },
  header_menu: [{ label: "Catálogo", url: "/obras" }, { label: "Artistas", url: "/artistas" }],
  footer: { about: null, columns: [], copyright: null },
  contact: { email: null, phone: null, address: null },
  social_links: [],
};

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    // API caída o inaccesible durante el build: la página se regenera al revalidar.
    return null;
  }
}

/** Ajustes del sitio. Si la API no responde, el sitio se arma con un mínimo para no caerse. */
export async function getSite(): Promise<SiteData> {
  return (await getJson<SiteData>("/site")) ?? FALLBACK_SITE;
}

export async function getPage(slug: string): Promise<PageData | null> {
  return getJson<PageData>(`/pages/${encodeURIComponent(slug)}`);
}

/** Enlaces internos con <Link>; los externos y mailto/tel con <a>. */
export function isInternal(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}
