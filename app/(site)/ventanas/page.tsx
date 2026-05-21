"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type Artist, type Artwork } from "@/lib/api";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function usd(v: string | number, compact = false) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  } as Intl.NumberFormatOptions).format(Number(v));
}

/** formato corto y compacto: $284K, $1.2M */
function compactUsd(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

/** días/horas/min hasta la próxima cohorte */
function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.max(0, diff);
  const days  = Math.floor(total / 86_400_000);
  const hrs   = Math.floor((total % 86_400_000) / 3_600_000);
  const mins  = Math.floor((total % 3_600_000) / 60_000);
  const secs  = Math.floor((total % 60_000) / 1_000);
  return { days, hrs, mins, secs };
}

/* ── sub-components ──────────────────────────────────────────────────────── */

/* íconos de línea (estilo Tailwind/Lucide) */
const ICONS: Record<string, React.ReactNode> = {
  frame: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m3 16 5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </>
  ),
  check: (
    <>
      <path d="M9 12.5l2 2 4-4.5" />
      <path d="M12 3l2.4 1.7 2.9-.2 1.3 2.6 2.4 1.6-.7 2.8.7 2.8-2.4 1.6-1.3 2.6-2.9-.2L12 21l-2.4-1.7-2.9.2-1.3-2.6L3 15.3l.7-2.8L3 9.7l2.4-1.6 1.3-2.6 2.9.2z" />
    </>
  ),
  chain: (
    <>
      <path d="M9 12h6" />
      <path d="M10.5 8.5H8a3.5 3.5 0 0 0 0 7h2.5" />
      <path d="M13.5 8.5H16a3.5 3.5 0 0 1 0 7h-2.5" />
    </>
  ),
  artists: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M18 20a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  value: (
    <>
      <path d="M3 17l5-5 4 3 8-8" />
      <path d="M16 4h5v5" />
    </>
  ),
};

