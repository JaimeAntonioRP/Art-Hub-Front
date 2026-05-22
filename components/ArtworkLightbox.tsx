"use client";

import { useEffect, useRef } from "react";
import type { Artwork } from "@/lib/api";

interface Props {
  artwork: Artwork;
  open: boolean;
  onClose: () => void;
}

function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

const PLACEHOLDER = "/placeholder-obra.svg";

export default function ArtworkLightbox({ artwork, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* lock scroll + ESC to close */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  /* inject keyframes once */
  useEffect(() => {
    const id = "lbx-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes lbx-fade-in  { from { opacity:0 } to { opacity:1 } }
      @keyframes lbx-slide-up { from { transform:translateY(28px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      @keyframes lbx-img-zoom { from { transform:scale(1.04); opacity:0 } to { transform:scale(1); opacity:1 } }
    `;
    document.head.appendChild(style);
  }, []);

  if (!open) return null;

  const has3D = Boolean(artwork.model_3d_url);

  return (
    /* backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        animation: "lbx-fade-in 0.25s ease",
      }}
    >
      {/* modal container — stop propagation so clicks inside don't close */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1180,
          maxHeight: "calc(100vh - 40px)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(203,162,74,0.18)",
          animation: "lbx-slide-up 0.32s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* ── LEFT: image ─────────────────────────────────────────────────── */}
        <div
          style={{
            flex: "0 0 58%",
            position: "relative",
            background: "#0a0a0a",
            overflow: "hidden",
          }}
        >
          <img
            src={artwork.image_url}
            alt={artwork.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              animation: "lbx-img-zoom 0.5s cubic-bezier(.22,1,.36,1)",
            }}
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.endsWith(PLACEHOLDER)) el.src = PLACEHOLDER;
            }}
          />

          {/* gradient vignette bottom */}
          <div
            style={{
              position: "absolute",
              inset: "60% 0 0 0",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))",
              pointerEvents: "none",
            }}
          />

          {/* 3D badge */}
          {has3D && (
            <span
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "rgba(203,162,74,0.15)",
                border: "1px solid rgba(203,162,74,0.55)",
                color: "#CBA24A",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 20,
                fontFamily: "'Geist', 'Inter', sans-serif",
                backdropFilter: "blur(4px)",
              }}
            >
              3D / AR
            </span>
          )}

          {/* artist name bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              color: "rgba(255,255,255,0.6)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'Geist', 'Inter', sans-serif",
            }}
          >
            {artwork.artist_name}
          </div>

          {/* year bottom-right */}
          {artwork.year && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                color: "rgba(203,162,74,0.7)",
                fontSize: 13,
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontStyle: "italic",
              }}
            >
              {artwork.year}
            </div>
          )}
        </div>

        {/* ── RIGHT: details panel ─────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#111",
            borderLeft: "1px solid rgba(203,162,74,0.15)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              alignSelf: "flex-end",
              margin: "16px 16px 0 0",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.7)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div style={{ padding: "8px 32px 36px", flex: 1 }}>
            {/* eyebrow: artist */}
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#CBA24A",
                fontFamily: "'Geist', 'Inter', sans-serif",
                marginBottom: 10,
              }}
            >
              {artwork.artist_name}
            </div>

            {/* title */}
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 600,
                lineHeight: 1.15,
                color: "#F0EAD6",
                margin: "0 0 20px",
              }}
            >
              {artwork.title}
            </h2>

            {/* meta chips row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {artwork.technique && (
                <MetaChip icon={
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
                  </svg>
                } label={artwork.technique} />
              )}
              {artwork.year && (
                <MetaChip icon={
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                } label={String(artwork.year)} />
              )}
              {artwork.dimensions && (
                <MetaChip icon={
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                } label={artwork.dimensions} />
              )}
              <MetaChip icon={
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              } label="Pieza única" gold />
            </div>

            {/* divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 22px" }} />

            {/* description */}
            <p
              style={{
                fontFamily: "'Geist', 'Inter', sans-serif",
                fontSize: 15,
                lineHeight: 1.72,
                color: "rgba(240,234,214,0.72)",
                margin: "0 0 28px",
              }}
            >
              {artwork.description}
            </p>

            {/* style block */}
            <StyleBlock artwork={artwork} />

            {/* divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 22px" }} />

            {/* price + status */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    marginBottom: 4,
                  }}
                >
                  Precio
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                    fontSize: 32,
                    fontWeight: 600,
                    color: "#CBA24A",
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(artwork.price)}
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: `1px solid ${artwork.status === "available" ? "rgba(78,222,163,0.4)" : "rgba(255,100,80,0.4)"}`,
                  color: artwork.status === "available" ? "#4EDEA3" : "#FF6450",
                  background: artwork.status === "available" ? "rgba(78,222,163,0.08)" : "rgba(255,100,80,0.08)",
                }}
              >
                {artwork.status === "available" ? "Disponible" : "Vendida"}
              </span>
            </div>

            {/* certificate token */}
            {artwork.certificate?.verification_token && (
              <div
                style={{
                  marginTop: 20,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "rgba(203,162,74,0.07)",
                  border: "1px solid rgba(203,162,74,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBA24A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(203,162,74,0.7)", fontFamily: "'Geist','Inter',sans-serif", marginBottom: 2 }}>
                    Token de autenticidad
                  </div>
                  <code style={{ fontSize: 11, color: "rgba(240,234,214,0.6)", wordBreak: "break-all", fontFamily: "monospace" }}>
                    {artwork.certificate.verification_token}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── tiny sub-components ────────────────────────────────────────────────────── */

function MetaChip({
  icon,
  label,
  gold = false,
}: {
  icon: React.ReactNode;
  label: string;
  gold?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 20,
        background: gold ? "rgba(203,162,74,0.1)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${gold ? "rgba(203,162,74,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: gold ? "#CBA24A" : "rgba(240,234,214,0.65)",
        fontSize: 11,
        fontFamily: "'Geist', 'Inter', sans-serif",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function StyleBlock({ artwork }: { artwork: Artwork }) {
  /* Derive style keywords from technique + artist specialty */
  const styleItems: { label: string; value: string }[] = [];

  if (artwork.technique) {
    styleItems.push({ label: "Técnica", value: artwork.technique });
  }

  /* infer movement from technique */
  const technique = (artwork.technique ?? "").toLowerCase();
  let movement = "Arte Contemporáneo Andino";
  if (technique.includes("óleo") && technique.includes("pan de oro")) movement = "Neobarroco Andino";
  else if (technique.includes("mixta")) movement = "Expresionismo Andino Contemporáneo";
  else if (technique.includes("acrílico")) movement = "Realismo Lírico Andino";
  else if (technique.includes("3d") || technique.includes("modelado")) movement = "Arte Digital & Contemporáneo Andino";

  styleItems.push({ label: "Movimiento", value: movement });
  styleItems.push({ label: "Origen", value: "Cusco, Perú" });
  styleItems.push({ label: "Serie", value: "Colección Permanente Arthub" });

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'Geist', 'Inter', sans-serif",
          marginBottom: 12,
        }}
      >
        Ficha técnica
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {styleItems.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'Geist', 'Inter', sans-serif",
                width: 80,
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "rgba(240,234,214,0.75)",
                fontFamily: "'Geist', 'Inter', sans-serif",
                lineHeight: 1.4,
              }}
            >
              {value}
            </span>
          </div>
        ))}
        {artwork.dimensions && (
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Geist','Inter',sans-serif", width: 80, flexShrink: 0 }}>
              Dimensiones
            </span>
            <span style={{ fontSize: 13, color: "rgba(240,234,214,0.75)", fontFamily: "'Geist','Inter',sans-serif" }}>
              {artwork.dimensions}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
