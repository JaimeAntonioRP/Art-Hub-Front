"use client";

import { useEffect, useRef, useState } from "react";
import { loadModelViewer, ModelViewer, type ModelViewerElement } from "./modelViewer";

type Props = {
  modelUrl: string;
  qrUrl: string | null;
  title: string;
  poster: string | null;
  size: string | null;
  /** Abre el panel al cargar (la ficha llega con ?ar=1 desde el QR). */
  autoOpen?: boolean;
};

/**
 * «Ver en mi pared» (§27). En un celular compatible abre la cámara con la obra colgada a
 * tamaño real (WebXR, Scene Viewer o Quick Look). En los demás muestra el modelo 3D y un QR
 * para seguir en el celular.
 */
export function WallView({ modelUrl, qrUrl, title, poster, size, autoOpen = false }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [canAr, setCanAr] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [onPhone, setOnPhone] = useState(false);

  function show() {
    setOnPhone(window.matchMedia("(pointer: coarse)").matches);
    setOpen(true);
    dialog.current?.showModal();
    loadModelViewer().then(() => setReady(true), () => setFailed(true));
  }

  useEffect(() => {
    if (autoOpen) show();
  }, [autoOpen]);

  // Cuando el visor está listo, pregunta si el dispositivo puede abrir la cámara en modo AR.
  useEffect(() => {
    const el = viewer.current;
    if (!ready || !el) return;
    const check = () => setCanAr(Boolean(el.canActivateAR));
    const onError = () => setFailed(true);
    el.addEventListener("load", check);
    el.addEventListener("error", onError);
    check();
    return () => {
      el.removeEventListener("load", check);
      el.removeEventListener("error", onError);
    };
  }, [ready]);

  return (
    <>
      <button type="button" className="btn btn-outline-dark btn-lg wall-btn" onClick={show}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="11" rx="1" /><path d="M3 20h18M12 15v5" /></svg>
        Ver en mi pared
      </button>

      <dialog ref={dialog} className="wall-dialog" aria-label={`Ver «${title}» en tu pared`}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
        <div className="wall-panel">
          <header>
            <div>
              <p className="eyebrow">Realidad aumentada</p>
              <h2>Ver en mi pared</h2>
              {size ? <p className="wall-size">Medidas registradas: {size}</p> : null}
            </div>
            <form method="dialog"><button className="wall-close" aria-label="Cerrar">×</button></form>
          </header>

          <div className="wall-stage">
            {open && ready && !failed ? (
              <ModelViewer
                ref={viewer}
                src={modelUrl}
                alt={`Modelo a escala de ${title}`}
                poster={poster ?? undefined}
                loading="eager"
                camera-controls=""
                camera-orbit="0deg 80deg auto"
                shadow-intensity="1"
                ar=""
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="wall"
                ar-scale="fixed"
                className="wall-model"
              />
            ) : (
              <p className="wall-msg">{failed ? "No pudimos cargar el modelo. Intenta de nuevo en unos minutos." : "Preparando el modelo…"}</p>
            )}
          </div>

          {canAr ? (
            <div className="wall-actions">
              <button type="button" className="btn btn-gold btn-lg" onClick={() => viewer.current?.activateAR()}>
                Abrir la cámara
              </button>
              <p>Apunta a una pared despejada y mueve el celular despacio hasta que aparezca la obra.</p>
            </div>
          ) : (canAr === false || failed) && onPhone ? (
            <div className="wall-fallback">
              <div>
                <strong>Este navegador no permite verla en tu pared</strong>
                <p>Abre esta página en Chrome (Android) o en Safari (iPhone con iOS 16 o más reciente). Mientras tanto, gira el modelo para ver la obra a escala.</p>
              </div>
            </div>
          ) : canAr === false || failed ? (
            <div className="wall-fallback">
              {qrUrl ? <img src={qrUrl} alt="Código QR para abrir esta obra en el celular" width={132} height={132} /> : null}
              <div>
                <strong>Míralo en tu pared desde el celular</strong>
                <p>Escanea el código con la cámara de tu teléfono. Funciona en Android con Chrome y en iPhone con Safari (iOS 16 o más reciente).</p>
                <p className="wall-hint">Mientras tanto, gira el modelo para ver la obra a escala.</p>
              </div>
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
