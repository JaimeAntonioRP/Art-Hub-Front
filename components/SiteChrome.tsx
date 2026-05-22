"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type SiteSettings } from "@/lib/api";

const NAV = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Obras", href: "/obras" },
  { label: "Verificar", href: "/verificar" },
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Tecnología", href: "/tecnologia" },
  { label: "Artistas", href: "/artistas" },
  { label: "Inversionistas", href: "/inversionistas" },
  { label: "Nosotros", href: "/nosotros" },
];

/* caché a nivel de módulo para no re-pedir settings en cada render */
let settingsCache: SiteSettings | null = null;
let settingsPromise: Promise<SiteSettings> | null = null;

/** Llama a esto después de guardar settings en admin para forzar re-fetch */
export function clearSettingsCache() {
  settingsCache = null;
  settingsPromise = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("arthub:settings-updated"));
  }
}

function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(settingsCache ?? {});

  const fetchFresh = () => {
    settingsPromise = api.getSettings().catch(() => ({}));
    settingsPromise.then((s) => {
      settingsCache = s;
      setSettings(s);
    });
  };

  useEffect(() => {
    if (!settingsCache) fetchFresh();
    const handler = () => fetchFresh();
    window.addEventListener("arthub:settings-updated", handler);
    return () => window.removeEventListener("arthub:settings-updated", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return settings;
}

function Brand({ logoSize = 48 }: { logoSize?: number }) {
  const { brand_name, brand_tagline, logo_url } = useSiteSettings();
  const [imgError, setImgError] = useState(false);
  return (
    <Link className="brand" href="/" aria-label={brand_name || "Arthub"}>
      {!imgError ? (
        <img
          src={logo_url || "/logifinal.png"}
          alt={brand_name || "Arthub"}
          style={{ height: logoSize, width: "auto", maxWidth: logoSize * 2.6, objectFit: "contain" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <Logo size={logoSize} />
      )}
      <span className="wm">
        <span className="name">{brand_name || "ARTHUB"}</span>
        <span className="tag">{brand_tagline || "Arte · Tecnología · Confianza"}</span>
      </span>
    </Link>
  );
}

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <line x1="32" y1="2" x2="32" y2="6" />
        <line x1="22" y1="4" x2="23.5" y2="8" />
        <line x1="42" y1="4" x2="40.5" y2="8" />
        <line x1="14" y1="10" x2="17" y2="13" />
        <line x1="50" y1="10" x2="47" y2="13" />
      </g>
      <circle cx="32" cy="14" r="3.4" fill="currentColor" />
      <path d="M14 60 V36 a18 18 0 0 1 36 0 V60" stroke="currentColor" strokeWidth="2.4" fill="none" />
      <path d="M22 60 V38 a10 10 0 0 1 20 0 V60" stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.55" />
      <g stroke="currentColor" strokeWidth="2.2" fill="none">
        <line x1="6" y1="60" x2="58" y2="60" />
        <line x1="2" y1="62" x2="62" y2="62" />
      </g>
    </svg>
  );
}

/* ── User dropdown menu ─────────────────────────────────────────────────── */
function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const firstName = user.name.split(" ")[0];
  const isAdmin = user.role === "admin";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: open ? "var(--paper-2, #F0E8D8)" : "transparent",
          border: "1px solid var(--rule, #D9CFBE)",
          borderRadius: 40,
          padding: "5px 12px 5px 6px",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          color: "var(--ink, #0D1B2A)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper-2, #F0E8D8)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {/* avatar circle */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isAdmin ? "var(--oro-cusco, #CBA24A)" : "var(--quenua, #5E8C5A)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Geist','Inter',sans-serif",
            flexShrink: 0,
            letterSpacing: "0.03em",
          }}
        >
          {initials}
        </span>

        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Geist','Inter',sans-serif" }}>
          {firstName}
        </span>

        {isAdmin && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--oro-cusco, #CBA24A)",
              fontFamily: "'Geist','Inter',sans-serif",
              background: "rgba(203,162,74,0.1)",
              border: "1px solid rgba(203,162,74,0.3)",
              borderRadius: 10,
              padding: "2px 6px",
            }}
          >
            Admin
          </span>
        )}

        {/* chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--ink-soft)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "var(--paper-card, #FDFAF5)",
            border: "1px solid var(--rule, #D9CFBE)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 999,
            animation: "dropdown-in 0.15s ease",
          }}
        >
          <style>{`@keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>

          {/* user info header */}
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid var(--rule)",
              background: "var(--paper-2, #F5EDD8)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "'Geist','Inter',sans-serif" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2, fontFamily: "'Geist','Inter',sans-serif" }}>
              {user.email ?? (isAdmin ? "Administrador" : "Inversionista")}
            </div>
          </div>

          {/* menu items */}
          <div style={{ padding: "6px 0" }}>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 16px",
                  fontSize: 13,
                  color: "var(--ink)",
                  textDecoration: "none",
                  fontFamily: "'Geist','Inter',sans-serif",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--paper-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco,#CBA24A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Panel de administración
              </Link>
            )}

            <Link
              href="/obras"
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 16px",
                fontSize: 13,
                color: "var(--ink)",
                textDecoration: "none",
                fontFamily: "'Geist','Inter',sans-serif",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--paper-2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              Mis obras
            </Link>

            <div style={{ height: 1, background: "var(--rule)", margin: "6px 0" }} />

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 16px",
                fontSize: 13,
                color: "#C0392B",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Geist','Inter',sans-serif",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF0EE"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <div className="utility">
        <div className="wrap row">
          <div>Cusco · Lima · Miami · Zürich</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>Próxima cohorte · 14 Jun 2026</span>
            <Link href="/ventanas">↩ Volver al índice</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap row">
          <Brand logoSize={48} />
          <nav className="nav-links">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={pathname === n.href ? "active" : ""}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="nav-aside">
            <a className="lang" href="#" title="Idioma">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12 H22" />
                <path d="M12 2 a16 16 0 0 1 0 20 a16 16 0 0 1 0 -20" />
              </svg>
              ES <span style={{ opacity: 0.6 }}>▾</span>
            </a>

            <UserMenuOrButtons />
          </div>
        </div>
      </header>
    </>
  );
}

