import type { Artwork } from "@/lib/api";

/** Precio de la obra en su moneda, o "Consultar precio" cuando no se publica. */
export function formatArtworkPrice(a: Pick<Artwork, "price" | "currency" | "show_price"> & { is_sample?: boolean }): string {
  if (a.is_sample) return "Dominio público · no a la venta";
  if (!a.show_price || a.price === null) return "Consultar precio";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: a.currency,
    maximumFractionDigits: 0,
  }).format(Number(a.price));
}

/** Año de la obra; «c. 1830» cuando la fuente solo da la década o el siglo. */
export function formatArtworkYear(a: { year?: number | null; year_circa?: boolean }): string | null {
  if (!a.year) return null;
  return a.year_circa ? `c. ${a.year}` : String(a.year);
}
