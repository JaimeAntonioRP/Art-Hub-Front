"use client";

import { useEffect, useRef, useState } from "react";
import type { Artwork } from "@/lib/api";

interface Props {
  open: boolean;
  artwork: Artwork;
  onClose: () => void;
}

type Phase = "verifying" | "blockchain" | "certificate" | "success";

const PHASES: { id: Phase; label: string; sub: string; duration: number }[] = [
  { id: "verifying",   label: "Verificando identidad",      sub: "Análisis KYC · Validación biométrica",         duration: 2200 },
  { id: "blockchain",  label: "Registrando en blockchain",  sub: "Ethereum Mainnet · Confirmando bloque",        duration: 2800 },
  { id: "certificate", label: "Emitiendo certificado",      sub: "Sellando autenticidad · Generando token NFT",  duration: 2000 },
  { id: "success",     label: "Compra completada",          sub: "La obra es ahora tuya",                        duration: Infinity },
];

function fakeHash() {
  return "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

function fakeToken() {
  const s = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AH-${s()}-${s()}-${s()}`;
}

function formatPrice(value: string | number) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

/* ── animated hash ticker ── */
function HashTicker({ final }: { final: string }) {
  const CHARS = "0123456789abcdef";
  const [display, setDisplay] = useState(fakeHash());
  const iter = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      iter.current++;
      const reveal = Math.min(iter.current * 3, final.length);
      const scramble = Array.from(final).map((c, i) =>
        i < reveal ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join("");
      setDisplay(scramble);
      if (reveal >= final.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [final]);
  return <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{display}</span>;
}

/* ── spinning ring SVG ── */
function Spinner({ color = "#CBA24A", size = 48 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ animation: "pm-spin 1s linear infinite" }}>
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
      <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray="30 96" strokeLinecap="round" />
    </svg>
  );
}

/* ── progress bar ── */
function ProgressBar({ pct, color = "#CBA24A" }: { pct: number; color?: string }) {
  return (
    <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${pct}%`, background: color, borderRadius: 99,
        transition: "width 0.15s linear",
        boxShadow: `0 0 8px ${color}88`,
      }} />
    </div>
  );
}

