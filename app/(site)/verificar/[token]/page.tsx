"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { api, type Certificate, type Artwork } from "@/lib/api";

const PLACEHOLDER = "/placeholder-obra.svg";

function formatDate(iso?: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VerificarTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .getCertificateByToken(token)
      .then(({ certificate, artwork }) => {
        setCert(certificate);
        setArtwork(artwork);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const matchPct = cert ? Number(cert.match_percentage) : 0;
  const authentic = matchPct >= 85;

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const verifyUrl = origin ? `${origin}/verificar/${token}` : "";

  const qrSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=14110C&margin=8`
    : "";

  if (loading) {
    return (
      <section className="section">
        <div className="wrap" style={{ textAlign: "center", paddingTop: 80 }}>
          <p className="muted">Cargando certificado…</p>
        </div>
      </section>
    );
  }

  if (notFound || !cert || !artwork) {
    return (
      <section className="section">
        <div
          className="wrap"
          style={{ maxWidth: 520, textAlign: "center", paddingTop: 80 }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C56A4A"
            strokeWidth="1.4"
            style={{ marginBottom: 16 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9 9 15M9 9l6 6" />
          </svg>
          <h2 className="serif" style={{ fontSize: 28, marginBottom: 10 }}>
            Certificado no encontrado
          </h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            El token de verificación no corresponde a ningún certificado
            registrado en nuestra plataforma.
          </p>
          <Link href="/catalogo" className="btn btn-gold">
            Ver catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="wrap" style={{ maxWidth: 780 }}>
        {/* encabezado */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="eyebrow">Verificación de autenticidad</div>
          <h1 className="serif" style={{ fontSize: 38, margin: "8px 0 6px" }}>
            Certificado Digital
          </h1>
          <p className="muted" style={{ maxWidth: 480, margin: "0 auto" }}>
            Este certificado es emitido por Arthub tras un análisis biométrico
            por IA y queda vinculado de forma permanente a la obra.
          </p>
        </div>

        {/* tarjeta principal */}
        <div
          style={{
            background: "#fff",
            border: "2px solid var(--oro-cusco, #CBA24A)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {/* banda dorada */}
          <div
            style={{
              background: "var(--oro-cusco, #CBA24A)",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#14110C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.1em",
                color: "#14110C",
                textTransform: "uppercase",
              }}
            >
              Arthub · Certificado de Autenticidad
            </span>
            <span
              style={{
                marginLeft: "auto",
                background: authentic ? "#2D5016" : "#7B2E18",
                color: "#fff",
                fontSize: 12,
                padding: "4px 14px",
                borderRadius: 20,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {authentic ? "AUTÉNTICO" : "EN REVISIÓN"}
            </span>
          </div>

          {/* cuerpo */}
          <div
            style={{
              padding: "28px 28px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
            }}
          >
            {/* columna izquierda — obra */}
            <div>
              <img
                src={artwork.image_url}
                alt={artwork.title}
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid var(--rule)",
                  marginBottom: 14,
                }}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.endsWith(PLACEHOLDER)) el.src = PLACEHOLDER;
                }}
              />
              <div className="kicker">{artwork.artist_name}</div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  margin: "4px 0 8px",
                }}
              >
                {artwork.title}
              </h2>
              <Link
                href={`/obras/${artwork.id}`}
                className="btn btn-outline-dark"
                style={{ fontSize: 12, padding: "7px 14px" }}
              >
                Ver obra completa
              </Link>
            </div>

            {/* columna derecha — datos del certificado */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* score */}
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 52,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                    color: "var(--oro-cusco, #CBA24A)",
                    lineHeight: 1,
                  }}
                >
                  {matchPct.toFixed(1)}
                  <span style={{ fontSize: 22 }}>%</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginTop: 6,
                  }}
                >
                  Coincidencia biométrica IA
                </div>
              </div>

              {/* hash */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-soft)",
                    marginBottom: 4,
                  }}
                >
                  Hash biométrico SHA-256
                </div>
                <code
                  style={{
                    fontSize: 11,
                    wordBreak: "break-all",
                    background: "var(--paper-2)",
                    padding: "8px 10px",
                    borderRadius: 8,
                    display: "block",
                    lineHeight: 1.6,
                  }}
                >
                  {cert.biometric_hash}
                </code>
              </div>

              {/* token */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-soft)",
                    marginBottom: 4,
                  }}
                >
                  Token de verificación
                </div>
                <code
                  style={{
                    fontSize: 11,
                    wordBreak: "break-all",
                    background: "var(--paper-2)",
                    padding: "8px 10px",
                    borderRadius: 8,
                    display: "block",
                  }}
                >
                  {cert.verification_token}
                </code>
              </div>

              {/* tx blockchain */}
              {cert.blockchain_tx_id ? (
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-soft)",
                      marginBottom: 4,
                    }}
                  >
                    TX Blockchain
                  </div>
                  <code
                    style={{
                      fontSize: 11,
                      wordBreak: "break-all",
                      background: "var(--paper-2)",
                      padding: "8px 10px",
                      borderRadius: 8,
                      display: "block",
                    }}
                  >
                    {cert.blockchain_tx_id}
                  </code>
                </div>
              ) : null}

              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Emitido el {formatDate(cert.created_at)}
              </div>
            </div>
          </div>

          {/* pie — QR */}
          <div
            style={{
              borderTop: "1px solid var(--rule)",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              background: "var(--paper-2)",
            }}
          >
            <img
              src={qrSrc}
              alt="QR de verificación"
              width={100}
              height={100}
              style={{ borderRadius: 8, border: "1px solid var(--rule)", flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                Verificación QR
              </div>
              <p className="muted" style={{ fontSize: 12, margin: 0, maxWidth: 380 }}>
                Escanea el código QR o comparte este enlace para verificar la
                autenticidad de la obra en cualquier dispositivo.
              </p>
              <code
                style={{ fontSize: 11, color: "var(--oro-cusco)", marginTop: 6, display: "block" }}
              >
                {verifyUrl}
              </code>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/catalogo" className="btn btn-outline-dark">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
