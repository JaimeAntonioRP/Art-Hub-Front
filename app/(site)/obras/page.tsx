import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkCard } from "@/components/ArtworkCard";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { AVAILABILITY_LABEL, type CatalogFilters as Filters, type CatalogResponse } from "@/lib/api";
import { catalogHref, getCatalog, readFilters } from "@/lib/catalog";
import "@/components/catalog/catalog.css";

export const metadata: Metadata = {
  title: "Colección",
  description: "Obras de arte peruano con expediente revisado por ArtHub. Filtra por artista, técnica, precio y disponibilidad.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Catálogo público (§12): los filtros, el orden y el paginado se resuelven en el servidor. */
export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = readFilters(await searchParams);
  const catalog = await getCatalog(filters);

  return (
    <>
      <section className="cat-head">
        <div className="wrap">
          <div className="eyebrow">Colección</div>
          <h1>Obras disponibles</h1>
          <p>Cada obra pasa por la revisión del equipo de ArtHub antes de publicarse. Pide información o reserva sin compromiso: te contactamos para coordinar.</p>
        </div>
      </section>

      <section className="cat-body">
        <div className="wrap">
          {catalog ? (
            <>
              <CatalogFilters filters={filters} facets={catalog.facets} />
              <ResultsBar filters={filters} catalog={catalog} />
              {catalog.data.length ? (
                <div className="blk-works cat-grid">
                  {catalog.data.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
                </div>
              ) : (
                <div className="cat-empty">
                  <h2>No encontramos obras con esos filtros</h2>
                  <p>Prueba con otra búsqueda o quita algún filtro.</p>
                  <Link href="/obras" className="btn btn-outline-dark">Ver toda la colección</Link>
                </div>
              )}
              <Pagination filters={filters} meta={catalog.meta} />
            </>
          ) : (
            <div className="cat-empty">
              <h2>No pudimos cargar la colección</h2>
              <p>Vuelve a intentarlo en unos minutos.</p>
              <Link href="/obras" className="btn btn-outline-dark">Reintentar</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/** Total de resultados y filtros activos, cada uno con su «quitar». */
function ResultsBar({ filters, catalog }: { filters: Filters; catalog: CatalogResponse }) {
  const base = { ...filters, page: undefined }; // quitar un filtro vuelve a la página 1
  const artistName = catalog.facets.artists.find((a) => a.slug === filters.artist)?.name;
  const chips: [keyof Filters, string][] = [];
  if (filters.q) chips.push(["q", `«${filters.q}»`]);
  if (filters.artist) chips.push(["artist", artistName ?? filters.artist]);
  if (filters.technique) chips.push(["technique", filters.technique]);
  if (filters.availability) chips.push(["availability", AVAILABILITY_LABEL[filters.availability] ?? filters.availability]);
  if (filters.price_min) chips.push(["price_min", `Desde ${filters.price_min}`]);
  if (filters.price_max) chips.push(["price_max", `Hasta ${filters.price_max}`]);

  const total = catalog.meta.total;

  return (
    <div className="cat-results">
      <p aria-live="polite">{total === 1 ? "1 obra" : `${total} obras`}</p>
      {chips.length ? (
        <ul className="cat-chips">
          {chips.map(([key, label]) => (
            <li key={key}>
              <Link href={catalogHref({ ...base, [key]: undefined })} aria-label={`Quitar filtro ${label}`}>
                {label} <span aria-hidden="true">×</span>
              </Link>
            </li>
          ))}
          {chips.length > 1 ? <li><Link href={catalogHref({ sort: filters.sort })} className="cat-clear">Limpiar todo</Link></li> : null}
        </ul>
      ) : null}
    </div>
  );
}

function Pagination({ filters, meta }: { filters: Filters; meta: CatalogResponse["meta"] }) {
  const { current_page: current, last_page: last } = meta;
  if (last <= 1) return null;

  const href = (page: number) => catalogHref({ ...filters, page: page > 1 ? String(page) : undefined });
  // Primera, última y dos a cada lado de la actual; los huecos se marcan con «…».
  const pages = Array.from({ length: last }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === last || Math.abs(p - current) <= 2);

  return (
    <nav className="cat-pages" aria-label="Páginas del catálogo">
      {current > 1 ? <Link href={href(current - 1)} rel="prev">← Anterior</Link> : <span aria-hidden="true" />}
      <ol>
        {pages.map((p, i) => (
          <li key={p}>
            {i > 0 && p - pages[i - 1] > 1 ? <span className="cat-gap" aria-hidden="true">…</span> : null}
            {p === current
              ? <span aria-current="page">{p}</span>
              : <Link href={href(p)} aria-label={`Página ${p}`}>{p}</Link>}
          </li>
        ))}
      </ol>
      {current < last ? <Link href={href(current + 1)} rel="next">Siguiente →</Link> : <span aria-hidden="true" />}
    </nav>
  );
}