export default function PurchaseModal({ open, artwork, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("verifying");
  const [blockPct, setBlockPct] = useState(0);
  const [certPct, setCertPct] = useState(0);
  const [txHash] = useState(fakeHash);
  const [token] = useState(fakeToken);
  const [blockNum] = useState(() => 19_800_000 + Math.floor(Math.random() * 50_000));

  /* inject CSS once */
  useEffect(() => {
    const id = "pm-styles";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes pm-spin    { to { transform: rotate(360deg); } }
      @keyframes pm-fade-in { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      @keyframes pm-stamp   { 0%{opacity:0;transform:scale(1.6) rotate(-8deg)} 60%{opacity:1;transform:scale(0.92) rotate(2deg)} 100%{transform:scale(1) rotate(0)} }
      @keyframes pm-pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes pm-glow    { 0%,100%{box-shadow:0 0 0 0 rgba(78,222,163,0)} 50%{box-shadow:0 0 24px 4px rgba(78,222,163,0.35)} }
      @keyframes pm-confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(-60px) rotate(720deg); opacity:0} }
    `;
    document.head.appendChild(s);
  }, []);

  /* ESC to close (only on success) */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape" && phase === "success") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, phase, onClose]);

  /* lock scroll */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* phase sequencer */
  useEffect(() => {
    if (!open) { setPhase("verifying"); setBlockPct(0); setCertPct(0); return; }

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    setPhase("verifying");
    setBlockPct(0);
    setCertPct(0);

    t1 = setTimeout(() => {
      setPhase("blockchain");
      // animate progress bar 0→100 over ~2600ms
      let p = 0;
      const iv = setInterval(() => {
        p = Math.min(p + (Math.random() * 5 + 1), 100);
        setBlockPct(p);
        if (p >= 100) clearInterval(iv);
      }, 130);
    }, PHASES[0].duration);

    t2 = setTimeout(() => {
      setPhase("certificate");
      let p = 0;
      const iv = setInterval(() => {
        p = Math.min(p + (Math.random() * 8 + 2), 100);
        setCertPct(p);
        if (p >= 100) clearInterval(iv);
      }, 100);
    }, PHASES[0].duration + PHASES[1].duration);

    t3 = setTimeout(() => {
      setPhase("success");
    }, PHASES[0].duration + PHASES[1].duration + PHASES[2].duration);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open]);

  if (!open) return null;

  const phaseIdx = PHASES.findIndex(p => p.id === phase);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && phase === "success") onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(5,4,3,0.88)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "pm-fade-in 0.25s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#0e0d0c",
        border: "1px solid rgba(203,162,74,0.22)",
        borderRadius: 16,
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        overflow: "hidden",
        animation: "pm-fade-in 0.3s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* ── header bar ── */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(203,162,74,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBA24A" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
            </svg>
            <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#CBA24A", fontFamily: "'Geist','Inter',sans-serif", fontWeight: 600 }}>
              Arthub · Simulación de compra
            </span>
          </div>
          {phase === "success" && (
            <button type="button" onClick={onClose}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── step indicators ── */}
        <div style={{ display: "flex", padding: "14px 24px 0", gap: 6 }}>
          {PHASES.filter(p => p.id !== "success").map((p, i) => (
            <div key={p.id} style={{ flex: 1, height: 3, borderRadius: 99,
              background: i < phaseIdx ? "#4EDEA3" : i === phaseIdx ? "#CBA24A" : "rgba(255,255,255,0.1)",
              transition: "background 0.4s", boxShadow: i === phaseIdx ? "0 0 6px rgba(203,162,74,0.5)" : "none"
            }} />
          ))}
        </div>

        {/* ── body ── */}
        <div style={{ padding: "32px 28px 28px", minHeight: 320 }}>

          {/* PHASE: verifying */}
          {phase === "verifying" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, animation:"pm-fade-in 0.3s ease" }}>
              <Spinner size={56} color="#CBA24A" />
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:20, fontFamily:"'Cormorant Garamond','Playfair Display',serif", color:"#F0EAD6", fontWeight:600, marginBottom:6 }}>
                  Verificando identidad
                </div>
                <div style={{ fontSize:12.5, color:"rgba(240,234,214,0.5)", fontFamily:"'Geist','Inter',sans-serif" }}>
                  Análisis KYC · Validación biométrica
                </div>
              </div>
              <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
                {["Documento de identidad", "Historial de inversiones", "Validación AML"].map((item, i) => (
                  <div key={item} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                    background:"rgba(255,255,255,0.04)", borderRadius:8,
                    border:"1px solid rgba(255,255,255,0.06)",
                    animation:`pm-fade-in 0.3s ease ${i * 0.15}s both` }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(203,162,74,0.5)", borderTopColor:"#CBA24A", animation:"pm-spin 0.8s linear infinite", flexShrink:0 }} />
                    <span style={{ fontSize:13, color:"rgba(240,234,214,0.65)", fontFamily:"'Geist','Inter',sans-serif" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHASE: blockchain */}
          {phase === "blockchain" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"pm-fade-in 0.3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:"rgba(203,162,74,0.1)", border:"1px solid rgba(203,162,74,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CBA24A" strokeWidth="1.6" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize:18, fontFamily:"'Cormorant Garamond',serif", color:"#F0EAD6", fontWeight:600 }}>Registrando en blockchain</div>
                  <div style={{ fontSize:12, color:"rgba(240,234,214,0.45)", fontFamily:"'Geist','Inter',sans-serif", marginTop:2 }}>Ethereum Mainnet · Bloque #{blockNum.toLocaleString()}</div>
                </div>
              </div>

              <ProgressBar pct={blockPct} />
              <div style={{ fontSize:11.5, color:"rgba(203,162,74,0.7)", fontFamily:"monospace", textAlign:"right" }}>{Math.round(blockPct)}% confirmado</div>

              <div style={{ padding:"12px 14px", background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", fontFamily:"'Geist','Inter',sans-serif", marginBottom:6 }}>TX Hash</div>
                <div style={{ fontSize:11.5, color:"rgba(203,162,74,0.75)" }}>
                  <HashTicker final={txHash} />
                </div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                {["Gas: 42,000", "Red: ETH", "Estado: pendiente"].map(t => (
                  <span key={t} style={{ fontSize:10.5, padding:"4px 10px", borderRadius:20,
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                    color:"rgba(240,234,214,0.5)", fontFamily:"'Geist','Inter',sans-serif" }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* PHASE: certificate */}
          {phase === "certificate" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, animation:"pm-fade-in 0.3s ease" }}>
              <div style={{ position:"relative", width:80, height:80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ position:"absolute", inset:0, animation:"pm-spin 2s linear infinite" }}>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(203,162,74,0.15)" strokeWidth="2" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#CBA24A" strokeWidth="2"
                    strokeDasharray="40 186" strokeLinecap="round" />
                </svg>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBA24A" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
                  </svg>
                </div>
              </div>

              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:20, fontFamily:"'Cormorant Garamond',serif", color:"#F0EAD6", fontWeight:600, marginBottom:6 }}>
                  Emitiendo certificado
                </div>
                <div style={{ fontSize:12.5, color:"rgba(240,234,214,0.45)", fontFamily:"'Geist','Inter',sans-serif" }}>
                  Sellando autenticidad · Generando token
                </div>
              </div>

              <div style={{ width:"100%" }}>
                <ProgressBar pct={certPct} color="#4EDEA3" />
                <div style={{ fontSize:11, color:"rgba(78,222,163,0.6)", fontFamily:"'Geist','Inter',sans-serif", marginTop:6, textAlign:"right" }}>
                  Token: <span style={{ fontFamily:"monospace" }}>{token.slice(0, Math.round(certPct / 100 * token.length))}<span style={{ animation:"pm-pulse 0.4s linear infinite" }}>▌</span></span>
                </div>
              </div>
            </div>
          )}

          {/* PHASE: success */}
          {phase === "success" && (
            <div style={{ display:"flex", flexDirection:"column", gap:0, animation:"pm-fade-in 0.4s ease" }}>
              {/* success header */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:24 }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%",
                  background:"rgba(78,222,163,0.12)", border:"2px solid #4EDEA3",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  animation:"pm-stamp 0.5s cubic-bezier(.22,1,.36,1), pm-glow 2s ease 0.5s infinite",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4EDEA3" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, fontFamily:"'Cormorant Garamond',serif", color:"#F0EAD6", fontWeight:600 }}>¡Compra completada!</div>
                  <div style={{ fontSize:12.5, color:"rgba(78,222,163,0.7)", fontFamily:"'Geist','Inter',sans-serif", marginTop:4 }}>La obra es ahora parte de tu colección</div>
                </div>
              </div>

              {/* artwork summary card */}
              <div style={{
                display:"flex", gap:14, padding:"14px 16px",
                background:"rgba(255,255,255,0.04)", borderRadius:10,
                border:"1px solid rgba(255,255,255,0.07)", marginBottom:16,
              }}>
                <img src={artwork.image_url} alt={artwork.title}
                  style={{ width:60, height:60, objectFit:"cover", borderRadius:8, flexShrink:0, border:"1px solid rgba(255,255,255,0.1)" }}
                  onError={(e) => { const el = e.currentTarget; el.src = "/placeholder-obra.svg"; }}
                />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontFamily:"'Cormorant Garamond',serif", color:"#F0EAD6", fontWeight:600, lineHeight:1.2 }}>{artwork.title}</div>
                  <div style={{ fontSize:12, color:"rgba(240,234,214,0.45)", fontFamily:"'Geist','Inter',sans-serif", marginTop:3 }}>{artwork.artist_name}</div>
                  <div style={{ fontSize:15, color:"#CBA24A", fontFamily:"'Cormorant Garamond',serif", marginTop:5, fontWeight:600 }}>{formatPrice(artwork.price)}</div>
                </div>
              </div>

              {/* tx details */}
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
                {[
                  { label:"TX Hash",   value: txHash.slice(0,22) + "…" },
                  { label:"Token",     value: token },
                  { label:"Bloque",    value: `#${blockNum.toLocaleString()}` },
                  { label:"Estado",    value: "Confirmado ✓" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.3)", fontFamily:"'Geist','Inter',sans-serif" }}>{label}</span>
                    <span style={{ fontSize:12, color: label==="Estado" ? "#4EDEA3" : "rgba(240,234,214,0.65)", fontFamily:"monospace" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* disclaimer */}
              <div style={{ padding:"10px 12px", borderRadius:8, background:"rgba(203,162,74,0.06)", border:"1px solid rgba(203,162,74,0.18)", marginBottom:20 }}>
                <span style={{ fontSize:11.5, color:"rgba(203,162,74,0.7)", fontFamily:"'Geist','Inter',sans-serif", lineHeight:1.5 }}>
                  ⚠️ Esta es una <strong style={{ color:"#CBA24A" }}>simulación MVP</strong>. Ninguna transacción real fue procesada ni se cargó ningún pago.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width:"100%", padding:"13px", borderRadius:8,
                  background:"linear-gradient(135deg, #CBA24A, #A8843A)",
                  border:"none", color:"#0e0d0c", fontFamily:"'Geist','Inter',sans-serif",
                  fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em",
                }}
              >
                Volver a la galería
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
