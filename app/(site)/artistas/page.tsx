"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Artist } from "@/lib/api";

/* ── helpers ────────────────────────────────────────────────────────────── */

function lifespan(artist: Artist): string {
  if (!artist.birth_year) return "";
  const end = artist.death_year ? String(artist.death_year) : "presente";
  return `${artist.birth_year} – ${end}`;
}

/* ── ArtistCard ─────────────────────────────────────────────────────────── */

function ArtistCard({ artist }: { artist: Artist }) {
  const [hovered, setHovered] = useState(false);
  const years = lifespan(artist);

  return (
    <Link
      href={`/artistas/${artist.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--paper-card, #FFFFFF)",
        border: "1px solid var(--rule, #E6D5BB)",
        borderRadius: 12,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow .25s, transform .25s",
        boxShadow: hovered
          ? "0 14px 36px rgba(24,19,15,0.13)"
          : "0 2px 8px rgba(24,19,15,0.05)",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      {/* portrait */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3 / 4",
          overflow: "hidden",
          background: "var(--arena, #EFE6D5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${artist.profile_image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            transition: "transform .5s",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(13,27,42,0.55) 0%, transparent 55%)",
          }}
        />
        {/* featured badge */}
        {artist.featured && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(203,162,74,0.92)",
              color: "#14110C",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "4px 9px",
              borderRadius: 4,
            }}
          >
            Destacado
          </span>
        )}
        {/* name overlay on image */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 18,
            right: 18,
          }}
        >
          <div
            style={{
              color: "rgba(237,227,204,0.75)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              marginBottom: 4,
            }}
          >
            {years}
          </div>
          <h2
            className="serif"
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.15,
              color: "#EDE3CC",
            }}
          >
            {artist.name}
          </h2>
        </div>
      </div>

      {/* card body */}
      <div
        style={{
          padding: "14px 18px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--oro-cusco, #CBA24A)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {artist.specialty}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: "var(--ink-soft, #6B7A8A)",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {artist.bio}
        </p>
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid var(--rule, #E6D5BB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              color: "var(--ink-soft, #6B7A8A)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {artist.origin}
          </span>
          {typeof artist.total_obras === "number" && (
            <span
              style={{
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                background: "var(--arena, #EFE6D5)",
                color: "var(--ink, #0D1B2A)",
                padding: "3px 10px",
                borderRadius: 99,
                fontWeight: 500,
              }}
            >
              {artist.total_obras} {artist.total_obras === 1 ? "obra" : "obras"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── skeleton ────────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--rule, #E6D5BB)",
        animation: "pulse 1.6s ease-in-out infinite",
        background: "var(--paper-2, #F0E8D8)",
      }}
    >
      <div style={{ aspectRatio: "3/4", background: "var(--arena, #EFE6D5)" }} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            height: 10,
            width: "60%",
            borderRadius: 4,
            background: "var(--piedra-andina, #E6D5BB)",
          }}
        />
        <div
          style={{
            height: 10,
            width: "90%",
            borderRadius: 4,
            background: "var(--piedra-andina, #E6D5BB)",
          }}
        />
        <div
          style={{
            height: 10,
            width: "75%",
            borderRadius: 4,
            background: "var(--piedra-andina, #E6D5BB)",
          }}
        />
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function ArtistasPage() {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .listArtists()
      .then(setArtists)
      .catch(() => setError("No fue posible cargar los artistas."));
  }, []);

  const filtered =
    artists?.filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q) ||
        a.origin.toLowerCase().includes(q)
      );
    }) ?? [];

  const featured = filtered.filter((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Maestros del Arte · Cusco, Perú
          </div>
          <h1
            className="h-display"
            style={{
              color: "var(--ink-soft)",
              fontSize: "clamp(38px, 5vw, 64px)",
              maxWidth: 640,
              marginBottom: 16,
            }}
          >
            Los <em>Artistas</em> detrás de cada obra
          </h1>
          <p
            style={{
              color: "var(--ink-soft)",
              maxWidth: 540,
              marginTop: 0,
              marginBottom: 36,
              fontSize: 15.5,
            }}
          >
            Desde el barroco colonial hasta el arte contemporáneo andino: conoce a
            los maestros cuya obra puedes adquirir y certificar en Arthub.
          </p>

          {/* search */}
          <input
            type="search"
            placeholder="Buscar artista, especialidad u origen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--piedra-andina)",
              borderRadius: 6,
              color: "var(--ink)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              padding: "10px 14px",
              outline: "none",
              width: "100%",
              maxWidth: 420,
            }}
          />
        </div>

        {/* wave */}
        <div style={{ height: 28, background: "var(--arena)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 28,
              background: "var(--marfil)",
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          />
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", padding: "48px 0 96px" }}>
        <div className="wrap">
          {error ? (
            <p className="muted">{error}</p>
          ) : !artists ? (
            <>
              <div style={{ marginBottom: 40 }}>
                <div
                  style={{
                    height: 20,
                    width: 180,
                    borderRadius: 4,
                    background: "var(--arena)",
                    marginBottom: 24,
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: 24,
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>
            </>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <p className="muted">
                No hay artistas que coincidan con &quot;{search}&quot;.
              </p>
              <button
                type="button"
                className="btn btn-outline-dark"
                style={{ marginTop: 16 }}
                onClick={() => setSearch("")}
              >
                Ver todos
              </button>
            </div>
          ) : (
            <>
              {/* stats bar */}
              <p className="muted" style={{ fontSize: 13.5, marginBottom: 32 }}>
                {search
                  ? `${filtered.length} de ${artists.length} artistas`
                  : `${artists.length} artistas en el catálogo`}
              </p>

              {/* featured */}
              {!search && featured.length > 0 && (
                <section style={{ marginBottom: 56 }}>
                  <h2
                    className="serif"
                    style={{
                      fontSize: 22,
                      marginBottom: 24,
                      color: "var(--ink)",
                      fontWeight: 400,
                    }}
                  >
                    Artistas Destacados
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 24,
                    }}
                  >
                    {featured.map((a) => (
                      <ArtistCard key={a.id} artist={a} />
                    ))}
                  </div>
                </section>
              )}

              {/* rest (or all when searching) */}
              {(search ? filtered : rest).length > 0 && (
                <section>
                  {!search && rest.length > 0 && (
                    <h2
                      className="serif"
                      style={{
                        fontSize: 22,
                        marginBottom: 24,
                        color: "var(--ink)",
                        fontWeight: 400,
                      }}
                    >
                      Más Artistas
                    </h2>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 24,
                    }}
                  >
                    {(search ? filtered : rest).map((a) => (
                      <ArtistCard key={a.id} artist={a} />
                    ))}
                  </div>
                </section>
              )}
            </>
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
