"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artwork } from "@/lib/api";
import {
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

type VerifyResult = {
  match_percentage: number;
  biometric_hash: string;
  engine?: string;
  is_authentic: boolean;
  fallback: boolean;
};

export default function VerificarPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkId, setArtworkId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listArtworks().then(setArtworks).catch(() => {});
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) router.replace("/login?redirect=/verificar");
  }, [user, token, loading, router]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file || !artworkId) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.verify(token, Number(artworkId), file);
      setResult({
        match_percentage: Number(response.certificate.match_percentage),
        biometric_hash: response.certificate.biometric_hash,
        engine: response.verification_result.engine,
        is_authentic: response.is_authentic,
        fallback: response.fallback,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la verificacion.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading || !user) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Verificando sesion...</p>
        </div>
      </section>
    );
  }

  const matchColor =
    result && result.match_percentage >= 90
      ? "#3D4A2E"
      : result && result.match_percentage >= 80
        ? "#8A6B22"
        : "#7B2E18";

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--rule)",
            borderRadius: 12,
            padding: 32,
            height: "fit-content",
          }}
        >
          <div className="eyebrow">Validacion biometrica</div>
          <h1 className="serif" style={{ fontSize: 30, margin: "6px 0 8px" }}>
            Verificar autenticidad
          </h1>
          <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
            Sube la fotografia o codigo QR del certificado de la obra. El sistema comparara con el
            registro biometrico almacenado.
          </p>

          {error ? <div style={errorBoxStyle}>{error}</div> : null}

          <form onSubmit={onSubmit} noValidate>
            <div style={fieldStyle}>
              <label style={labelStyle}>Obra a verificar</label>
              <select
                style={inputStyle}
                required
                value={artworkId}
                onChange={(e) => setArtworkId(e.target.value)}
              >
                <option value="">— Selecciona una obra —</option>
                {artworks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} — {a.artist_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Imagen / QR del certificado</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                required
                onChange={handleFile}
                style={{ ...inputStyle, padding: 8, background: "var(--paper-2)" }}
              />
            </div>

            {preview ? (
              <div style={{ marginBottom: 18 }}>
                <img
                  src={preview}
                  alt="vista previa"
                  style={{
                    width: "100%",
                    maxHeight: 280,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid var(--rule)",
                    background: "var(--paper-2)",
                  }}
                />
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting || !file || !artworkId}
                className="btn btn-gold btn-lg"
                style={{ flex: 1, opacity: submitting || !file || !artworkId ? 0.55 : 1 }}
              >
                {submitting ? "Analizando..." : "Verificar"}
              </button>
              {file ? (
                <button type="button" onClick={reset} className="btn btn-outline-dark btn-lg">
                  Limpiar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div>
          <div className="eyebrow">Resultado</div>
          <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>
            Reporte de autenticidad
          </h2>

          {!result ? (
            <div
              style={{
                background: "#fff",
                border: "1px dashed var(--rule-strong)",
                borderRadius: 12,
                padding: 36,
                textAlign: "center",
                color: "var(--ink-soft)",
              }}
            >
              Sube una imagen y selecciona una obra para iniciar la verificacion.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--rule)",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div className="kicker">Match biometrico</div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 56,
                      lineHeight: 1,
                      color: matchColor,
                    }}
                  >
                    {result.match_percentage.toFixed(2)}%
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: result.is_authentic ? "#EAF2E6" : "#FBECE6",
                    color: result.is_authentic ? "#3D4A2E" : "#7B2E18",
                    border: `1px solid ${result.is_authentic ? "#7A846B55" : "#C56A4A55"}`,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {result.is_authentic ? "Autentica" : "No verificada"}
                </div>
              </div>

              <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div className="kicker" style={{ marginBottom: 4 }}>Hash biometrico</div>
                <code style={{ wordBreak: "break-all", display: "block", marginBottom: 14 }}>
                  {result.biometric_hash}
                </code>
                <div className="kicker" style={{ marginBottom: 4 }}>Motor de IA</div>
                <div style={{ marginBottom: 14 }}>
                  {result.engine ?? "remoto"}
                  {result.fallback ? (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "var(--paper-2)",
                        fontSize: 11,
                        color: "var(--ink-soft)",
                      }}
                    >
                      microservicio offline · simulado
                    </span>
                  ) : null}
                </div>
              </div>

              <Link
                href={`/obras/${artworkId}`}
                className="btn btn-outline-dark"
                style={{ marginTop: 8 }}
              >
                Ver obra en catalogo →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
