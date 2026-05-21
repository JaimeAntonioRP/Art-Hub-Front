"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "scanning" | "validating" | "success";

const STEPS = [
  "Leyendo token de autenticidad",
  "Verificando firma biométrica",
  "Consultando registro blockchain",
  "Confirmando procedencia",
];

const GOLD = "#d4af37";
const GLASS: React.CSSProperties = {
  background: "rgba(19,19,19,0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
};

/* ─── keyframes ─────────────────────────────────────────────────────────── */
const CSS = `
@keyframes vfy-scanMove {
  0%  { top:0%;  opacity:1; }
  50% { top:96%; opacity:1; }
  100%{ top:0%;  opacity:1; }
}
@keyframes vfy-flowUp {
  0%  { transform:translateY(0)      scale(1);   opacity:.9; }
  100%{ transform:translateY(-180px) scale(.4);  opacity:0;  }
}
@keyframes vfy-popIn {
  0%  { transform:scale(0); }
  60% { transform:scale(1.15); }
  100%{ transform:scale(1); }
}
@keyframes vfy-stampIn {
  0%  { opacity:0; transform:scale(2.2) rotate(-6deg); }
  60% { opacity:1; transform:scale(.92) rotate(1deg);  }
  100%{ opacity:1; transform:scale(1)   rotate(0deg);  }
}
@keyframes vfy-spin   { to{ transform:rotate(360deg); } }
@keyframes vfy-fadeUp {
  from{ opacity:0; transform:translateY(16px); }
  to  { opacity:1; transform:translateY(0);    }
}
@keyframes vfy-pulse {
  0%,100%{ box-shadow:0 0 16px rgba(212,175,55,.3); }
  50%    { box-shadow:0 0 38px rgba(212,175,55,.65); }
}
@keyframes vfy-overlayIn {
  from{ opacity:0; }
  to  { opacity:1; }
}
`;

