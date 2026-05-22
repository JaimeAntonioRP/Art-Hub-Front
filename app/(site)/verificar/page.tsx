"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Artwork } from "@/lib/api";
import VerifyModal from "@/components/VerifyModal";
import { fieldStyle, inputStyle, labelStyle } from "@/components/AuthCard";

export default function VerificarPage() {
  const [artworks, setArtworks]   = useState<Artwork[]>([]);
  const [artworkId, setArtworkId] = useState("");
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [demoOpen, setDemoOpen]   = useState(false);
  const [demoArtwork, setDemoArtwork] = useState<Artwork | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listArtworks().then((list) => {
      setArtworks(list);
      // pick first artwork with an image for the demo
      const pick = list.find((a) => a.image_url) ?? list[0] ?? null;
      setDemoArtwork(pick);
    }).catch(() => {});
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !artworkId) return;
    setModalOpen(true);
  };

  const reset = () => {
    setFile(null); setPreview(null); setArtworkId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* verification form modal */}
      <VerifyModal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} autoStart />
      {/* demo simulation modal */}
      <VerifyModal open={demoOpen}  onClose={() => setDemoOpen(false)} autoStart />

      {/* ── Hero ── */}
      <div style={{
        background: "var(--dark, #0D1B2A)",
        borderBottom: "1px solid rgba(239,230,213,0.1)",
        padding: "56px 0 44px",
        textAlign: "center",
      }}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: "var(--oro-cusco)" }}>Tecnología Arthub</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
            fontSize: "clamp(36px, 5.5vw, 64px)", lineHeight: 1.05,
            color: "var(--cream-on-dark, #EFE6D5)", margin: "12px 0 14px",
            letterSpacing: "-0.02em",
          }}>
            Verificación <em style={{ color: "var(--oro-cusco)", fontStyle: "italic" }}>biométrica</em>
          </h1>
          <p style={{ color: "#C9BFA9", fontSize: 16, maxWidth: "54ch", margin: "0 auto", lineHeight: 1.6 }}>
            Comprueba la autenticidad de cualquier obra cusqueña certificada en Arthub.
            Nuestro sistema IA analiza la firma biométrica del artista.
          </p>
        </div>
      </div>

      {/* ── Demo section ── */}
      {demoArtwork && (
        <div style={{
          background: "linear-gradient(135deg, var(--dark,#0D1B2A) 0%, var(--azul-medio,#1E3448) 100%)",
          borderBottom: "1px solid rgba(203,162,74,0.2)",
          padding: "40px 0",
        }}>
          <div className="wrap">
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 28,
              alignItems: "center",
              background: "rgba(237,227,204,0.04)",
              border: "1px solid rgba(203,162,74,0.25)",
              borderRadius: 16,
              padding: "24px 28px",
            }} className="demo-verify-row">
              {/* obra miniatura */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={demoArtwork.image_url}
                  alt={demoArtwork.title}
                  style={{
                    width: 90, height: 90, objectFit: "cover",
                    borderRadius: 10,
                    border: "2px solid rgba(203,162,74,0.4)",
                    display: "block",
                  }}
                  onError={(e) => { const el = e.currentTarget; if (!el.src.endsWith("/placeholder-obra.svg")) el.src = "/placeholder-obra.svg"; }}
                />
                {/* scan overlay animado */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 10, overflow: "hidden", pointerEvents: "none",
                }}>
                  <div style={{
                    position: "absolute", left: 0, width: "100%", height: 2,
                    background: "linear-gradient(90deg, transparent, #CBA24A, transparent)",
                    animation: "demo-scan 2s ease-in-out infinite",
                  }} />
                </div>
              </div>

              {/* texto */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--oro-cusco)", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                  Demo · Verificación en vivo
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#EFE6D5", fontWeight: 500, marginBottom: 3 }}>
                  {demoArtwork.title}
                </div>
                <div style={{ fontSize: 12.5, color: "#9E957F", fontFamily: "'Inter',sans-serif" }}>
                  {demoArtwork.artist_name} · Prueba cómo funciona la verificación biométrica IA
                </div>
              </div>

              {/* botón demo */}
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                  padding: "12px 22px",
                  background: "var(--oro-cusco, #CBA24A)",
                  color: "#0D1B2A", border: "none", borderRadius: 8,
                  fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", letterSpacing: "0.04em",
                  transition: "opacity 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Iniciar demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form + Steps ── */}
      <section style={{ background: "var(--paper-2)", padding: "48px 0 80px" }}>
        <div className="wrap verify-grid">
          {/* formulario */}
          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: 12, padding: "28px 28px", height: "fit-content" }}>
            <div className="eyebrow">Validación biométrica</div>
            <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 8px" }}>Verificar una obra</h2>
            <p className="muted" style={{ marginTop: 0, fontSize: 14, marginBottom: 24 }}>
              Selecciona la obra y sube la fotografía o código QR de su certificado.
            </p>

            <form onSubmit={onSubmit} noValidate>
              <div style={fieldStyle}>
                <label style={labelStyle}>Obra a verificar</label>
                <select style={inputStyle} required value={artworkId} onChange={(e) => setArtworkId(e.target.value)}>
                  <option value="">— Selecciona una obra —</option>
                  {artworks.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} — {a.artist_name}</option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Imagen / QR del certificado</label>
                <input
                  ref={fileInputRef} type="file" accept="image/*" required
                  onChange={handleFile}
                  style={{ ...inputStyle, padding: 8, background: "var(--paper-2)" }}
                />
              </div>

              {preview && (
                <div style={{ marginBottom: 18 }}>
                  <img src={preview} alt="vista previa" style={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 8, border: "1px solid var(--rule)", background: "var(--paper-2)" }} />
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={!file || !artworkId} className="btn btn-gold btn-lg"
                  style={{ flex: 1, opacity: !file || !artworkId ? 0.55 : 1, justifyContent: "center" }}>
                  Verificar
                </button>
                {file && (
                  <button type="button" onClick={reset} className="btn btn-outline-dark btn-lg">Limpiar</button>
                )}
              </div>
            </form>
          </div>

          {/* pasos */}
          <div>
            <div className="eyebrow">¿Cómo funciona?</div>
            <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 20px" }}>Proceso de autenticación</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { n: "01", t: "Selecciona la obra", d: "Elige del catálogo la obra que deseas verificar.", ico: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
                { n: "02", t: "Sube el certificado",  d: "Fotografía la obra o sube el código QR del certificado.", ico: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" },
                { n: "03", t: "Análisis biométrico",  d: "El sistema analiza la imagen y compara la firma biométrica original.", ico: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
                { n: "04", t: "Resultado inmediato",  d: "Obtienes el porcentaje de coincidencia y el estado del certificado.", ico: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" },
              ].map(({ n, t, d, ico }) => (
                <div key={n} style={{
                  display: "flex", gap: 16, alignItems: "flex-start",
                  padding: "16px 18px", background: "#fff",
                  border: "1px solid var(--rule)", borderRadius: 10,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(203,162,74,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco,#CBA24A)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ico}/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 3, fontSize: 14 }}>{t}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{d}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "rgba(203,162,74,0.35)", marginLeft: "auto", flexShrink: 0, lineHeight: 1 }}>{n}</div>
                </div>
              ))}
            </div>

            {/* trust chips */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              {["IA biométrica", "Blockchain inmutable", "Resultado en segundos", "100% seguro"].map((label) => (
                <span key={label} className="chip chip-gold" style={{ fontSize: 11 }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .verify-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .demo-verify-row {
          grid-template-columns: auto 1fr auto !important;
        }
        @keyframes demo-scan {
          0%   { top: 0%; opacity: 1; }
          50%  { top: calc(100% - 2px); opacity: 1; }
          100% { top: 0%; opacity: 1; }
        }
        @media (max-width: 760px) {
          .verify-grid { grid-template-columns: 1fr !important; gap: 24px; }
          .demo-verify-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .demo-verify-row img { margin: 0 auto; }
          .demo-verify-row button { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
