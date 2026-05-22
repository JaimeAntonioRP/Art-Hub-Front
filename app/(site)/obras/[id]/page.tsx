"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artwork, type Certificate } from "@/lib/api";
import ArtworkLightbox from "@/components/ArtworkLightbox";
import PurchaseModal from "@/components/PurchaseModal";

/* <model-viewer> es un web component; lo tipamos como componente React */
const ModelViewer = "model-viewer" as unknown as React.FC<
  React.HTMLAttributes<HTMLElement> & Record<string, unknown>
>;

function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

/* ── visor de imagen + 3D ─────────────────────────────────────────────────── */

const PLACEHOLDER = "/placeholder-obra.svg";

function MediaViewer({
  artwork,
  onExpand,
}: {
  artwork: Artwork;
  onExpand: () => void;
}) {
  const [view, setView] = useState<"image" | "3d">("image");
  const [scriptReady, setScriptReady] = useState(false);
  const [modelOk, setModelOk] = useState<boolean | null>(null);
  const has3D = Boolean(artwork.model_3d_url);

  // carga el script de model-viewer una sola vez (al cambiar a vista 3D)
  useEffect(() => {
    if (view !== "3d" || !has3D) return;
    const ID = "model-viewer-script";
    if (document.getElementById(ID)) {
      setScriptReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = ID;
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, [view, has3D]);

  // verifica que el .glb exista antes de mostrar el visor
  useEffect(() => {
    if (view !== "3d" || !artwork.model_3d_url) return;
    setModelOk(null);
    fetch(artwork.model_3d_url, { method: "HEAD" })
      .then((r) => {
        const ct = r.headers.get("content-type") ?? "";
        setModelOk(r.ok && !ct.includes("text/html"));
      })
      .catch(() => setModelOk(false));
  }, [view, artwork.model_3d_url]);

  return (
    <div>
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          borderRadius: 12,
          border: "1px solid var(--rule)",
          overflow: "hidden",
          background: "var(--arena, #EFE6D5)",
        }}
      >
        {view === "image" ? (
          <img
            src={artwork.image_url}
            alt={artwork.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.endsWith(PLACEHOLDER)) el.src = PLACEHOLDER;
            }}
          />
        ) : modelOk === false ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              textAlign: "center",
              padding: 24,
              color: "var(--ink-soft, #6B7A8A)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#CBA24A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8, marginBottom: 4 }}>
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            <strong style={{ fontSize: 14, color: "var(--ink, #0D1B2A)" }}>Modelo 3D no disponible aún</strong>
            <span style={{ fontSize: 12.5, maxWidth: 240 }}>
              El archivo del modelo todavía no fue cargado para esta obra.
            </span>
          </div>
        ) : scriptReady && modelOk ? (
          <ModelViewer
            src={artwork.model_3d_url as string}
            alt={`Modelo 3D de ${artwork.title}`}
            poster={artwork.image_url}
            camera-controls=""
            auto-rotate=""
            ar=""
            ar-modes="webxr scene-viewer quick-look"
            shadow-intensity="1"
            exposure="1"
            style={{ width: "100%", height: "100%", background: "#15110c" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-soft, #6B7A8A)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
            }}
          >
            Cargando visor 3D…
          </div>
        )}

        {/* botón pantalla completa */}
        {view === "image" && (
          <button
            type="button"
            onClick={onExpand}
            aria-label="Ver en pantalla completa"
            title="Ver en pantalla completa"
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(10,10,10,0.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(237,227,204,0.2)",
              borderRadius: 6,
              color: "#EDE3CC",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 10px",
              fontSize: 11,
              letterSpacing: "0.06em",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(203,162,74,0.18)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(203,162,74,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,10,10,0.65)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(237,227,204,0.2)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Ampliar
          </button>
        )}

        {/* etiqueta 3D/AR */}
        {has3D && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(20,17,12,0.72)",
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

      {/* toggle imagen ↔ 3D */}
      {has3D && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setView("image")}
            className={view === "image" ? "btn btn-outline-dark" : "btn btn-ghost"}
            style={{ fontSize: 12.5, padding: "7px 14px", flex: 1 }}
          >
            Imagen
          </button>
          <button
            type="button"
            onClick={() => setView("3d")}
            className={view === "3d" ? "btn btn-gold" : "btn btn-ghost"}
            style={{ fontSize: 12.5, padding: "7px 14px", flex: 1 }}
          >
            Ver en 3D / AR
          </button>
        </div>
      )}
    </div>
  );
}

/* ── certificado compacto con QR ─────────────────────────────────────────── */

