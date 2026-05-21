"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Artwork } from "@/lib/api";
import VerifyModal from "@/components/VerifyModal";
import { fieldStyle, inputStyle, labelStyle } from "@/components/AuthCard";

export default function VerificarPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artworkId, setArtworkId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listArtworks().then(setArtworks).catch(() => {});
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
    setFile(null);
    setPreview(null);
    setArtworkId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <VerifyModal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} autoStart />

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          {/* formulario */}
          <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: 12, padding: 32, height: "fit-content" }}>
            <div className="eyebrow">Validación biométrica</div>
            <h1 className="serif" style={{ fontSize: 30, margin: "6px 0 8px" }}>Verificar autenticidad</h1>
            <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
              Selecciona la obra y sube la fotografía o código QR de su certificado.
            </p>

            <form onSubmit={onSubmit} noValidate>
              <div style={fieldStyle}>
                <label style={labelStyle}>Obra a verificar</label>
                <select
                  style={inputStyle}
                  required
                  value={artworkId}
                  onChange={e => setArtworkId(e.target.value)}
                >
                  <option value="">— Selecciona una obra —</option>
                  {artworks.map(a => (
                    <option key={a.id} value={a.id}>{a.title} — {a.artist_name}</option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Imagen / QR del certificado</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFile}
                  style={{ ...inputStyle, padding: 8, background: "var(--paper-2)" }}
                />
              </div>

              {preview && (
                <div style={{ marginBottom: 18 }}>
                  <img
                    src={preview}
                    alt="vista previa"
                    style={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 8, border: "1px solid var(--rule)", background: "var(--paper-2)" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={!file || !artworkId}
                  className="btn btn-gold btn-lg"
                  style={{ flex: 1, opacity: !file || !artworkId ? 0.55 : 1 }}
                >
                  Verificar
                </button>
                {file && (
                  <button type="button" onClick={reset} className="btn btn-outline-dark btn-lg">
                    Limpiar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* panel derecho — instrucciones */}
          <div>
            <div className="eyebrow">¿Cómo funciona?</div>
            <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>Proceso de autenticación</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { n: "01", t: "Selecciona la obra", d: "Elige del catálogo la obra que deseas verificar." },
                { n: "02", t: "Sube el certificado", d: "Fotografía la obra o sube el código QR de su certificado." },
                { n: "03", t: "Análisis biométrico", d: "El sistema analiza la imagen y compara con el registro original." },
                { n: "04", t: "Resultado inmediato", d: "Obtienes el porcentaje de coincidencia y el estado del certificado." },
              ].map(({ n, t, d }) => (
                <div key={n} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 18px", background: "#fff", border: "1px solid var(--rule)", borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "var(--oro-cusco)", minWidth: 28, lineHeight: 1 }}>{n}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 3 }}>{t}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