/* ─── modal component ───────────────────────────────────────────────────── */
export default function VerifyModal({
  open,
  onClose,
  autoStart = false,   // si true arranca directo en scanning (sin idle)
}: {
  open: boolean;
  onClose: () => void;
  autoStart?: boolean;
}) {
  const [token, setToken]         = useState("verificando...");
  const [phase, setPhase]         = useState<Phase>("idle");
  const [progress, setProgress]   = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const particleRef = useRef<HTMLDivElement>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* inject keyframes once */
  useEffect(() => {
    const id = "vfy-kf";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* lock body scroll + auto-arrancar si autoStart */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && autoStart) {
      setPhase("idle");          // reset
      setProgress(0); setStepsDone([]); setActiveStep(-1);
      // pequeño delay para que el overlay aparezca primero
      const t = setTimeout(() => startSequence(), 200);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  /* cleanup on unmount */
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function handleClose() {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("idle");
    setToken("");
    setProgress(0);
    setStepsDone([]);
    setActiveStep(-1);
    onClose();
  }

  function spawnParticles() {
    const c = particleRef.current; if (!c) return;
    for (let i = 0; i < 22; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.style.cssText = `position:absolute;color:${GOLD};font-family:monospace;font-size:10px;pointer-events:none;` +
          `left:${44+Math.random()*12}%;top:${38+Math.random()*24}%;` +
          `animation:vfy-flowUp ${1.8+Math.random()}s ease-out forwards;`;
        p.textContent = Math.random().toString(16).substring(2, 9);
        c.appendChild(p);
        setTimeout(() => p.remove(), 2800);
      }, i * 110);
    }
  }

  function startSequence() {
    if (!token.trim()) return;
    setPhase("scanning");
    setProgress(0); setStepsDone([]); setActiveStep(-1);
    spawnParticles();

    setTimeout(() => {
      setPhase("validating");
      setActiveStep(0);

      let prog = 0;
      timerRef.current = setInterval(() => {
        prog += 7 + Math.random() * 9;
        if (prog >= 100) { prog = 100; clearInterval(timerRef.current!); }
        setProgress(Math.min(prog, 100));
      }, 270);

      STEPS.forEach((_, idx) => {
        setTimeout(() => {
          setActiveStep(idx);
          setTimeout(() => setStepsDone(d => [...d, idx]), 850);
        }, idx * 950);
      });

      setTimeout(() => setPhase("success"), STEPS.length * 950 + 700);
    }, 2700);
  }

  if (!open) return null;

  return (
    /* overlay */
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(8,8,8,0.88)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "vfy-overlayIn .25s ease both",
      }}
    >
      {/* partículas */}
      <div ref={particleRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }} />

      {/* botón cerrar */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute", top: 20, right: 24, zIndex: 10,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "50%", width: 38, height: 38,
          color: "#e5e2e1", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420, padding: "0 20px", animation: "vfy-fadeUp .4s ease both" }}>
          {/* icono */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
              ...GLASS, border: `1px solid ${GOLD}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "vfy-pulse 2.8s ease-in-out infinite",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/>
                <rect x="3" y="16" width="5" height="5"/>
                <path d="M10 4h1M13 4h1M4 10v1M4 13v1M19 10v1M19 13v1M10 19h1M13 19h1M10 10l4 4M14 10l-4 4"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#e5e2e1", margin: "0 0 6px" }}>
              Verificar Autenticidad
            </h2>
            <p style={{ color: "#99907c", fontSize: 13, margin: 0 }}>
              Ingresa el token único de la obra
            </p>
          </div>

          <div style={{ ...GLASS, borderRadius: 12, padding: "24px 24px 20px" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#99907c", marginBottom: 8 }}>
              Token de autenticidad
            </label>
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === "Enter" && startSequence()}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${token ? GOLD+"88" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 6, color: "#e5e2e1",
                fontFamily: "monospace", fontSize: 13,
                padding: "11px 13px", outline: "none",
                transition: "border-color .2s",
              }}
            />
            <button
              onClick={startSequence}
              disabled={!token.trim()}
              style={{
                marginTop: 14, width: "100%", padding: "12px 0",
                background: token.trim() ? GOLD : "rgba(212,175,55,0.2)",
                color: token.trim() ? "#14110C" : "#99907c",
                border: "none", borderRadius: 4,
                fontFamily: "sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                cursor: token.trim() ? "pointer" : "not-allowed",
                transition: "all .2s",
              }}
            >
              Verificar Obra
            </button>
          </div>
        </div>
      )}

      {/* ── SCANNING ── */}
      {phase === "scanning" && (
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            width: 260, height: 260,
            border: `2px solid ${GOLD}55`,
            borderRadius: 14,
            boxShadow: `0 0 30px ${GOLD}22, inset 0 0 30px ${GOLD}11`,
            position: "relative",
            animation: "vfy-fadeUp .35s ease both",
          }}>
            {/* esquinas */}
            {[
              {top:-2,left:-2,borderWidth:"3px 0 0 3px"},
              {top:-2,right:-2,borderWidth:"3px 3px 0 0"},
              {bottom:-2,left:-2,borderWidth:"0 0 3px 3px"},
              {bottom:-2,right:-2,borderWidth:"0 3px 3px 0"},
            ].map((s,i) => (
              <div key={i} style={{ position:"absolute", width:28, height:28, borderColor:GOLD, borderStyle:"solid", ...s }} />
            ))}
            {/* scan line */}
            <div style={{
              position:"absolute", left:0, width:"100%", height:2,
              background: GOLD,
              boxShadow: `0 0 10px ${GOLD}, 0 0 22px ${GOLD}`,
              animation: "vfy-scanMove 1.8s ease-in-out infinite",
            }} />
          </div>
          <p style={{ textAlign:"center", marginTop:20, color:GOLD, fontSize:11, fontFamily:"monospace", letterSpacing:"0.15em" }}>
            ESCANEANDO · · ·
          </p>
        </div>
      )}

      {/* ── VALIDATING ── */}
      {phase === "validating" && (
        <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:420, padding:"0 20px", animation:"vfy-fadeUp .4s ease both" }}>
          <div style={{ ...GLASS, borderRadius:14, padding:"28px 24px" }}>
            {/* header */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
              <div style={{ width:44,height:44,borderRadius:"50%",...GLASS,border:`1px solid ${GOLD}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#e5e2e1", fontWeight:600 }}>Analizando Certificado</div>
                <code style={{ fontSize:11, color:"#99907c" }}>{token.slice(0,20)}…</code>
              </div>
            </div>
            {/* barra */}
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:10, color:"#99907c", letterSpacing:"0.1em", textTransform:"uppercase" }}>Progreso</span>
                <span style={{ fontSize:11, color:GOLD, fontFamily:"monospace" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height:2, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:GOLD, boxShadow:`0 0 10px ${GOLD}`, borderRadius:2, transition:"width .27s ease" }} />
              </div>
            </div>
            {/* pasos */}
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              {STEPS.map((step, i) => {
                const done   = stepsDone.includes(i);
                const active = activeStep === i && !done;
                const shown  = i <= activeStep;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, opacity: shown ? 1 : 0.2, transition:"opacity .4s ease" }}>
                    <div style={{ width:20,height:20,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      {done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"vfy-popIn .3s ease both" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : active ? (
                        <div style={{ width:16,height:16,borderRadius:"50%",border:`2px solid ${GOLD}33`,borderTopColor:GOLD,animation:"vfy-spin .9s linear infinite" }} />
                      ) : (
                        <div style={{ width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.2)" }} />
                      )}
                    </div>
                    <span style={{ fontSize:13, color: done ? "#4edea3" : active ? "#e5e2e1" : "#4d4635", fontFamily:"'Geist',sans-serif", transition:"color .3s" }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {phase === "success" && (
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", padding:"0 20px", animation:"vfy-fadeUp .5s ease both" }}>
          {/* círculo */}
          <div style={{
            width:88,height:88,borderRadius:"50%",
            background:"rgba(78,222,163,0.12)",border:"2px solid #4edea3",
            display:"flex",alignItems:"center",justifyContent:"center",
            marginBottom:20,
            boxShadow:"0 0 40px rgba(78,222,163,0.25)",
            animation:"vfy-popIn .6s cubic-bezier(.175,.885,.32,1.275) both",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4edea3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          {/* sello */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(78,222,163,0.12)", border:"1px solid #4edea355",
            borderRadius:999, padding:"7px 18px", marginBottom:16,
            animation:"vfy-stampIn .5s .15s cubic-bezier(.25,.46,.45,.94) both",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#4edea3"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#4edea3" }}>Autenticidad Verificada</span>
          </div>

          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#e5e2e1", margin:"0 0 8px", textAlign:"center" }}>
            Obra Auténtica
          </h2>

          {/* token */}
          <div style={{ ...GLASS, borderRadius:8, padding:"9px 16px", marginBottom:24, maxWidth:380, width:"100%" }}>
            <div style={{ fontSize:10,color:"#99907c",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3 }}>Token verificado</div>
            <code style={{ fontSize:11,color:GOLD,wordBreak:"break-all" }}>{token}</code>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => { setPhase("idle"); setToken(""); setProgress(0); setStepsDone([]); setActiveStep(-1); }}
              style={{ padding:"10px 22px", background:GOLD, color:"#14110C", border:"none", borderRadius:4, fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
              Verificar otra
            </button>
            <button onClick={handleClose}
              style={{ padding:"10px 22px", background:"rgba(255,255,255,0.06)", color:"#e5e2e1", border:"1px solid rgba(255,255,255,0.1)", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