function CertificateCard({
  cert,
  artwork,
  isAdmin,
}: {
  cert: Certificate;
  artwork: Artwork;
  isAdmin: boolean;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const verifyUrl = cert.verification_token && origin
    ? `${origin}/verificar/${cert.verification_token}`
    : null;

  // QR grande para descarga, pequeño para mostrar
  const qrDisplay = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=14110C&margin=4`
    : null;
  const qrDownload = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=14110C&margin=10`
    : null;

  const handleDownload = async () => {
    if (!qrDownload || !verifyUrl) return;
    // descarga el QR como PNG
    const res = await fetch(qrDownload);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificado-${cert.verification_token?.slice(0, 8)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!cert.verification_token) return null;

  return (
    <div
      style={{
        marginTop: 18,
        border: "1px solid var(--oro-cusco, #CBA24A)",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* fila principal */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
        {/* miniatura de la obra */}
        <img
          src={artwork.image_url}
          alt={artwork.title}
          width={52}
          height={52}
          style={{ borderRadius: 7, objectFit: "cover", border: "1px solid var(--rule)", flexShrink: 0 }}
          onError={(e) => { const el = e.currentTarget; if (!el.src.endsWith("/placeholder-obra.svg")) el.src = "/placeholder-obra.svg"; }}
        />

        {/* token + label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco,#CBA24A)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
              Token de autenticidad
            </span>
          </div>
          <code style={{ fontSize: 12, color: "var(--ink)", wordBreak: "break-all" }}>
            {cert.verification_token}
          </code>
        </div>

        {/* QR */}
        {qrDisplay ? (
          <img
            src={qrDisplay}
            alt="QR verificación"
            width={64}
            height={64}
            style={{ flexShrink: 0, borderRadius: 6, border: "1px solid var(--rule)" }}
          />
        ) : null}
      </div>

      {/* pie: solo admin descarga */}
      {isAdmin && qrDownload ? (
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            padding: "9px 16px",
            background: "var(--paper-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Solo visible para administradores</span>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-outline-dark"
            style={{ fontSize: 11, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar QR
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function ObraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const artworkId = Number(id);
  const { user } = useAuth();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getArtwork(artworkId)
      .then((a) => setArtwork(a))
      .catch(() => setError("No se encontro la obra."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [artworkId]);

  const handlePurchase = () => {
    setPurchaseOpen(true);
  };

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Cargando obra...</p>
        </div>
      </section>
    );
  }

  if (!artwork) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">{error ?? "Obra no encontrada."}</p>
          <Link href="/obras" className="btn btn-outline-dark" style={{ marginTop: 16 }}>
            ← Volver al catalogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48 }}>
        <MediaViewer artwork={artwork} onExpand={() => setLightboxOpen(true)} />
        {lightboxOpen && (
          <ArtworkLightbox
            artwork={artwork}
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        {purchaseOpen && (
          <PurchaseModal
            open={purchaseOpen}
            artwork={artwork}
            onClose={() => setPurchaseOpen(false)}
          />
        )}

        <div>
          <div className="kicker">{artwork.artist_name}</div>
          <h1 className="h-display" style={{ fontSize: 44, margin: "8px 0 12px" }}>
            {artwork.title}
          </h1>
          <p style={{ marginTop: 0 }}>{artwork.description}</p>

          <div
            style={{
              marginTop: 24,
              padding: "20px 22px",
              background: "var(--paper-2)",
              border: "1px solid var(--rule)",
              borderRadius: 12,
            }}
          >
            <div className="eyebrow">Precio</div>
            <div
              style={{
                fontSize: 32,
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--oro-cusco)",
              }}
            >
              {formatPrice(artwork.price)}
            </div>
            <div className="kicker" style={{ marginTop: 12 }}>
              Estado:{" "}
              <strong style={{ color: artwork.status === "available" ? "var(--quenua)" : "var(--terracota)" }}>
                {artwork.status === "available" ? "Disponible" : "Vendida"}
              </strong>
            </div>
          </div>

          {artwork.certificate ? (
            <CertificateCard
              cert={artwork.certificate}
              artwork={artwork}
              isAdmin={user?.role === "admin"}
            />
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 18,
                padding: "10px 14px",
                background: "#FBECE6",
                border: "1px solid #C56A4A55",
                color: "#7B2E18",
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={handlePurchase}
              disabled={artwork.status !== "available"}
              className="btn btn-gold btn-lg"
              style={{ opacity: artwork.status !== "available" ? 0.55 : 1, display: "flex", alignItems: "center", gap: 8 }}
            >
              {artwork.status !== "available" ? (
                "No disponible"
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Simular compra
                </>
              )}
            </button>
            <Link href="/obras" className="btn btn-outline-dark btn-lg">
              ← Catalogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
