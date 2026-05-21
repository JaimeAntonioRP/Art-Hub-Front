"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Artist, type Artwork } from "@/lib/api";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function usd(value: string | number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function lifespan(artist: Artist): string {
  if (!artist.birth_year) return "";
  const end = artist.death_year ? String(artist.death_year) : "presente";
  return `${artist.birth_year} – ${end}`;
}

/* ── ArtworkCard ─────────────────────────────────────────────────────────── */

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
        background: "var(--paper-card, #FFFFFF)",
        border: "1px solid var(--rule, #E6D5BB)",
        borderRadius: 10,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow .25s, transform .25s",
        boxShadow: hovered
          ? "0 12px 32px rgba(24,19,15,0.12)"
          : "0 2px 8px rgba(24,19,15,0.04)",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "var(--arena, #EFE6D5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${artwork.image_url}), url(/placeholder-obra.svg)`,
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
        {artwork.status === "sold" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(13,27,42,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "rgba(184,101,59,0.9)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: 4,
              }}
            >
              Vendida
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <h3 className="serif" style={{ fontSize: 16, lineHeight: 1.25, margin: 0 }}>
          {artwork.title}
        </h3>
        <strong
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 18,
            color: "var(--oro-cusco, #CBA24A)",
            marginTop: 6,
          }}
        >
          {usd(artwork.price)}
        </strong>
      </div>
    </Link>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function ArtistDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);

  const [data, setData] = useState<{ artist: Artist; artworks: Artwork[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .getArtist(slug)
      .then(setData)
      .catch(() => setError("No se pudo cargar el perfil del artista."));
  }, [slug]);

  if (error) {
    return (
      <section style={{ padding: "80px 0", textAlign: "center" }}>
        <p className="muted">{error}</p>
        <Link href="/artistas" className="btn btn-outline-dark" style={{ marginTop: 20 }}>
          ← Volver a artistas
        </Link>
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ padding: "80px 0" }}>
        <div className="wrap">
          {/* skeleton */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 48,
              animation: "pulse 1.6s ease-in-out infinite",
            }}
          >
            <div
              style={{
                aspectRatio: "3/4",
                borderRadius: 12,
                background: "var(--arena, #EFE6D5)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[70, 45, 90, 55, 80, 60].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: i === 0 ? 32 : 14,
                    width: `${w}%`,
                    borderRadius: 4,
                    background: "var(--piedra-andina, #E6D5BB)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </section>
    );
  }

  const { artist, artworks } = data;
  const years = lifespan(artist);

  return (
    <>
      {/* ── HERO / PROFILE ─────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--arena, #EFE6D5)",
          borderBottom: "1px solid var(--rule, #E6D5BB)",
        }}
      >
        <div
          className="wrap"
          style={{
            paddingTop: 48,
            paddingBottom: 56,
            display: "grid",
            gridTemplateColumns: "clamp(180px,22vw,280px) 1fr",
            gap: "clamp(24px,4vw,56px)",
            alignItems: "start",
          }}
        >
          {/* portrait */}
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              aspectRatio: "3/4",
              background: "var(--piedra-andina, #E6D5BB)",
              boxShadow: "0 8px 28px rgba(13,27,42,0.14)",
              flexShrink: 0,
            }}
          >
            <img
              src={artist.profile_image_url}
              alt={artist.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.endsWith("/placeholder-obra.svg")) el.src = "/placeholder-obra.svg";
              }}
            />
          </div>

          {/* info */}
          <div style={{ paddingTop: 8 }}>
            <Link
              href="/artistas"
              style={{
                fontSize: 12,
                color: "var(--ink-soft, #6B7A8A)",
                textDecoration: "none",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 20,
              }}
            >
              ← Artistas
            </Link>

            {artist.featured && (
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(203,162,74,0.18)",
                  color: "#7A5E10",
                  border: "1px solid rgba(203,162,74,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 4,
                  marginBottom: 14,
                }}
              >
                Artista Destacado
              </div>
            )}

            <h1
              className="serif"
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.1,
                margin: "0 0 8px",
                color: "var(--ink, #0D1B2A)",
              }}
            >
              {artist.name}
            </h1>

            {years && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "var(--ink-soft, #6B7A8A)",
                  margin: "0 0 16px",
                }}
              >
                {years}
              </p>
            )}

            {/* metadata pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Origen", value: artist.origin },
                { label: "Especialidad", value: artist.specialty },
                {
                  label: "Obras en catálogo",
                  value: `${artworks.length} ${artworks.length === 1 ? "obra" : "obras"}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--marfil, #F7F2EB)",
                    border: "1px solid var(--rule, #E6D5BB)",
                    borderRadius: 8,
                    padding: "8px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--ink-soft, #6B7A8A)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: 3,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--ink, #0D1B2A)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* bio */}
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--ink, #0D1B2A)",
                maxWidth: 640,
                margin: 0,
              }}
            >
              {artist.bio}
            </p>
          </div>
        </div>
      </div>

      {/* ── ARTWORKS ─────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", padding: "56px 0 96px" }}>
        <div className="wrap">
          <h2
            className="serif"
            style={{
              fontSize: 26,
              fontWeight: 400,
              marginBottom: 32,
              color: "var(--ink, #0D1B2A)",
            }}
          >
            Obras de <em>{artist.name}</em>
          </h2>

          {artworks.length === 0 ? (
            <p className="muted">
              Este artista no tiene obras en el catálogo todavía.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {artworks.map((aw) => (
                <ArtworkCard key={aw.id} artwork={aw} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <Link href="/catalogo" className="btn btn-outline-dark">
              Ver catálogo completo
            </Link>
          </div>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  );
}