function UserMenuOrButtons() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) return <UserMenu />;

  return (
    <>
      <Link className="btn btn-outline-dark" href="/login">
        Iniciar sesión
      </Link>
      <Link className="btn btn-gold" href="/registro">
        Crear cuenta
      </Link>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="grid">
          <div>
            <Brand logoSize={44} />
            <p className="about">
              Plataforma global que certifica, protege y conecta el arte
              cusqueño con el mundo a través de tecnología.
            </p>
          </div>
          <div>
            <h5>Navegación</h5>
            <ul>
              <li><Link href="/catalogo">Catálogo</Link></li>
              <li><Link href="/como-funciona">Cómo funciona</Link></li>
              <li><Link href="/tecnologia">Tecnología</Link></li>
              <li><Link href="/artistas">Artistas</Link></li>
              <li><Link href="/inversionistas">Inversionistas</Link></li>
              <li><Link href="/nosotros">Nosotros</Link></li>
            </ul>
          </div>
          <div>
            <h5>Ayuda</h5>
            <ul>
              <li><a href="#">Preguntas frecuentes</a></li>
              <li><a href="#">Atención al cliente</a></li>
              <li><a href="#">Verificar obra</a></li>
              <li><a href="#">Métodos de pago</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Términos y condiciones</a></li>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Política de cookies</a></li>
              <li><a href="#">Cumplimiento KYC / AML</a></li>
            </ul>
          </div>
          <div>
            <h5>Contacto</h5>
            <ul>
              <li><a href="mailto:info@arthub.pe">info@arthub.pe</a></li>
              <li>+51 84 000 000</li>
              <li>Cusco, Perú</li>
              <li><a href="#">Mesa privada (Zürich)</a></li>
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>© 2026 Arthub S.A.C. · Todos los derechos reservados.</span>
          <div className="socials">
            <a href="#" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10 v8" /><path d="M8 7 v.01" /><path d="M12 18 v-5 a3 3 0 0 1 6 0 v5" /><path d="M12 10 v8" /></svg></a>
            <a href="#" aria-label="YouTube"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="6" width="20" height="12" rx="3" /><path d="M10 9 L15 12 L10 15 Z" fill="currentColor" /></svg></a>
            <a href="#" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
