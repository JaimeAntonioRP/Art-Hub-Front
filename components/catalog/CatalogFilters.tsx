"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AVAILABILITY_LABEL, CATALOG_SORTS, type CatalogFilters as Filters, type CatalogResponse } from "@/lib/api";
import { catalogHref } from "@/lib/catalog";

/**
 * Barra de filtros del catálogo. Es un formulario GET normal (funciona sin JavaScript);
 * con JavaScript, los desplegables se aplican al elegir y la página no se recarga.
 */
export function CatalogFilters({ filters, facets }: { filters: Filters; facets: CatalogResponse["facets"] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const activeCount = (["artist", "technique", "availability", "price_min", "price_max"] as const)
    .filter((k) => filters[k]).length;

  function apply(form: HTMLFormElement) {
    // Al filtrar se vuelve a la página 1; el orden por defecto no ensucia la URL.
    const next = Object.fromEntries(new FormData(form)) as Filters;
    if (next.sort === "recent") delete next.sort;
    startTransition(() => router.push(catalogHref(next), { scroll: false }));
  }

  return (
    <form
      action="/obras"
      method="get"
      role="search"
      className="cat-filters"
      data-js={hydrated || undefined}
      data-open={open || undefined}
      data-pending={pending || undefined}
      onSubmit={(e) => { e.preventDefault(); apply(e.currentTarget); }}
      onChange={(e) => { if (e.target instanceof HTMLSelectElement) apply(e.currentTarget); }}
    >
      <div className="cat-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <label htmlFor="cat-q" className="sr-only">Buscar</label>
        <input id="cat-q" name="q" type="search" defaultValue={filters.q} placeholder="Buscar por obra, artista o código" />
      </div>

      <button type="button" className="cat-toggle" aria-expanded={open} aria-controls="cat-more" onClick={() => setOpen(!open)}>
        Filtros{activeCount ? ` (${activeCount})` : ""}
      </button>

      <div id="cat-more" className="cat-more">
        <Select name="artist" label="Artista" value={filters.artist} all="Todos los artistas"
          options={facets.artists.map((a) => [a.slug, `${a.name} (${a.total})`])} />
        <Select name="technique" label="Técnica" value={filters.technique} all="Todas las técnicas"
          options={facets.techniques.map((t) => [t, t])} />
        <Select name="availability" label="Disponibilidad" value={filters.availability} all="Cualquiera"
          options={Object.entries(AVAILABILITY_LABEL)} />
        <fieldset className="cat-field cat-price">
          <legend>Precio</legend>
          <div>
            <input name="price_min" type="number" min={0} step={100} inputMode="numeric" aria-label="Precio mínimo"
              defaultValue={filters.price_min} placeholder="Mínimo" />
            <span aria-hidden="true">–</span>
            <input name="price_max" type="number" min={0} step={100} inputMode="numeric" aria-label="Precio máximo"
              defaultValue={filters.price_max} placeholder="Máximo" />
          </div>
        </fieldset>
        <Select name="sort" label="Ordenar" value={filters.sort} options={Object.entries(CATALOG_SORTS)} />
        <button type="submit" className="btn btn-outline-dark cat-apply">Aplicar</button>
      </div>
    </form>
  );
}

function Select({ name, label, value, all, options }: {
  name: string;
  label: string;
  value?: string;
  all?: string;
  options: [string, string][];
}) {
  return (
    <label className="cat-field">
      <span>{label}</span>
      <select name={name} defaultValue={value ?? ""}>
        {all ? <option value="">{all}</option> : null}
        {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    </label>
  );
}
