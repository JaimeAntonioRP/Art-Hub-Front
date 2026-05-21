"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artwork, type Certificate } from "@/lib/api";

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

function MediaViewer({ artwork }: { artwork: Artwork }) {
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

/* ── certificado con QR ───────────────────────────────────────────────────── */

function CertificateCard({ cert, artworkId }: { cert: Certificate; artworkId: number }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const verifyUrl = cert.verification_token && origin
    ? `${origin}/verificar/${cert.verification_token}`
    : null;

  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=14110C&margin=6`
    : null;

  const matchPct = Number(cert.match_percentage);
  const authentic = matchPct >= 85;

  return (
    <div
      style={{
        marginTop: 18,
        border: "1.5px solid var(--oro-cusco, #CBA24A)",
        borderRadius: 14,
        overflow: "hidden",
        fontSize: 13.5,
      }}
    >
      {/* encabezado dorado */}
      <div
        style={{
          background: "var(--oro-cusco, #CBA24A)",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* icono escudo */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14110C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: "#14110C", textTransform: "uppercase" }}>
          Certificado de Autenticidad
        </span>
        <span
          style={{
            marginLeft: "auto",
            background: authentic ? "#2D5016" : "#7B2E18",
            color: "#fff",
            fontSize: 11,
            padding: "3px 10px",
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          {authentic ? "AUTÉNTICO" : "EN REVISIÓN"}
        </span>
      </div>

      {/* cuerpo */}
      <div style={{ background: "#fff", padding: "16px 18px", display: "flex", gap: 18, alignItems: "flex-start" }}>
        {/* columna datos */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "var(--oro-cusco, #CBA24A)" }}>
                {matchPct.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Coincidencia IA
              </div>
            </div>
            <div style={{ width: 1, background: "var(--rule)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Hash biométrico</div>
              <code style={{ fontSize: 11, wordBreak: "break-all", color: "var(--ink)" }}>
                {cert.biometric_hash.slice(0, 40)}…
              </code>
            </div>
          </div>

          {cert.blockchain_tx_id ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 2 }}>TX Blockchain</div>
              <code style={{ fontSize: 11, wordBreak: "break-all" }}>
                {cert.blockchain_tx_id.slice(0, 44)}…
              </code>
            </div>
          ) : null}

          {verifyUrl ? (
            <Link
              href={`/verificar/${cert.verification_token}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--oro-cusco, #CBA24A)",
                textDecoration: "none",
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Ver certificado completo
            </Link>
          ) : null}
        </div>

        {/* QR */}
        {qrSrc ? (
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <img
              src={qrSrc}
              alt="QR verificación"
              width={88}
              height={88}
              style={{ borderRadius: 8, border: "1px solid var(--rule)" }}
            />
            <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 4 }}>Escanea para verificar</div>
          </div>
        ) : null}
      </div>
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
  const router = useRouter();
  const { user, token } = useAuth();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getArtwork(artworkId)
      .then((a) => setArtwork(a))
      .catch(() => setError("No se encontro la obra."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [artworkId]);

  const handlePurchase = async () => {
    if (!token) {
      router.push(`/login?redirect=/obras/${artworkId}`);
      return;
    }
    setBuying(true);
    setError(null);
    setMessage(null);
    try {
      const result = await api.purchase(token, artworkId);
      setArtwork(result.artwork);
      setMessage(
        `Compra confirmada. Transaccion blockchain: ${result.blockchain_tx_id.slice(0, 22)}...`,
      );
    } catch {
      setError("No fue posible completar la compra.");
    } finally {
      setBuying(false);
    }
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
        <MediaViewer artwork={artwork} />

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
            <CertificateCard cert={artwork.certificate} artworkId={artwork.id} />
          ) : null}

          {message ? (
            <div
              style={{
                marginTop: 18,
                padding: "10px 14px",
                background: "#EAF2E6",
                border: "1px solid #7A846B55",
                color: "#3D4A2E",
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              {message}
            </div>
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
              disabled={buying || artwork.status !== "available"}
              className="btn btn-gold btn-lg"
              style={{ opacity: buying || artwork.status !== "available" ? 0.55 : 1 }}
            >
              {artwork.status !== "available"
                ? "No disponible"
                : buying
                  ? "Procesando..."
                  : user
                    ? "Comprar ahora"
                    : "Iniciar sesion para comprar"}
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
