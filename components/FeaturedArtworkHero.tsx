"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Artwork } from "@/lib/api";

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

export default function FeaturedArtworkHero() {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [view, setView] = useState<"image" | "3d">("image");
  const [scriptReady, setScriptReady] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* fetch artworks → pick one with 3D model */
  useEffect(() => {
    api.listArtworks().then((list) => {
      const featured =
        list.find((a) => a.model_3d_url && a.image_url) ??
        list.find((a) => a.image_url) ??
        list[0] ??
        null;
      setArtwork(featured);
    }).catch(() => {/* silent — fallback gradient shows */});
  }, []);

  /* load model-viewer script when switching to 3D */
  useEffect(() => {
    if (view !== "3d" || !artwork?.model_3d_url) return;
    const ID = "model-viewer-script";
    if (document.getElementById(ID)) { setScriptReady(true); return; }
    const s = document.createElement("script");
    s.id = ID;
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, [view, artwork?.model_3d_url]);

  const has3D = Boolean(artwork?.model_3d_url);

  /* ── inner content (shared between loading and loaded states) ── */
  const inner = !artwork ? (
    /* loading skeleton */
    <>
      <style>{`@keyframes featured-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(237,227,204,0.18)", borderTopColor:"rgba(203,162,74,0.7)", animation:"featured-spin 0.8s linear infinite" }} />
      </div>
      <span className="label">Vista actual</span>
      <span className="badge">
        <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 22 s8 -4 8 -10 V5 l-8 -3 -8 3 v7 c0 6 8 10 8 10 z"/><path d="M9 12 l2 2 l4 -4"/>
        </svg>
        <span className="t">Activo Cultural Validado<b>Autenticidad · Propiedad · Logística</b></span>
      </span>
    </>
  ) : (
    <>
      <style>{`@keyframes featured-fade{from{opacity:0}to{opacity:1}} @keyframes featured-spin{to{transform:rotate(360deg)}}`}</style>

      {/* image */}
      {view === "image" ? (
        <img
          src={artwork.image_url}
          alt={artwork.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", opacity: imgLoaded ? 1 : 0, transition:"opacity 0.5s ease", animation:"featured-fade 0.6s ease" }}
        />
      ) : scriptReady && artwork.model_3d_url ? (
        <ModelViewer
          src={artwork.model_3d_url}
          alt={`Modelo 3D de ${artwork.title}`}
          poster={artwork.image_url}
          camera-controls="" auto-rotate="" ar=""
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1" exposure="0.9"
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", background:"#15110c" }}
        />
      ) : (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#15110c" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(237,227,204,0.15)", borderTopColor:"#CBA24A", animation:"featured-spin 0.8s linear infinite" }} />
        </div>
      )}

      {/* title label top-left */}
      <span className="label" style={{ maxWidth:"calc(100% - 110px)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {artwork.title}
      </span>

      {/* 3D toggle top-right */}
      {has3D && (
        <button type="button" onClick={() => setView(view === "image" ? "3d" : "image")}
          style={{ position:"absolute", top:12, right:12, display:"inline-flex", alignItems:"center", gap:5,
            background: view === "3d" ? "rgba(203,162,74,0.25)" : "rgba(20,17,12,0.7)",
            backdropFilter:"blur(6px)",
            border:`1px solid ${view === "3d" ? "rgba(203,162,74,0.6)" : "rgba(237,227,204,0.25)"}`,
            borderRadius:4, color: view === "3d" ? "#CBA24A" : "#EDE3CC",
            fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase",
            padding:"6px 10px", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
          </svg>
          {view === "3d" ? "Ver imagen" : "Ver en 3D"}
        </button>
      )}

      {/* bottom: artist badge + ver obra */}
      <div style={{ position:"absolute", bottom:16, left:16, right:16, display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:10 }}>
        <span className="badge" style={{ position:"static", maxWidth:"70%" }}>
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 22 s8 -4 8 -10 V5 l-8 -3 -8 3 v7 c0 6 8 10 8 10 z"/><path d="M9 12 l2 2 l4 -4"/>
          </svg>
          <span className="t">
            {artwork.artist_name}
            <b>{formatPrice(artwork.price)}{artwork.technique ? ` · ${artwork.technique.split("·")[0].trim()}` : ""}</b>
          </span>
        </span>
        <Link href={`/obras/${artwork.id}`}
          style={{ display:"inline-flex", alignItems:"center", gap:5,
            background:"rgba(203,162,74,0.15)", backdropFilter:"blur(6px)",
            border:"1px solid rgba(203,162,74,0.45)", borderRadius:4,
            color:"#CBA24A", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
            padding:"7px 11px", textDecoration:"none", fontFamily:"'Inter',sans-serif",
            whiteSpace:"nowrap", flexShrink:0 }}>
          Ver obra →
        </Link>
      </div>
    </>
  );

  /* ── always wrap in .painting so CSS frame styles apply ── */
  return <div className="painting">{inner}</div>;
}
