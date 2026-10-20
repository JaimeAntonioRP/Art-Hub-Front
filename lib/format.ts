import type { Artwork } from "@/lib/api";

/** Precio de la obra en su moneda, o "Consultar precio" cuando no se publica. */
export function formatArtworkPrice(a: Pick<Artwork, "price" | "currency" | "show_price">): string {
  if (!a.show_price || a.price === null) return "Consultar precio";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: a.currency,
    maximumFractionDigits: 0,
  }).format(Number(a.price));
}
