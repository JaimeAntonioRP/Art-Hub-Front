"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { clearSettingsCache } from "@/components/SiteChrome";
import { errorBoxStyle, fieldStyle, inputStyle, labelStyle } from "@/components/AuthCard";

export default function AdminMarcaPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace("/login?redirect=/admin/marca");
      return;
    }
    if (user.role !== "admin") router.replace("/");
  }, [user, token, loading, router]);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setBrandName(s.brand_name ?? "");
        setBrandTagline(s.brand_tagline ?? "");
        setLogoUrl(s.logo_url ?? "");
      })
      .finally(() => setLoaded(true));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await api.updateSettings(token, {
        brand_name: brandName || null,
        brand_tagline: brandTagline || null,
        logo_url: logoUrl || null,
      });
      // invalida el caché y notifica a los componentes montados para re-fetch
      clearSettingsCache();
      setMessage("¡Marca actualizada! El logo y nombre en el encabezado se actualizaron.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Verificando sesión...</p>
        </div>
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Acceso restringido a administradores.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      {/* tabs */}
      <div className="wrap" style={{ marginBottom: 28, display: "flex", gap: 10 }}>
        <Link href="/admin" className="btn btn-outline-dark" style={{ padding: "9px 18px", fontSize: 13 }}>
          Obras
        </Link>
        <Link href="/admin/artistas" className="btn btn-outline-dark" style={{ padding: "9px 18px", fontSize: 13 }}>
          Artistas
        </Link>
        <Link href="/admin/marca" className="btn btn-gold" style={{ padding: "9px 18px", fontSize: 13 }}>
          Logo / Marca
        </Link>
      </div>

      <div className="wrap" style={{ maxWidth: 620 }}>
        <div style={{ background: "#fff", border: "1px solid var(--rule)", borderRadius: 12, padding: 28 }}>
          <div className="eyebrow">Identidad del sitio</div>
          <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>
            Logo y marca
          </h2>

          {error ? <div style={errorBoxStyle}>{error}</div> : null}
          {message ? (
            <div
              style={{
                background: "#EAF2E6",
                border: "1px solid #7A846B55",
                color: "#3D4A2E",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13.5,
                marginBottom: 18,
              }}
            >
              {message}
            </div>
          ) : null}

          {!loaded ? (
            <p className="muted">Cargando configuración...</p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div style={fieldStyle}>
                <label style={labelStyle}>Nombre de la marca</label>
                <input
                  style={inputStyle}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="ARTHUB"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Eslogan</label>
                <input
                  style={inputStyle}
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  placeholder="Arte · Tecnología · Confianza"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Logo (URL o ruta)</label>
                <input
                  style={{ ...inputStyle, fontSize: 13 }}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... · o ruta /logo.png"
                />
                {/* instrucciones para subir logo */}
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "#F5F0E8",
                    border: "1px solid #CBA24A55",
                    borderRadius: 8,
                    fontSize: 12,
                    lineHeight: 1.7,
                    color: "var(--ink)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    ¿Cómo poner mi logo?
                  </strong>
                  <strong>Opción 1 — Carpeta Vercel (recomendado, permanente):</strong><br />
                  Sube tu logo a la carpeta <code>public/</code> del proyecto frontend (ej. <code>public/logo.png</code>),
                  haz commit y push. Luego escribe <code>/logo.png</code> aquí.
                  <br /><br />
                  <strong>Opción 2 — URL externa:</strong><br />
                  Sube la imagen a{" "}
                  <a href="https://imgur.com" target="_blank" rel="noreferrer" style={{ color: "var(--oro-cusco)" }}>imgur.com</a>
                  {" "}o{" "}
                  <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: "var(--oro-cusco)" }}>Cloudinary</a>
                  {" "}y pega la URL directa (<code>https://...</code>).
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Recomendado: PNG/SVG horizontal con fondo transparente, 200–600 px de ancho.
                  Déjalo vacío para usar el logo por defecto.
                </p>
              </div>

              {/* vista previa */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid var(--rule)",
                  marginBottom: 18,
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="preview logo"
                    style={{ height: 44, width: "auto", maxWidth: 120, objectFit: "contain" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: "var(--oro-cusco)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#14110C",
                      fontFamily: "serif",
                      fontWeight: 700,
                    }}
                  >
                    A
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, letterSpacing: "0.08em" }}>
                    {brandName || "ARTHUB"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    {brandTagline || "Arte · Tecnología · Confianza"}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-gold btn-lg"
                style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Guardando..." : "Guardar marca"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
