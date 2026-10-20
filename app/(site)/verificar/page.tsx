"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fieldStyle, inputStyle, labelStyle } from "@/components/AuthCard";

/** Acepta el código suelto o el enlace completo que contiene el QR. */
function extractToken(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/verificar\/([^/?#\s]+)/);
  return match ? match[1] : trimmed;
}

const STEPS = [
  { n: "01", t: "Escanea el QR", d: "Usa la cámara de tu teléfono sobre el código QR de la obra.", ico: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM19 15h2v2h-2z" },
  { n: "02", t: "O ingresa el código", d: "Escribe el código de verificación o pega el enlace que recibiste.", ico: "M4 7V4h16v3M9 20h6M12 4v16" },
  { n: "03", t: "Consulta el registro", d: "Verás si la obra está registrada en ArtHub, su ficha pública y el estado del registro.", ico: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" },
];

export default function VerificarPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const token = extractToken(code);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    router.push(`/verificar/${encodeURIComponent(token)}`);
  };

  return (
    <>
      {/* ── Hero ── */}
      <div style={{
        background: "var(--dark, #0D1B2A)",
        borderBottom: "1px solid rgba(239,230,213,0.1)",
        padding: "56px 0 44px",
        textAlign: "center",
      }}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: "var(--oro-cusco)" }}>Registro ArtHub</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
            fontSize: "clamp(36px, 5.5vw, 64px)", lineHeight: 1.05,
            color: "var(--cream-on-dark, #EFE6D5)", margin: "12px 0 14px",
            letterSpacing: "-0.02em",
          }}>
            Verificar una <em style={{ color: "var(--oro-cusco)", fontStyle: "italic" }}>obra</em>
          </h1>
          <p style={{ color: "#C9BFA9", fontSize: 16, maxWidth: "54ch", margin: "0 auto", lineHeight: 1.6 }}>
            Comprueba si una obra está registrada en ArtHub y consulta su información pública.
          </p>
        </div>
      </div>

      {/* ── Form + Steps ── */}
      <section style={{ background: "var(--paper-2)", padding: "48px 0 80px" }}>
        <div className="wrap verify-grid">
          {/* formulario */}
          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: 12, padding: "28px 28px", height: "fit-content" }}>
            <div className="eyebrow">Código de verificación</div>
            <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 8px" }}>Buscar registro</h2>
            <p className="muted" style={{ marginTop: 0, fontSize: 14, marginBottom: 24 }}>
              El código aparece debajo del QR de la obra.
            </p>

            <form onSubmit={onSubmit} noValidate>
              <div style={fieldStyle}>
                <label htmlFor="verify-code" style={labelStyle}>Código o enlace</label>
                <input
                  id="verify-code"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ej. 3f2c9a1e-…"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={!token} className="btn btn-gold btn-lg"
                style={{ width: "100%", opacity: token ? 1 : 0.55, justifyContent: "center" }}>
                Verificar
              </button>
            </form>
          </div>

          {/* pasos */}
          <div>
            <div className="eyebrow">¿Cómo funciona?</div>
            <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 20px" }}>Consulta en tres pasos</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map(({ n, t, d, ico }) => (
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

            <p className="muted" style={{ fontSize: 12.5, marginTop: 18, lineHeight: 1.6 }}>
              La consulta confirma que la obra está registrada en ArtHub. No es un peritaje
              ni una prueba legal de autenticidad o de propiedad.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .verify-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (max-width: 760px) {
          .verify-grid { grid-template-columns: 1fr !important; gap: 24px; }
        }
      `}</style>
    </>
  );
}
