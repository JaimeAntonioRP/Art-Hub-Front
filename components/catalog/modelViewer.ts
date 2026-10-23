"use client";

/** Versión fija del visor 3D: nunca «la última» de un CDN. */
const MODEL_VIEWER_SRC = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
const SCRIPT_ID = "model-viewer-script";

/* <model-viewer> es un web component; lo tipamos como componente React */
export const ModelViewer = "model-viewer" as unknown as React.FC<
  React.HTMLAttributes<HTMLElement> & Record<string, unknown> & { ref?: React.Ref<HTMLElement> }
>;

/** Lo que usamos del elemento <model-viewer>. */
export type ModelViewerElement = HTMLElement & {
  canActivateAR: boolean;
  activateAR: () => Promise<void>;
};

let loading: Promise<void> | null = null;

/** Carga el script del visor una sola vez, y solo cuando hace falta. */
export function loadModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing ?? Object.assign(document.createElement("script"), { id: SCRIPT_ID, type: "module", src: MODEL_VIEWER_SRC });
    script.addEventListener("error", () => { loading = null; reject(new Error("No se pudo cargar el visor 3D")); }, { once: true });
    if (!existing) document.head.appendChild(script);
    customElements.whenDefined("model-viewer").then(() => resolve());
  });
  return loading;
}
