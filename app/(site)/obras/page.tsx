"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type Artwork } from "@/lib/api";

function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

/* ── Artwork card ─────────────────────────────────────────────────────── */
function ArtworkCard({ a }: { a: Artwork }) {
  const has3D = Boolean(a.model_3d_url);

  return (
    <Link
      href={`/obras/${a.id}`}
      style={{
        background: "var(--paper-card)",
        border: "1px solid var(--rule)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "transform .25s, box-shadow .25s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 40px rgba(13,27,42,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
      }}
    >
      {/* imagen */}
      <div style={{ position: "relative", aspectRatio: "4 / 3", flexShrink: 0 }}>
        <img
          src={a.image_url}
          alt={a.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.src.endsWith("/placeholder-obra.svg")) el.src = "/placeholder-obra.svg";
          }}
        />

        {/* badge 3D/AR */}
        {has3D && (
          <span style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(13,27,42,0.78)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(203,162,74,0.5)",
            color: "#CBA24A", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "4px 8px", borderRadius: 4,
            fontFamily: "'Inter',sans-serif",
          }}>
            3D / AR
          </span>
        )}

        {/* badge certificada */}
        {a.certificate && (
          <span style={{
            position: "absolute", bottom: 10, left: 10,
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(247,242,235,0.92)", backdropFilter: "blur(4px)",
            border: "1px solid rgba(203,162,74,0.35)",
            padding: "4px 9px", borderRadius: 999,
            fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
            color: "var(--ink)", fontFamily: "'Inter',sans-serif",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco,#CBA24A)" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            Certificada
          </span>
        )}

        {/* sold overlay */}
        {a.status === "sold" && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(13,27,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              background: "rgba(13,27,42,0.82)", color: "#EFE6D5",
              padding: "6px 14px", borderRadius: 6,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", fontFamily: "'Inter',sans-serif",
            }}>Vendida</span>
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div className="kicker" style={{ fontSize: 10.5 }}>{a.artist_name}</div>
        <h3 className="serif" style={{ fontSize: 20, lineHeight: 1.15, margin: 0 }}>{a.title}</h3>

        {(a.technique || a.year || a.dimensions) && (
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
            {[a.technique, a.year, a.dimensions].filter(Boolean).join(" · ")}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <strong style={{ color: "var(--oro-cusco)", fontSize: 17, fontFamily: "'Cormorant Garamond',serif", fontWeight: 500 }}>
            {formatPrice(a.price)}
          </strong>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {has3D && (
              <span title="Vista 3D y AR disponible">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco,#CBA24A)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 2 7l10 5 10-5-10-5Z"/>
                  <path d="m2 17 10 5 10-5"/>
                  <path d="m2 12 10 5 10-5"/>
                </svg>
              </span>
            )}
            <span className="muted" style={{ fontSize: 12 }}>Ver →</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
type Sort = "recent" | "price_asc" | "price_desc" | "title";

export default function CatalogoPage() {
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [only3D, setOnly3D] = useState(false);
  const [onlyCert, setOnlyCert] = useState(false);
  const [onlyAvail, setOnlyAvail] = useState(false);

  useEffect(() => {
    api
      .listArtworks()
      .then(setArtworks)
      .catch(() => setError("No fue posible cargar el catálogo."));
  }, []);

  const artists = useMemo(() => {
    if (!artworks) return [];
    return [...new Set(artworks.map((a) => a.artist_name))].sort();
  }, [artworks]);

  const filtered = useMemo(() => {
    if (!artworks) return [];
    let list = [...artworks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.artist_name.toLowerCase().includes(q)
      );
    }
    if (artist !== "all") list = list.filter((a) => a.artist_name === artist);
    if (only3D) list = list.filter((a) => Boolean(a.model_3d_url));
    if (onlyCert) list = list.filter((a) => Boolean(a.certificate));
    if (onlyAvail) list = list.filter((a) => a.status === "available");
    if (priceMin) list = list.filter((a) => Number(a.price) >= Number(priceMin));
    if (priceMax) list = list.filter((a) => Number(a.price) <= Number(priceMax));

    if (sort === "price_asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price_desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    // "recent" = default API order (by id desc)

    return list;
  }, [artworks, search, artist, only3D, onlyCert, onlyAvail, priceMin, priceMax, sort]);

  const hasFilters = search || artist !== "all" || only3D || onlyCert || onlyAvail || priceMin || priceMax;

  const clearFilters = () => {
    setSearch(""); setArtist("all"); setSort("recent");
    setPriceMin(""); setPriceMax("");
    setOnly3D(false); setOnlyCert(false); setOnlyAvail(false);
  };

  return (
    <>
      {/* ── cabecera ── */}
      <div style={{
        background: "var(--paper)",
        borderBottom: "1px solid var(--rule)",
        padding: "52px 0 36px",
      }}>
        <div className="wrap">
          <span className="eyebrow">Arte certificado · Cusco, Perú</span>
          <h1 className="h-display" style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>
            Catálogo de <em>Obras Maestras</em>
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 15.5, maxWidth: "62ch", margin: 0, lineHeight: 1.6 }}>
            Cada obra ha sido autenticada biométricamente y certificada en blockchain.
            Adquiere arte cusqueño con respaldo tecnológico y trazabilidad completa.
          </p>
        </div>
      </div>

      {/* ── filtros ── */}
      <div style={{
        background: "var(--paper-2)",
        borderBottom: "1px solid var(--rule)",
        padding: "16px 0",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div className="wrap">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* búsqueda */}
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar obra o artista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px 8px 32px",
                  border: "1px solid var(--rule)", borderRadius: 8,
                  fontSize: 13.5, background: "var(--paper-card)",
                  color: "var(--ink)", fontFamily: "'Inter',sans-serif",
                  outline: "none",
                }}
              />
            </div>

            {/* artista */}
            <select
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={{
                padding: "8px 12px", border: "1px solid var(--rule)", borderRadius: 8,
                fontSize: 13, background: "var(--paper-card)", color: "var(--ink)",
                fontFamily: "'Inter',sans-serif", cursor: "pointer", flex: "0 0 auto",
              }}
            >
              <option value="all">Todos los artistas</option>
              {artists.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            {/* ordenar */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              style={{
                padding: "8px 12px", border: "1px solid var(--rule)", borderRadius: 8,
                fontSize: 13, background: "var(--paper-card)", color: "var(--ink)",
                fontFamily: "'Inter',sans-serif", cursor: "pointer", flex: "0 0 auto",
              }}
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="title">Título A–Z</option>
            </select>

            {/* precio */}
            <input
              type="number"
              placeholder="Precio mín. USD"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              style={{
                width: 130, padding: "8px 10px", border: "1px solid var(--rule)", borderRadius: 8,
                fontSize: 13, background: "var(--paper-card)", color: "var(--ink)",
                fontFamily: "'Inter',sans-serif", flex: "0 0 auto",
              }}
            />
            <input
              type="number"
              placeholder="Precio máx. USD"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              style={{
                width: 130, padding: "8px 10px", border: "1px solid var(--rule)", borderRadius: 8,
                fontSize: 13, background: "var(--paper-card)", color: "var(--ink)",
                fontFamily: "'Inter',sans-serif", flex: "0 0 auto",
              }}
            />

            {/* checkboxes */}
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif", color: "var(--ink)" }}>
              <input type="checkbox" checked={only3D} onChange={(e) => setOnly3D(e.target.checked)} style={{ accentColor: "var(--oro-cusco)", width: 14, height: 14 }} />
              Solo con 3D / AR
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif", color: "var(--ink)" }}>
              <input type="checkbox" checked={onlyCert} onChange={(e) => setOnlyCert(e.target.checked)} style={{ accentColor: "var(--oro-cusco)", width: 14, height: 14 }} />
              Certificadas
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif", color: "var(--ink)" }}>
              <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} style={{ accentColor: "var(--oro-cusco)", width: 14, height: 14 }} />
              Disponibles
            </label>
          </div>
        </div>
      </div>

      {/* ── resultados ── */}
      <section style={{ background: "var(--paper)", padding: "32px 0 80px" }}>
        <div className="wrap">
          {/* contador + clear */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 13.5, color: "var(--ink-soft)", fontFamily: "'Inter',sans-serif" }}>
              {artworks
                ? <><strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> obra{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</>
                : "Cargando..."}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  fontSize: 12.5, color: "var(--ink-soft)", background: "transparent",
                  border: "1px solid var(--rule)", borderRadius: 6, padding: "5px 12px",
                  cursor: "pointer", fontFamily: "'Inter',sans-serif",
                }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {error ? (
            <p className="muted">{error}</p>
          ) : !artworks ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "var(--paper-card)", border: "1px solid var(--rule)" }}>
                  <div style={{ aspectRatio: "4/3", background: "var(--piedra-andina,#E6D5BB)", animation: "pulse 1.4s ease-in-out infinite" }} />
                  <div style={{ padding: 18 }}>
                    <div style={{ height: 10, borderRadius: 4, background: "var(--piedra-andina,#E6D5BB)", width: "40%", marginBottom: 10 }} />
                    <div style={{ height: 18, borderRadius: 4, background: "var(--piedra-andina,#E6D5BB)", width: "70%", marginBottom: 8 }} />
                    <div style={{ height: 10, borderRadius: 4, background: "var(--piedra-andina,#E6D5BB)", width: "55%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-soft)", fontFamily: "'Inter',sans-serif" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ margin: "0 auto 16px", opacity: 0.4 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p style={{ fontSize: 15, margin: "0 0 8px" }}>No se encontraron obras con esos filtros.</p>
              <button type="button" onClick={clearFilters}
                style={{ fontSize: 13, color: "var(--oro-cusco)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {filtered.map((a) => <ArtworkCard key={a.id} a={a} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
