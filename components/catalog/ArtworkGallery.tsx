"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArtworkDetail } from "@/lib/api";

/* <model-viewer> es un web component; lo tipamos como componente React */
const ModelViewer = "model-viewer" as unknown as React.FC<
  React.HTMLAttributes<HTMLElement> & Record<string, unknown>
>;

/** Versión fija del visor 3D: nunca «la última» de un CDN. */
const MODEL_VIEWER_SRC = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";

const KIND_LABEL: Record<string, string> = {
  principal: "Vista principal",
  adicional: "Vista adicional",
  posterior: "Reverso",
  detalle: "Detalle",
  firma: "Firma",
};

type Image = ArtworkDetail["images"][number];

/** Galería de la ficha (§13): imagen grande, miniaturas, pantalla completa y vista 3D/AR. */
export function ArtworkGallery({ title, images, modelUrl }: { title: string; images: Image[]; modelUrl: string | null }) {
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex((i) => i.is_primary)));
  const [show3d, setShow3d] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = images[index];
  const count = images.length;

  const step = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  // Flechas del teclado dentro de la pantalla completa (Esc ya lo resuelve <dialog>).
  useEffect(() => {
    const el = dialog.current;
    if (!el || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [count, step]);

  const alt = (img: Image) => (img.is_primary ? title : `${title} · ${KIND_LABEL[img.kind] ?? "Vista"}`);

  return (
    <div className="art-gallery">
      <div className="art-stage">
        {show3d && modelUrl ? (
          <Model3D src={modelUrl} title={title} poster={images[0]?.url} />
        ) : current ? (
          <button type="button" className="art-stage-btn" onClick={() => dialog.current?.showModal()} aria-label="Ver en pantalla completa">
            <img src={current.url} alt={alt(current)} />
            <span className="art-zoom" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              Ampliar
            </span>
          </button>
        ) : (
          <div className="art-stage-empty">Imagen no disponible</div>
        )}
      </div>

      {count > 1 || modelUrl ? (
        <ul className="art-thumbs" aria-label="Vistas de la obra">
          {images.map((img, i) => (
            <li key={img.id}>
              <button type="button" aria-pressed={!show3d && i === index} onClick={() => { setIndex(i); setShow3d(false); }}>
                <img src={img.url} alt={KIND_LABEL[img.kind] ?? "Vista"} loading="lazy" />
              </button>
            </li>
          ))}
          {modelUrl ? (
            <li>
              <button type="button" className="art-thumb-3d" aria-pressed={show3d} onClick={() => setShow3d(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
                3D / AR
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      {current ? (
        <dialog ref={dialog} className="art-lightbox" aria-label={`${title} en pantalla completa`}
          onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
          <img src={current.url} alt={alt(current)} />
          <form method="dialog">
            <button className="art-lb-close" aria-label="Cerrar">×</button>
          </form>
          {count > 1 ? (
            <>
              <button type="button" className="art-lb-nav is-prev" onClick={() => step(-1)} aria-label="Vista anterior">‹</button>
              <button type="button" className="art-lb-nav is-next" onClick={() => step(1)} aria-label="Vista siguiente">›</button>
              <p className="art-lb-count">{index + 1} / {count} · {KIND_LABEL[current.kind] ?? "Vista"}</p>
            </>
          ) : null}
        </dialog>
      ) : null}
    </div>
  );
}

/** Visor 3D: carga el script solo cuando se pide y comprueba que el modelo exista. */
function Model3D({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const [ready, setReady] = useState(false);
  const [modelOk, setModelOk] = useState<boolean | null>(null);

  useEffect(() => {
    const ID = "model-viewer-script";
    const existing = document.getElementById(ID) as HTMLScriptElement | null;
    if (existing) {
      if (customElements.get("model-viewer")) setReady(true);
      else existing.addEventListener("load", () => setReady(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = ID;
    s.type = "module";
    s.src = MODEL_VIEWER_SRC;
    s.onload = () => setReady(true);
    s.onerror = () => setModelOk(false);
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    fetch(src, { method: "HEAD" })
      .then((r) => setModelOk(r.ok && !(r.headers.get("content-type") ?? "").includes("text/html")))
      .catch(() => setModelOk(false));
  }, [src]);

  if (modelOk === false) {
    return <div className="art-stage-empty">El modelo 3D de esta obra aún no está disponible.</div>;
  }
  if (!ready || modelOk === null) {
    return <div className="art-stage-empty">Cargando visor 3D…</div>;
  }
  return (
    <ModelViewer
      src={src}
      alt={`Modelo 3D de ${title}`}
      poster={poster}
      camera-controls=""
      auto-rotate=""
      ar=""
      ar-modes="webxr scene-viewer quick-look"
      shadow-intensity="1"
      className="art-model"
    />
  );
}
