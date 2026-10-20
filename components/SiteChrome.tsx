"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { PANEL_BASE } from "@/lib/api";
import { isInternal, type NavLink, type SiteData } from "@/lib/content";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  artista: "Artista",
  comprador: "Comprador",
};

/** Ajustes del sitio que llegan de la API (Ajustes del sitio en el panel). */
const SiteContext = createContext<SiteData | null>(null);

function useSite(): SiteData {
  const site = useContext(SiteContext);
  if (!site) throw new Error("SiteHeader/SiteFooter necesitan la prop site");
  return site;
}

/** Enlace del menú: <Link> para rutas del sitio, <a> para externos, mailto o tel. */
function MenuLink({ link, className, onClick }: { link: NavLink; className?: string; onClick?: () => void }) {
  return isInternal(link.url) ? (
    <Link href={link.url} className={className} onClick={onClick}>{link.label}</Link>
  ) : (
    <a href={link.url} className={className} onClick={onClick} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {link.label}
    </a>
  );
}

function Brand({ logoSize = 48 }: { logoSize?: number }) {
  const { brand } = useSite();
  const [imgError, setImgError] = useState(false);
  return (
    <Link className="brand" href="/" aria-label={brand.name}>
      {!imgError ? (
        <img
          src={brand.logo_url || "/logifinal.png"}
          alt={brand.name}
          style={{ height: logoSize, width: "auto", maxWidth: logoSize * 2.6, objectFit: "contain" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <Logo size={logoSize} />
      )}
      <span className="wm">
        <span className="name">{brand.name}</span>
        {brand.tagline ? <span className="tag">{brand.tagline}</span> : null}
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
          background: open ? "var(--paper-2)" : "transparent",
          border: "1px solid var(--rule)",
          borderRadius: 40,
          padding: "5px 12px 5px 6px",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          color: "var(--ink)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--paper-2)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {/* avatar circle */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isAdmin ? "var(--oro-cusco)" : "var(--quenua)",
            color: "var(--piedra-0)",
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
              color: "var(--accent-text)",
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
            background: "var(--paper-card)",
            border: "1px solid var(--rule)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(13,27,42,0.12)",
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
              background: "var(--paper-2)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "'Geist','Inter',sans-serif" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2, fontFamily: "'Geist','Inter',sans-serif" }}>
              {user.email ?? ROLE_LABEL[user.role]}
            </div>
          </div>

          {/* menu items */}
          <div style={{ padding: "6px 0" }}>
            {isAdmin && (
              <a
                href={`${PANEL_BASE}/admin`}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Panel de administración
              </a>
            )}

            {user.role === "artista" && user.artist_panel_url && (
              <a
                href={user.artist_panel_url}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--oro-cusco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
                </svg>
                Mi panel de artista
              </a>
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
                color: "var(--danger)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Geist','Inter',sans-serif",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--danger-bg)"; }}
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

export function SiteHeader({ site }: { site: SiteData }) {
  return (
    <SiteContext.Provider value={site}>
      <HeaderContent />
    </SiteContext.Provider>
  );
}

function HeaderContent() {
  const { utility, header_menu } = useSite();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleMobileLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* sticky wrapper — inline style so it can't be overridden by any CSS */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, willChange: "transform" }}>
        <div className="utility">
          <div className="wrap row">
            <div>{utility.text}</div>
            {utility.link_label && utility.link_url ? (
              <div style={{ display: "flex", gap: 24 }}>
                <MenuLink link={{ label: utility.link_label, url: utility.link_url }} />
              </div>
            ) : null}
          </div>
        </div>

        <header className="site-header" style={{ position: "relative", zIndex: "auto" }}>
        <div className="wrap row">
          <Brand logoSize={48} />
          <nav className="nav-links">
            {header_menu.map((n) => (
              <MenuLink key={n.label + n.url} link={n} className={pathname === n.url ? "active" : ""} />
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

            <span className="nav-auth-desktop" style={{ display: "contents" }}>
              <UserMenuOrButtons />
            </span>

            {/* hamburger — shown on mobile via CSS */}
            <button
              className={`hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              type="button"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
        </header>
      </div>{/* /sticky wrapper */}

      {/* ── Mobile full-screen nav ── */}
      <div className={`mobile-nav${menuOpen ? " open" : ""}`} style={{ zIndex: 998 }}>
        {/* sticky top bar with brand + close */}
        <div className="mnav-header">
          <Brand logoSize={36} />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            style={{
              background: "transparent",
              border: "1px solid var(--rule)",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--ink)",
            }}
            aria-label="Cerrar menú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* nav links */}
        <nav className="mnav-links">
          {header_menu.map((n) => (
            <MenuLink
              key={n.label + n.url}
              link={n}
              className={pathname === n.url ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>

        {/* auth section */}
        <div className="mnav-footer">
          {user ? (
            <>
              <div style={{
                padding: "12px 0",
                fontSize: 13,
                color: "var(--ink-soft)",
                fontFamily: "'Inter',sans-serif",
              }}>
                {user.name} · {ROLE_LABEL[user.role]}
              </div>
              {user.role === "admin" && (
                <a
                  href={`${PANEL_BASE}/admin`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "11px 16px", borderRadius: 8,
                    border: "1px solid var(--rule)",
                    fontSize: 14, fontWeight: 500,
                    color: "var(--ink)", textDecoration: "none",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  Panel de administración
                </a>
              )}
              {user.role === "artista" && user.artist_panel_url && (
                <a
                  href={user.artist_panel_url}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "11px 16px", borderRadius: 8,
                    border: "1px solid var(--rule)",
                    fontSize: 14, fontWeight: 500,
                    color: "var(--ink)", textDecoration: "none",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  Mi panel de artista
                </a>
              )}
              <button
                type="button"
                onClick={handleMobileLogout}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "11px 16px", borderRadius: 8,
                  border: "none", background: "var(--danger-bg)",
                  fontSize: 14, fontWeight: 500,
                  color: "var(--danger)", cursor: "pointer",
                  fontFamily: "'Inter',sans-serif",
                  width: "100%",
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "11px 16px", borderRadius: 8,
                  border: "1px solid var(--rule)",
                  fontSize: 14, fontWeight: 500,
                  color: "var(--ink)", textDecoration: "none",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "11px 16px", borderRadius: 8,
                  border: "1px solid var(--oro-cusco)",
                  background: "var(--oro-cusco)",
                  fontSize: 14, fontWeight: 600,
                  color: "var(--azul-900)", textDecoration: "none",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function UserMenuOrButtons() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) return <UserMenu />;

  return (
    <>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "7px 16px",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'Geist','Inter',sans-serif",
          border: "1px solid var(--rule)",
          borderRadius: 6,
          color: "var(--ink)",
          background: "transparent",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--paper-2)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "7px 16px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "'Geist','Inter',sans-serif",
          border: "1px solid var(--oro-cusco)",
          borderRadius: 6,
          color: "var(--azul-900)",
          background: "var(--oro-cusco)",
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
      >
        Crear cuenta
      </Link>
    </>
  );
}

export function SiteFooter({ site }: { site: SiteData }) {
  const { footer, contact, social_links } = site;
  const contactItems = [
    contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : null,
    contact.phone,
    contact.address,
  ].filter(Boolean);

  return (
    <SiteContext.Provider value={site}>
      <footer className="site-footer">
        <div className="wrap">
          <div className="grid">
            <div>
              <Brand logoSize={44} />
              {footer.about ? <p className="about">{footer.about}</p> : null}
            </div>
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h5>{column.title}</h5>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label + link.url}><MenuLink link={link} /></li>
                  ))}
                </ul>
              </div>
            ))}
            {contactItems.length ? (
              <div>
                <h5>Contacto</h5>
                <ul>
                  {contactItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="legal">
            <span>{footer.copyright}</span>
            {social_links.length ? (
              <div className="socials">
                {social_links.map((s) => (
                  <a key={s.network + s.url} href={s.url} target="_blank" rel="noreferrer" aria-label={SOCIAL_LABEL[s.network] ?? s.network}>
                    <SocialIcon network={s.network} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </footer>
    </SiteContext.Provider>
  );
}

const SOCIAL_LABEL: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube",
  linkedin: "LinkedIn", x: "X", whatsapp: "WhatsApp",
};

function SocialIcon({ network }: { network: string }) {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true };
  switch (network) {
    case "instagram":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>;
    case "linkedin":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10 v8" /><path d="M8 7 v.01" /><path d="M12 18 v-5 a3 3 0 0 1 6 0 v5" /><path d="M12 10 v8" /></svg>;
    case "youtube":
      return <svg {...common}><rect x="2" y="6" width="20" height="12" rx="3" /><path d="M10 9 L15 12 L10 15 Z" fill="currentColor" /></svg>;
    case "facebook":
      return <svg {...common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
    case "tiktok":
      return <svg {...common}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.5 2.5 4.5 5 5" /></svg>;
    case "whatsapp":
      return <svg {...common}><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a3.5 3.5 0 0 1-2-2l1-1-1-2z" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
  }
}
