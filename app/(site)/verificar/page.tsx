"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Phase = "idle" | "scanning" | "validating" | "success";

/* pasos de validación que aparecen uno a uno */
const STEPS = [
  "Leyendo token de autenticidad",
  "Verificando firma biométrica",
  "Consultando registro blockchain",
  "Confirmando procedencia",
];

export default function VerificarPage() {
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const particleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  /* inyecta las keyframes una sola vez */
  useEffect(() => {
    const id = "verify-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes scanMove {
        0%   { top: 0%;   opacity: 1; }
        50%  { top: 96%;  opacity: 1; }
        100% { top: 0%;   opacity: 1; }
      }
      @keyframes flowUp {
        0%   { transform: translateY(0)     scale(1);   opacity: 0.9; }
        100% { transform: translateY(-180px) scale(0.4); opacity: 0;   }
      }
      @keyframes popIn {
        0%   { transform: scale(0); }
        60%  { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      @keyframes stampIn {
        0%   { opacity: 0; transform: scale(2.2) rotate(-6deg); }
        60%  { opacity: 1; transform: scale(0.92) rotate(1deg); }
        100% { opacity: 1; transform: scale(1)   rotate(0deg); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulseGold {
        0%, 100% { box-shadow: 0 0 18px rgba(212,175,55,0.35); }
        50%       { box-shadow: 0 0 40px rgba(212,175,55,0.7); }
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  /* limpia la secuencia si desmonta */
  useEffect(() => () => { if (progressRef.current) clearInterval(progressRef.current); }, []);

  function spawnParticles() {
    const container = particleRef.current;
    if (!container) return;
    for (let i = 0; i < 22; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.style.cssText = `
          position:absolute;
          color:#d4af37;
          font-family:monospace;
          font-size:10px;
          pointer-events:none;
          left:${45 + Math.random() * 10}%;
          top:${40 + Math.random() * 20}%;
          animation: flowUp ${1.8 + Math.random()}s ease-out forwards;
        `;
        p.textContent = Math.random().toString(16).substring(2, 9);
        container.appendChild(p);
        setTimeout(() => p.remove(), 2800);
      }, i * 120);
    }
  }

  function startSequence() {
    if (!token.trim()) return;
    setPhase("scanning");
    setProgress(0);
    setStepsDone([]);
    setActiveStep(-1);
    spawnParticles();

    /* fase scanning → validating */
    setTimeout(() => {
      setPhase("validating");
      setActiveStep(0);

      let prog = 0;
      progressRef.current = setInterval(() => {
        prog += 7 + Math.random() * 8;
        if (prog >= 100) { prog = 100; clearInterval(progressRef.current!); }
        setProgress(Math.min(prog, 100));
      }, 280);

      /* activa steps uno a uno */
      STEPS.forEach((_, idx) => {
        setTimeout(() => {
          setActiveStep(idx);
          setTimeout(() => setStepsDone((d) => [...d, idx]), 900);
        }, idx * 1000);
      });

      /* → success */
      setTimeout(() => {
        setPhase("success");
      }, STEPS.length * 1000 + 800);

    }, 2800);
  }

  function reset() {
    setPhase("idle");
    setToken("");
    setProgress(0);
    setStepsDone([]);
    setActiveStep(-1);
  }

  /* ── estilos comunes ────────────────────────────────────────────────────── */
  const GOLD = "#d4af37";
  const DARK = "#131313";
  const GLASS: React.CSSProperties = {
    background: "rgba(19,19,19,0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.07)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* fondo artístico borroso */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "url(/obras/virgen-de-belen.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: phase === "success" ? 0.06 : 0.22,
          filter: phase === "scanning" ? "brightness(0.4) blur(3px)" : "brightness(0.3) blur(2px)",
          transition: "opacity 1.2s ease, filter 1s ease",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(19,19,19,0.7) 0%, transparent 40%, rgba(19,19,19,0.85) 100%)",
        }}
      />

      {/* contenedor de partículas */}
      <div ref={particleRef} style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }} />

      {/* ── FASE IDLE — formulario de token ─────────────────────────────────── */}
      {phase === "idle" && (
        <div
          style={{
            position: "relative", zIndex: 10, width: "100%", maxWidth: 460, padding: "0 20px",
            animation: "fadeSlideUp 0.6s ease both",
          }}
        >
          {/* logo / título */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            {/* icono escáner */}
            <div
              style={{
                width: 68, height: 68, borderRadius: "50%", margin: "0 auto 18px",
                ...GLASS,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${GOLD}44`,
                animation: "pulseGold 2.8s ease-in-out infinite",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
                <rect x="3" y="16" width="5" height="5" />
                <line x1="10" y1="4" x2="10" y2="6" /><line x1="14" y1="4" x2="14" y2="6" />
                <line x1="4" y1="10" x2="6" y2="10" /><line x1="4" y1="14" x2="6" y2="14" />
                <line x1="18" y1="10" x2="20" y2="10" /><line x1="18" y1="14" x2="20" y2="14" />
                <line x1="10" y1="18" x2="10" y2="20" /><line x1="14" y1="18" x2="14" y2="20" />
                <line x1="10" y1="10" x2="14" y2="14" /><line x1="14" y1="10" x2="10" y2="14" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 32, fontWeight: 700,
                color: "#e5e2e1",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              Verificar Autenticidad
            </h1>
            <p style={{ color: "#99907c", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Ingresa el token de la obra para confirmar<br />su certificado de autenticidad.
            </p>
          </div>

          {/* panel de input */}
          <div style={{ ...GLASS, borderRadius: 12, padding: "28px 28px 24px" }}>
            <label
              style={{
                display: "block",
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#99907c",
                marginBottom: 10,
              }}
            >
              Token de autenticidad
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startSequence()}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${token ? GOLD + "88" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6,
                color: "#e5e2e1",
                fontFamily: "monospace",
                fontSize: 13,
                padding: "12px 14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              autoFocus
            />

            <button
              onClick={startSequence}
              disabled={!token.trim()}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "13px 0",
                background: token.trim() ? GOLD : "rgba(212,175,55,0.25)",
                color: token.trim() ? "#14110C" : "#99907c",
                border: "none",
                borderRadius: 4,
                fontFamily: "'Geist', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: token.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              Verificar Obra
            </button>

            <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "#4d4635" }}>
                ¿No tienes el token? Encuéntralo en la{" "}
                <Link href="/catalogo" style={{ color: GOLD, textDecoration: "none" }}>
                  página de la obra
                </Link>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── FASE SCANNING — visor QR ─────────────────────────────────────────── */}
      {phase === "scanning" && (
        <div
          style={{
            position: "absolute", zIndex: 10,
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 280, height: 280,
            border: `2px solid ${GOLD}66`,
            borderRadius: 14,
            boxShadow: `0 0 28px ${GOLD}33, inset 0 0 28px ${GOLD}11`,
            animation: "fadeSlideUp 0.4s ease both",
          }}
        >
          {/* esquinas doradas */}
          {[
            { top: -2, left: -2, borderWidth: "3px 0 0 3px" },
            { top: -2, right: -2, borderWidth: "3px 3px 0 0" },
            { bottom: -2, left: -2, borderWidth: "0 0 3px 3px" },
            { bottom: -2, right: -2, borderWidth: "0 3px 3px 0" },
          ].map((s, i) => (
            <div key={i} style={{
              position: "absolute", width: 32, height: 32,
              borderColor: GOLD, borderStyle: "solid",
              ...s,
            }} />
          ))}

          {/* línea de escaneo */}
          <div
            style={{
              position: "absolute", left: 0, width: "100%", height: 2,
              background: GOLD,
              boxShadow: `0 0 10px ${GOLD}, 0 0 22px ${GOLD}`,
              animation: "scanMove 1.8s ease-in-out infinite",
            }}
          />

          {/* texto inferior */}
          <div
            style={{
              position: "absolute", bottom: -36, left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              color: GOLD,
              fontSize: 11,
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              opacity: 0.8,
            }}
          >
            ESCANEANDO · · ·
          </div>
        </div>
      )}

      {/* ── FASE VALIDATING — tarjeta de progreso ──────────────────────────── */}
      {phase === "validating" && (
        <div
          style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: 440, padding: "0 20px",
            animation: "fadeSlideUp 0.5s ease both",
          }}
        >
          <div style={{ ...GLASS, borderRadius: 14, padding: "32px 28px" }}>
            {/* encabezado */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: "50%",
                  ...GLASS, border: `1px solid ${GOLD}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#e5e2e1", fontWeight: 600 }}>
                  Analizando Certificado
                </div>
                <code style={{ fontSize: 11, color: "#99907c", letterSpacing: "0.05em" }}>
                  {token.slice(0, 18)}…
                </code>
              </div>
            </div>

            {/* barra de progreso */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#99907c", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Progreso
                </span>
                <span style={{ fontSize: 11, color: GOLD, fontFamily: "monospace" }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: GOLD,
                    boxShadow: `0 0 10px ${GOLD}`,
                    borderRadius: 2,
                    transition: "width 0.28s ease",
                  }}
                />
              </div>
            </div>

            {/* pasos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map((step, i) => {
                const isDone = stepsDone.includes(i);
                const isActive = activeStep === i && !isDone;
                const isVisible = i <= activeStep;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      opacity: isVisible ? 1 : 0.2,
                      transform: isVisible ? "translateY(0)" : "translateY(8px)",
                      transition: "all 0.45s ease",
                    }}
                  >
                    {/* icono estado */}
                    <div style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDone ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "popIn 0.3s ease both" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isActive ? (
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2px solid ${GOLD}33`,
                          borderTopColor: GOLD,
                          animation: "spin 0.9s linear infinite",
                        }} />
                      ) : (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: isDone ? "#4edea3" : isActive ? "#e5e2e1" : "#4d4635",
                      fontFamily: "'Geist', monospace",
                      transition: "color 0.3s",
                    }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FASE SUCCESS ─────────────────────────────────────────────────────── */}
      {phase === "success" && (
        <div
          style={{
            position: "relative", zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "0 20px",
            animation: "fadeSlideUp 0.6s ease both",
          }}
        >
          {/* círculo de éxito */}
          <div
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(78,222,163,0.12)",
              border: "2px solid #4edea3",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 40px rgba(78,222,163,0.25)",
              animation: "popIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>

          {/* sello estampado */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(78,222,163,0.12)",
              border: "1px solid #4edea355",
              borderRadius: 999,
              padding: "8px 20px",
              marginBottom: 20,
              animation: "stampIn 0.5s 0.2s cubic-bezier(0.25,0.46,0.45,0.94) both",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#4edea3" stroke="none">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4edea3" }}>
              Autenticidad Verificada
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, fontWeight: 700,
            color: "#e5e2e1", margin: "0 0 10px",
            textAlign: "center",
          }}>
            Obra Auténtica
          </h2>

          {/* token mostrado */}
          <div style={{ ...GLASS, borderRadius: 8, padding: "10px 18px", marginBottom: 28, maxWidth: 420 }}>
            <div style={{ fontSize: 10, color: "#99907c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Token verificado</div>
            <code style={{ fontSize: 12, color: GOLD, wordBreak: "break-all" }}>{token}</code>
          </div>

          {/* botones */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={reset}
              style={{
                padding: "11px 24px",
                background: GOLD,
                color: "#14110C",
                border: "none",
                borderRadius: 4,
                fontSize: 12, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Verificar otra
            </button>
            <Link
              href="/catalogo"
              style={{
                padding: "11px 24px",
                background: "rgba(255,255,255,0.06)",
                color: "#e5e2e1",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 4,
                fontSize: 12, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
