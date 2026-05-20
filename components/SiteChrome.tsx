"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

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

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
          <Link className="brand" href="/" aria-label="Arthub">
            <Logo size={48} />
            <span className="wm">
              <span className="name">ARTHUB</span>
              <span className="tag">Arte · Tecnología · Confianza</span>
            </span>
          </Link>
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
            {loading ? null : user ? (
              <>
                {user.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="btn btn-outline-light"
                    style={{ borderColor: "rgba(237,227,204,0.35)" }}
                  >
                    Admin
                  </Link>
                ) : null}
                <span style={{ color: "var(--cream-on-dark)", fontSize: 13 }}>
                  Hola, {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-light"
                  style={{ borderColor: "rgba(237,227,204,0.35)" }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-outline-light"
                  href="/login"
                  style={{ borderColor: "rgba(237,227,204,0.35)" }}
                >
                  Iniciar sesión
                </Link>
                <Link className="btn btn-gold" href="/registro">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="grid">
          <div>
            <Link className="brand" href="/" style={{ marginBottom: 8 }}>
              <Logo size={44} />
              <span className="wm">
                <span className="name">ARTHUB</span>
                <span className="tag">Arte · Tecnología · Confianza</span>
              </span>
            </Link>
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
