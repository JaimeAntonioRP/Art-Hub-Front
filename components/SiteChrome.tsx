"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { isInternal, type NavLink, type SiteData } from "@/lib/content";

/**
 * Encabezado y pie del sitio público. Todo el contenido viene de los Ajustes del
 * sitio del panel (GET /api/site). El sitio es para vender: sin cuenta de usuario
 * en el encabezado; el acceso de los artistas está en el pie.
 */
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

function Brand({ logoSize = 44 }: { logoSize?: number }) {
  const { brand } = useSite();
  const [imgError, setImgError] = useState(false);
  return (
    <Link className="brand" href="/" aria-label={brand.name}>
      {!imgError ? (
        <img
          src={brand.logo_url || "/logifinal.png"}
          alt=""
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

/** Logo de respaldo si la imagen configurada no carga. */
function Logo({ size = 44 }: { size?: number }) {
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

export function SiteHeader({ site }: { site: SiteData }) {
  return (
    <SiteContext.Provider value={site}>
      <HeaderContent />
    </SiteContext.Provider>
  );
}

function HeaderContent() {
  const { header_menu, header_cta } = useSite();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú al cambiar de página y bloquea el scroll mientras está abierto.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (url: string) => url !== "/" && (pathname === url || pathname.startsWith(`${url}/`));

  return (
    <>
      {/* sticky con estilo en línea para que ninguna hoja lo pise */}
      <div style={{ position: "sticky", top: 0, zIndex: 200 }}>
        <header className="site-header">
          <div className="wrap row">
            <Brand />
            <nav className="nav-links" aria-label="Principal">
              {header_menu.map((n) => (
                <MenuLink key={n.label + n.url} link={n} className={isActive(n.url) ? "active" : ""} />
              ))}
            </nav>
            <div className="nav-aside">
              {header_cta ? (
                <MenuLink link={header_cta} className="btn btn-gold header-cta" />
              ) : null}
              <button
                className={`hamburger${menuOpen ? " open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
                type="button"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </header>
      </div>

      <div className={`mobile-nav${menuOpen ? " open" : ""}`} style={{ zIndex: 998 }}>
        <div className="mnav-header">
          <Brand logoSize={36} />
          <button type="button" className="mnav-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="mnav-links" aria-label="Principal">
          {header_menu.map((n) => (
            <MenuLink key={n.label + n.url} link={n} className={isActive(n.url) ? "active" : ""} onClick={() => setMenuOpen(false)} />
          ))}
        </nav>
        {header_cta ? (
          <div className="mnav-footer">
            <MenuLink link={header_cta} className="btn btn-gold btn-lg mnav-cta" onClick={() => setMenuOpen(false)} />
          </div>
        ) : null}
      </div>
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
              <Brand logoSize={40} />
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
