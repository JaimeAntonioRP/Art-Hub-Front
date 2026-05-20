"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type Artwork } from "@/lib/api";

/* ── helpers ─────────────────────────────────────────────────────────── */

function usd(value: string | number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/* ── sub-components ──────────────────────────────────────────────────── */

function CertBadge({ match }: { match: string | number }) {
  const pct = Number(match);
  const authentic = pct >= 85;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        letterSpacing: "0.08em",
        background: authentic ? "rgba(122,132,107,0.18)" : "rgba(197,106,74,0.15)",
        color: authentic ? "#4A5940" : "#7B3020",
        border: `1px solid ${authentic ? "rgba(122,132,107,0.35)" : "rgba(197,106,74,0.3)"}`,
      }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
        <circle cx="5" cy="5" r="4" />
      </svg>
      {pct.toFixed(1)}% cert.
    </span>
  );
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/obras/${artwork.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--paper-card)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow .25s, transform .25s",
        boxShadow: hovered ? "0 12px 32px rgba(24,19,15,0.12)" : "0 2px 8px rgba(24,19,15,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      {/* image */}
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${artwork.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform .4s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />
        {artwork.model_3d_url && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(20,17,12,0.7)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(237,227,204,0.25)",
              color: "#EDE3CC",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "4px 8px",
              borderRadius: 4,
            }}
          >
            3D / AR
          </span>
        )}
      </div>

      {/* body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div className="kicker">{artwork.artist_name}</div>
        <h3
          className="serif"
          style={{ fontSize: 19, lineHeight: 1.2, margin: 0, flex: 1 }}
        >
          {artwork.title}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <strong
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 21,
              color: "var(--oro-cusco)",
              letterSpacing: "-0.01em",
            }}
          >
            {usd(artwork.price)}
          </strong>
          {artwork.certificate && (
            <CertBadge match={artwork.certificate.match_percentage} />
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── main page ───────────────────────────────────────────────────────── */

type SortKey = "newest" | "price_asc" | "price_desc" | "match_desc";

export default function CatalogoPage() {
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [artist, setArtist]     = useState("all");
  const [sort, setSort]         = useState<SortKey>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [certified, setCertified] = useState(false);

  useEffect(() => {
    api.listArtworks()
      .then(setArtworks)
      .catch(() => setError("No fue posible cargar el catálogo."));
  }, []);

  const artists = useMemo(
    () => (artworks ? uniq(artworks.map((a) => a.artist_name)).sort() : []),
    [artworks],
  );

  const filtered = useMemo(() => {
    if (!artworks) return [];
    let list = [...artworks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist_name.toLowerCase().includes(q),
      );
    }

    if (artist !== "all") {
      list = list.filter((a) => a.artist_name === artist);
    }

    if (minPrice) {
      list = list.filter((a) => Number(a.price) >= Number(minPrice));
    }

    if (maxPrice) {
      list = list.filter((a) => Number(a.price) <= Number(maxPrice));
    }

    if (certified) {
      list = list.filter(
        (a) => a.certificate && Number(a.certificate.match_percentage) >= 85,
      );
    }

    switch (sort) {
      case "price_asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price_desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "match_desc":
        list.sort(
          (a, b) =>
            Number(b.certificate?.match_percentage ?? 0) -
            Number(a.certificate?.match_percentage ?? 0),
        );
        break;
      default:
        break;
    }

    return list;
  }, [artworks, search, artist, sort, minPrice, maxPrice, certified]);

  const inputSt: React.CSSProperties = {
    background: "rgba(237,227,204,0.08)",
    border: "1px solid rgba(237,227,204,0.2)",
    borderRadius: 6,
    color: "#EDE3CC",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    padding: "9px 12px",
    outline: "none",
  };

  const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer" };

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div
        className="hero"
        style={{ paddingBottom: 0 }}
      >
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Arte Certificado · Cusco, Perú
          </div>
          <h1
            className="h-display"
            style={{
              color: "var(--cream-on-dark)",
              fontSize: "clamp(40px, 5vw, 68px)",
              maxWidth: 680,
              marginBottom: 16,
            }}
          >
            Catálogo de <em>Obras Maestras</em>
          </h1>
          <p style={{ color: "#C9BFA9", maxWidth: 560, marginTop: 0, marginBottom: 36, fontSize: 15.5 }}>
            Cada obra ha sido autenticada biométricamente y certificada en blockchain.
            Adquiere arte cusqueño con respaldo tecnológico y trazabilidad completa.
          </p>

          {/* search + filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              paddingBottom: 0,
            }}
          >
            <input
              type="search"
              placeholder="Buscar obra o artista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputSt, flexGrow: 1, minWidth: 200 }}
            />

            <select
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={{ ...selectSt, minWidth: 190 }}
            >
              <option value="all">Todos los artistas</option>
              {artists.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ ...selectSt, minWidth: 170 }}
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="match_desc">Mayor autenticidad</option>
            </select>

            <input
              type="number"
              placeholder="Precio mín. USD"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ ...inputSt, width: 130 }}
            />
            <input
              type="number"
              placeholder="Precio máx. USD"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ ...inputSt, width: 130 }}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "var(--cream-on-dark)",
                fontSize: 13,
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                style={{ accentColor: "var(--oro-cusco)", width: 15, height: 15 }}
              />
              Solo certificadas
            </label>
          </div>
        </div>

        {/* dividing wave */}
        <div style={{ height: 28, background: "var(--dark)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 28,
              background: "var(--paper)",
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          />
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", padding: "48px 0 96px" }}>
        <div className="wrap">
          {/* results info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            {artworks ? (
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
                {filtered.length === artworks.length
                  ? `${artworks.length} obras disponibles`
                  : `${filtered.length} de ${artworks.length} obras`}
              </p>
            ) : (
              <span />
            )}
            {(search || artist !== "all" || minPrice || maxPrice || certified) && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: "6px 10px" }}
                onClick={() => {
                  setSearch("");
                  setArtist("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setCertified(false);
                }}
              >
                Limpiar filtros ×
              </button>
            )}
          </div>

          {error ? (
            <p className="muted">{error}</p>
          ) : !artworks ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--paper-2)",
                    border: "1px solid var(--rule)",
                    borderRadius: 10,
                    aspectRatio: "4/5",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <p className="muted">No hay obras que coincidan con los filtros aplicados.</p>
              <button
                type="button"
                className="btn btn-outline-dark"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setSearch("");
                  setArtist("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setCertified(false);
                }}
              >
                Ver todas las obras
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((a) => (
                <ArtworkCard key={a.id} artwork={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
