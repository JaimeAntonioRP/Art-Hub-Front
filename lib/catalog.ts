import { API_BASE, type ArtworkDetail, type CatalogFilters, type CatalogResponse } from "@/lib/api";

/** Igual que el contenido del panel: los cambios se ven en menos de un minuto. */
const REVALIDATE_SECONDS = 60;

const FILTER_KEYS = ["q", "artist", "technique", "availability", "price_min", "price_max", "sort", "page"] as const;

/** Filtros del catálogo leídos de la URL; se descartan los vacíos y los repetidos. */
export function readFilters(searchParams: Record<string, string | string[] | undefined>): CatalogFilters {
  const filters: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const raw = searchParams[key];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (value) filters[key] = value;
  }
  return filters as CatalogFilters;
}

/** Enlace al catálogo con los filtros dados (sin los vacíos). */
export function catalogHref(filters: CatalogFilters): string {
  const qs = new URLSearchParams(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();
  return qs ? `/obras?${qs}` : "/obras";
}

/** Catálogo filtrado en el servidor. Devuelve null si la API no responde o rechaza los filtros. */
export async function getCatalog(filters: CatalogFilters): Promise<CatalogResponse | null> {
  const qs = new URLSearchParams({ ...filters, per_page: "12" } as Record<string, string>);
  try {
    const res = await fetch(`${API_BASE}/artworks?${qs}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    return res.ok ? ((await res.json()) as CatalogResponse) : null;
  } catch {
    return null;
  }
}

/** Ficha de una obra publicada; null si no existe o no está publicada. */
export async function getArtwork(id: number): Promise<ArtworkDetail | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const res = await fetch(`${API_BASE}/artworks/${id}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} al cargar la obra ${id}`);
  return (await res.json()) as ArtworkDetail;
}