function StatBox({
  value, label, icon, accent,
}: { value: string | number; label: string; icon?: keyof typeof ICONS; accent?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const isLong = String(value).length > 6;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        background: accent
          ? "linear-gradient(165deg, rgba(203,162,74,0.16), rgba(203,162,74,0.04))"
          : "linear-gradient(165deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
        border: `1px solid ${accent ? "rgba(203,162,74,0.4)" : "rgba(237,227,204,0.12)"}`,
        borderRadius: 14,
        padding: "24px 18px 22px",
        textAlign: "center",
        transition: "transform .25s, box-shadow .25s, border-color .25s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 18px 40px -20px rgba(0,0,0,0.7)`
          : "inset 0 1px 0 rgba(237,227,204,0.05)",
      }}
    >
      {/* barra de acento superior */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent
            ? "linear-gradient(90deg, transparent, #CBA24A, transparent)"
            : "linear-gradient(90deg, transparent, rgba(237,227,204,0.35), transparent)",
          opacity: hovered ? 1 : 0.5,
          transition: "opacity .25s",
        }}
      />
      {icon && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 9,
            marginBottom: 14,
            background: accent ? "rgba(203,162,74,0.16)" : "rgba(237,227,204,0.06)",
            border: `1px solid ${accent ? "rgba(203,162,74,0.3)" : "rgba(237,227,204,0.1)"}`,
            color: accent ? "#CBA24A" : "rgba(237,227,204,0.7)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[icon]}
          </svg>
        </div>
      )}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isLong ? 30 : 42,
          fontWeight: 600,
          color: accent ? "#CBA24A" : "#EDE3CC",
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(237,227,204,0.6)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function CountdownBlock({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          background: "rgba(203,162,74,0.15)",
          border: "1px solid rgba(203,162,74,0.3)",
          borderRadius: 10,
          padding: "16px 20px",
          minWidth: 72,
          display: "inline-block",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 42,
            fontWeight: 600,
            color: "#CBA24A",
            lineHeight: 1,
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(237,227,204,0.5)",
          marginTop: 6,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ArtworkRow({ artwork }: { artwork: Artwork }) {
  const [hovered, setHovered] = useState(false);
  const cert = artwork.certificate;
  const pct = cert ? Number(cert.match_percentage) : 0;

  return (
    <Link
      href={`/obras/${artwork.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr auto auto auto",
        alignItems: "center",
        gap: "0 20px",
        padding: "14px 20px",
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        borderBottom: "1px solid rgba(237,227,204,0.07)",
        textDecoration: "none",
        color: "inherit",
        transition: "background .2s",
        borderRadius: hovered ? 8 : 0,
      }}
    >
      {/* thumbnail */}
      <div
        style={{
          width: 56,
          height: 44,
          borderRadius: 6,
          overflow: "hidden",
          backgroundImage: `url(${artwork.image_url}), url(/placeholder-obra.svg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
        }}
      />
      {/* info */}
      <div>
        <div style={{ fontSize: 14, color: "#EDE3CC", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          {artwork.title}
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(237,227,204,0.45)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          {artwork.artist_name}
        </div>
      </div>
      {/* cert */}
      {cert ? (
        <span
          style={{
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            color: pct >= 85 ? "#7ABA8A" : "#E0896A",
            background: pct >= 85 ? "rgba(122,186,138,0.12)" : "rgba(224,137,106,0.12)",
            padding: "3px 9px",
            borderRadius: 99,
            whiteSpace: "nowrap",
          }}
        >
          {pct.toFixed(1)}% cert.
        </span>
      ) : (
        <span style={{ fontSize: 11, color: "rgba(237,227,204,0.3)", fontFamily: "'Inter', sans-serif" }}>
          —
        </span>
      )}
      {/* blockchain */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: cert?.blockchain_tx_id ? "#CBA24A" : "rgba(237,227,204,0.25)",
          fontFamily: "'Inter', sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {cert?.blockchain_tx_id ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6" />
              <path d="M10.5 8.5H8a3.5 3.5 0 0 0 0 7h2.5" />
              <path d="M13.5 8.5H16a3.5 3.5 0 0 1 0 7h-2.5" />
            </svg>
            On-chain
          </>
        ) : (
          "Off-chain"
        )}
      </span>
      {/* price */}
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            color: "#CBA24A",
            fontWeight: 600,
          }}
        >
          {usd(artwork.price)}
        </div>
      </div>
    </Link>
  );
}

function ArtistPill({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artistas/${artist.slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(237,227,204,0.1)",
        borderRadius: 10,
        padding: "10px 14px",
        textDecoration: "none",
        color: "inherit",
        transition: "background .2s",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundImage: `url(${artist.profile_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          flexShrink: 0,
          border: "2px solid rgba(203,162,74,0.3)",
        }}
      />
      <div>
        <div style={{ fontSize: 13, color: "#EDE3CC", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
          {artist.name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(237,227,204,0.45)", fontFamily: "'Inter', sans-serif" }}>
          {artist.total_obras ?? 0} obras · {artist.specialty.split(",")[0]}
        </div>
      </div>
      {artist.featured && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#CBA24A",
            background: "rgba(203,162,74,0.12)",
            padding: "2px 8px",
            borderRadius: 99,
            border: "1px solid rgba(203,162,74,0.25)",
          }}
        >
          ★
        </span>
      )}
    </Link>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

const NEXT_COHORT = new Date("2026-06-14T09:00:00-05:00");

export default function VentanasPage() {
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [artists, setArtists]   = useState<Artist[] | null>(null);
  const { days, hrs, mins, secs } = useCountdown(NEXT_COHORT);

  useEffect(() => {
    api.listArtworks().then(setArtworks).catch(() => setArtworks([]));
    api.listArtists().then(setArtists).catch(() => setArtists([]));
  }, []);

  /* stats */
  const stats = useMemo(() => {
    if (!artworks || !artists) return null;
    const available = artworks.filter((a) => a.status === "available");
    const certified = artworks.filter((a) => a.certificate && Number(a.certificate.match_percentage) >= 85);
    const onchain   = artworks.filter((a) => a.certificate?.blockchain_tx_id);
    const totalVal  = available.reduce((s, a) => s + Number(a.price), 0);
    return { available: available.length, certified: certified.length, onchain: onchain.length, totalVal, artists: artists.length };
  }, [artworks, artists]);

  /* tabla: disponibles, ordenadas por precio desc */
  const tableRows = useMemo(
    () => (artworks ?? []).filter((a) => a.status === "available").sort((a, b) => Number(b.price) - Number(a.price)),
    [artworks],
  );

  const featuredArtists = useMemo(
    () => (artists ?? []).filter((a) => a.featured),
    [artists],
  );

  return (
    <div style={{ background: "var(--azul-profundo, #0D1B2A)", minHeight: "100vh", color: "#EDE3CC" }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(237,227,204,0.08)",
          padding: "72px 0 64px",
          background:
            "radial-gradient(900px 420px at 78% -10%, rgba(203,162,74,0.16), transparent 60%)," +
            "radial-gradient(700px 380px at 0% 110%, rgba(79,122,94,0.12), transparent 55%)",
        }}
      >
        {/* dot-grid decorativo */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(237,227,204,0.05) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to bottom, black, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 80%)",
            pointerEvents: "none",
          }}
        />

        <div className="wrap" style={{ position: "relative" }}>
          {/* breadcrumb */}
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(237,227,204,0.4)",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Arthub</span>
            <span>/</span>
            <span style={{ color: "#CBA24A" }}>Índice de Valor Artístico</span>
          </div>

          <div
            className="ventanas-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              {/* badge en vivo */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(122,186,138,0.1)",
                  border: "1px solid rgba(122,186,138,0.3)",
                  borderRadius: 99,
                  padding: "5px 13px 5px 11px",
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#7ABA8A",
                    boxShadow: "0 0 0 0 rgba(122,186,138,0.6)",
                    animation: "livePulse 1.8s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#A8D4B4",
                    fontWeight: 600,
                  }}
                >
                  Datos en tiempo real
                </span>
              </div>

              <h1
                className="serif"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 58px)",
                  lineHeight: 1.06,
                  margin: "0 0 16px",
                  color: "#EDE3CC",
                  letterSpacing: "-0.01em",
                }}
              >
                Índice de Valor <em style={{ color: "#CBA24A" }}>Artístico</em>
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  color: "rgba(237,227,204,0.6)",
                  maxWidth: 520,
                  lineHeight: 1.65,
                  margin: "0 0 32px",
                }}
              >
                Visión en tiempo real del catálogo certificado de Arthub.
                Obras disponibles, métricas de autenticidad y artistas activos
                en la cohorte de inversión vigente.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/catalogo" className="btn btn-gold">
                  Ver catálogo completo
                </Link>
                <Link
                  href="/registro"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 22px",
                    border: "1px solid rgba(237,227,204,0.25)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "'Inter', sans-serif",
                    color: "#EDE3CC",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Abrir cuenta
                </Link>
              </div>
            </div>

            {/* countdown */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(160deg, rgba(203,162,74,0.08), rgba(255,255,255,0.02) 55%)",
                border: "1px solid rgba(203,162,74,0.25)",
                borderRadius: 18,
                padding: "30px 34px",
                textAlign: "center",
                minWidth: 300,
                boxShadow:
                  "0 24px 60px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(237,227,204,0.06)",
              }}
            >
              {/* halo superior */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 220,
                  height: 120,
                  background:
                    "radial-gradient(closest-side, rgba(203,162,74,0.35), transparent)",
                  filter: "blur(8px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#CBA24A",
                  marginBottom: 20,
                  fontWeight: 600,
                }}
              >
                Próxima cohorte · 14 Jun 2026
              </div>
              <div style={{ position: "relative", display: "flex", gap: 12, justifyContent: "center", alignItems: "flex-start" }}>
                <CountdownBlock label="días"      value={days} />
                <span style={{ fontSize: 32, color: "rgba(203,162,74,0.5)", paddingTop: 14, lineHeight: 1 }}>:</span>
                <CountdownBlock label="horas"     value={hrs} />
                <span style={{ fontSize: 32, color: "rgba(203,162,74,0.5)", paddingTop: 14, lineHeight: 1 }}>:</span>
                <CountdownBlock label="minutos"   value={mins} />
                <span style={{ fontSize: 32, color: "rgba(203,162,74,0.5)", paddingTop: 14, lineHeight: 1 }}>:</span>
                <CountdownBlock label="segundos"  value={secs} />
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  color: "rgba(237,227,204,0.4)",
                  marginTop: 18,
                  lineHeight: 1.5,
                }}
              >
                Cupos limitados para inversores calificados.
                <br />
                Ticket mínimo: <strong style={{ color: "#CBA24A" }}>USD 5,000</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "40px 0", borderBottom: "1px solid rgba(237,227,204,0.07)" }}>
        <div className="wrap">
          {stats ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 16,
              }}
            >
              <StatBox value={stats.available}            label="Obras disponibles"   icon="frame"   accent />
              <StatBox value={stats.certified}            label="Certificadas ≥ 85%"  icon="check"   />
              <StatBox value={stats.onchain}              label="En blockchain"        icon="chain"   />
              <StatBox value={stats.artists}              label="Artistas activos"     icon="artists" />
              <StatBox value={compactUsd(stats.totalVal)} label="Valor total catálogo" icon="value"   />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 16,
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    height: 92,
                    background: "rgba(255,255,255,0.04)",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TABLA DE OBRAS ───────────────────────────────────────────────── */}
      <div style={{ padding: "48px 0", borderBottom: "1px solid rgba(237,227,204,0.07)" }}>
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2
              className="serif"
              style={{ fontSize: 22, fontWeight: 400, color: "#EDE3CC", margin: 0 }}
            >
              Obras disponibles para inversión
            </h2>
            <Link
              href="/catalogo"
              style={{
                fontSize: 12,
                color: "#CBA24A",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.06em",
              }}
            >
              Ver todas →
            </Link>
          </div>

          {/* header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr auto auto auto",
              gap: "0 20px",
              padding: "0 20px 10px",
              borderBottom: "1px solid rgba(237,227,204,0.12)",
              marginBottom: 4,
            }}
          >
            {["", "Obra / Artista", "Autenticidad", "Registro", "Precio USD"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(237,227,204,0.35)",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {!artworks ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 56,
                  margin: "4px 0",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.03)",
                  animation: "pulse 1.6s ease-in-out infinite",
                }}
              />
            ))
          ) : tableRows.length === 0 ? (
            <p style={{ color: "rgba(237,227,204,0.4)", padding: "24px 20px", fontFamily: "'Inter', sans-serif" }}>
              No hay obras disponibles.
            </p>
          ) : (
            tableRows.map((aw) => <ArtworkRow key={aw.id} artwork={aw} />)
          )}
        </div>
      </div>

      {/* ── ARTISTAS DESTACADOS ───────────────────────────────────────────── */}
      <div style={{ padding: "48px 0", borderBottom: "1px solid rgba(237,227,204,0.07)" }}>
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2
              className="serif"
              style={{ fontSize: 22, fontWeight: 400, color: "#EDE3CC", margin: 0 }}
            >
              Artistas del catálogo
            </h2>
            <Link
              href="/artistas"
              style={{
                fontSize: 12,
                color: "#CBA24A",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.06em",
              }}
            >
              Ver todos →
            </Link>
          </div>

          {!artists ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 64,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {(featuredArtists.length ? featuredArtists : artists).map((a) => (
                <ArtistPill key={a.id} artist={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── VENTANAS DE INVERSIÓN ─────────────────────────────────────────── */}
      <div style={{ padding: "48px 0 80px" }}>
        <div className="wrap">
          <h2
            className="serif"
            style={{ fontSize: 22, fontWeight: 400, color: "#EDE3CC", margin: "0 0 24px" }}
          >
            Ventanas de inversión · Cohorte Jun 2026
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                tier: "Acceso",
                min: "5,000",
                max: "19,999",
                desc: "Entrada al mercado de arte certificado. 1–2 obras de artistas emergentes con certificación biométrica.",
                perks: ["Certificado digital NFT", "Dashboard de valor", "Acceso a informes trimestrales"],
                color: "#4F7A5E",
                open: true,
              },
              {
                tier: "Coleccionista",
                min: "20,000",
                max: "99,999",
                desc: "Acceso a obras de maestros establecidos. Diversificación en 3–5 piezas del catálogo premium.",
                perks: ["Todo lo de Acceso", "Línea directa con curadores", "Visita privada al taller", "Prioridad en nuevas obras"],
                color: "#CBA24A",
                open: true,
              },
              {
                tier: "Patrimonio",
                min: "100,000",
                max: "+",
                desc: "Mesa privada de alto valor. Acceso a obras coloniales y lotes curados por el equipo de Arthub.",
                perks: ["Todo lo de Coleccionista", "Mesa privada Zürich / Miami", "Curaduría personalizada", "Acceso pre-mercado"],
                color: "#B8653B",
                open: false,
              },
            ].map(({ tier, min, max, desc, perks, color, open }) => (
              <div
                key={tier}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${open ? color + "55" : "rgba(237,227,204,0.08)"}`,
                  borderRadius: 14,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: open ? color : "rgba(237,227,204,0.3)",
                      background: open ? color + "18" : "rgba(255,255,255,0.04)",
                      padding: "4px 11px",
                      borderRadius: 99,
                      border: `1px solid ${open ? color + "40" : "rgba(237,227,204,0.1)"}`,
                    }}
                  >
                    {tier}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "'Inter', sans-serif",
                      color: open ? "#7ABA8A" : "rgba(237,227,204,0.3)",
                    }}
                  >
                    {open ? "● Abierta" : "○ Lista de espera"}
                  </span>
                </div>

                {/* range */}
                <div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 28,
                      color: open ? color : "rgba(237,227,204,0.4)",
                      lineHeight: 1,
                    }}
                  >
                    USD {min} {max !== "+" ? `– ${max}` : "+"}
                  </div>
                </div>

                {/* desc */}
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: "rgba(237,227,204,0.55)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {desc}
                </p>

                {/* perks */}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {perks.map((p) => (
                    <li
                      key={p}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        color: "rgba(237,227,204,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: open ? color : "rgba(237,227,204,0.2)", fontSize: 14 }}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>

                {/* cta */}
                <Link
                  href={open ? "/registro" : "#"}
                  style={{
                    marginTop: "auto",
                    display: "block",
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: open ? color : "transparent",
                    color: open ? (color === "#CBA24A" ? "#14110C" : "#fff") : "rgba(237,227,204,0.3)",
                    border: open ? "none" : "1px solid rgba(237,227,204,0.1)",
                    cursor: open ? "pointer" : "default",
                    transition: "opacity .2s",
                  }}
                >
                  {open ? "Solicitar acceso" : "Unirse a lista de espera"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(122,186,138,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(122,186,138,0); }
          100% { box-shadow: 0 0 0 0 rgba(122,186,138,0); }
        }
        @media (max-width: 860px) {
          .ventanas-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .ventanas-hero-grid > div:last-child { justify-self: start; }
        }
      `}</style>
    </div>
  );
}
