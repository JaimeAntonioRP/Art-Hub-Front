"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* actual video — fills container */}
      <video
        ref={videoRef}
        src="/videos/como-funciona.mp4"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v) setProgress(v.currentTime / (v.duration || 1));
        }}
        onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
        onEnded={() => setPlaying(false)}
        playsInline
      />

      {/* click overlay to play/pause */}
      <div
        onClick={toggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position:"absolute", inset:0, cursor:"pointer" }}
      />

      {/* play/pause button — fades out while playing unless hovered */}
      <span
        className="play"
        onClick={toggle}
        style={{
          cursor: "pointer",
          opacity: playing && !hovered ? 0 : 1,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        {playing ? (
          /* pause icon */
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <rect x="5" y="4" width="4" height="16" rx="1"/>
            <rect x="15" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          /* play icon */
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M8 5 v14 l11 -7 z"/>
          </svg>
        )}
      </span>

      {/* bottom bar: caption + progress */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "28px 16px 14px",
        background: "linear-gradient(to top, rgba(10,8,5,0.85), transparent)",
        display: "flex", flexDirection: "column", gap: 8,
        opacity: playing && !hovered ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}>
        {/* progress bar */}
        <div
          style={{ width:"100%", height:3, background:"rgba(237,227,204,0.2)", borderRadius:99, cursor:"pointer", overflow:"hidden" }}
          onClick={(e) => {
            const v = videoRef.current;
            if (!v) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            v.currentTime = pct * v.duration;
          }}
        >
          <div style={{ height:"100%", width:`${progress * 100}%`, background:"#CBA24A", borderRadius:99, transition:"width 0.1s linear" }} />
        </div>

        {/* caption + time */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span className="cap" style={{ position:"static", background:"none", padding:0, color:"rgba(237,227,204,0.75)", fontSize:12 }}>
            Cómo funciona Arthub
          </span>
          <span style={{ fontSize:11, color:"rgba(237,227,204,0.5)", fontFamily:"'Geist','Inter',sans-serif", fontVariantNumeric:"tabular-nums" }}>
            {fmt(videoRef.current?.currentTime ?? 0)} / {duration ? fmt(duration) : "--:--"}
          </span>
        </div>
      </div>
    </>
  );
}

/* portal: mounts inside .cf-hero .video */
export default function ComoFuncionaVideo() {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    const el = document.querySelector(".cf-hero .video");
    if (el) setTarget(el);
  }, []);

  if (!target) return null;
  return createPortal(<VideoPlayer />, target);
}
