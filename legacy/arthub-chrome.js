/* Arthub — shared chrome (nav + footer)
   Each page calls renderChrome("inicio") with the current section id. */

const LOGO_SVG = `
<svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none">
    <line x1="32" y1="2"  x2="32" y2="6" />
    <line x1="22" y1="4"  x2="23.5" y2="8" />
    <line x1="42" y1="4"  x2="40.5" y2="8" />
    <line x1="14" y1="10" x2="17" y2="13" />
    <line x1="50" y1="10" x2="47" y2="13" />
  </g>
  <circle cx="32" cy="14" r="3.4" fill="currentColor" />
  <path d="M14 60 V36 a18 18 0 0 1 36 0 V60" stroke="currentColor" stroke-width="2.4" fill="none" />
  <path d="M22 60 V38 a10 10 0 0 1 20 0 V60" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.55" />
  <g stroke="currentColor" stroke-width="2.2" fill="none">
    <line x1="6"  y1="60" x2="58" y2="60" />
    <line x1="2"  y1="62" x2="62" y2="62" />
  </g>
</svg>`;

const NAV = [
  { id: 'catalogo',     label: 'Catálogo',       href: 'Arthub - Catalogo.html' },
  { id: 'como',         label: 'Cómo funciona',  href: 'Arthub - Como Funciona.html' },
  { id: 'tecnologia',   label: 'Tecnología',     href: 'Arthub - Tecnologia.html' },
  { id: 'artistas',     label: 'Artistas',       href: 'Arthub - Artistas.html' },
  { id: 'inversionistas', label: 'Inversionistas', href: 'Arthub - Inversionistas.html' },
  { id: 'nosotros',     label: 'Nosotros',       href: 'Arthub - Nosotros.html' },
];

function renderChrome(activeId) {
  // Top utility strip
  const utility = `
    <div class="utility">
      <div class="wrap row">
        <div>Cusco · Lima · Miami · Zürich</div>
        <div style="display:flex; gap:24px;">
          <span>Próxima cohorte · 14 Jun 2026</span>
          <a href="Arthub Index.html">↩ Volver al índice</a>
        </div>
      </div>
    </div>`;

  // Header
  const linksHtml = NAV.map(n => `
    <a href="${n.href}" class="${activeId === n.id ? 'active' : ''}">${n.label}</a>
  `).join('');

  const header = `
    <header class="site-header">
      <div class="wrap row">
        <a class="brand" href="Arthub - Inicio.html" aria-label="Arthub">
          ${LOGO_SVG.replace('width="44" height="44"', 'width="48" height="48"')}
          <span class="wm">
            <span class="name">ARTHUB</span>
            <span class="tag">Arte · Tecnología · Confianza</span>
          </span>
        </a>
        <nav class="nav-links">${linksHtml}</nav>
        <div class="nav-aside">
          <a class="lang" href="#" title="Idioma">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><path d="M2 12 H22"/><path d="M12 2 a16 16 0 0 1 0 20 a16 16 0 0 1 0 -20"/>
            </svg>
            ES <span style="opacity:.6;">▾</span>
          </a>
          <a class="btn btn-outline-light" href="#" style="border-color:rgba(237,227,204,0.35);">Iniciar sesión</a>
          <a class="btn btn-gold" href="#">Crear cuenta</a>
        </div>
      </div>
    </header>`;

  // Footer
  const footer = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="grid">
          <div>
            <a class="brand" href="Arthub - Inicio.html" style="margin-bottom:8px;">
              ${LOGO_SVG.replace('width="44" height="44"', 'width="44" height="44"')}
              <span class="wm">
                <span class="name">ARTHUB</span>
                <span class="tag">Arte · Tecnología · Confianza</span>
              </span>
            </a>
            <p class="about">Plataforma global que certifica, protege y conecta el arte cusqueño con el mundo a través de tecnología.</p>
          </div>
          <div>
            <h5>Navegación</h5>
            <ul>
              <li><a href="Arthub - Catalogo.html">Catálogo</a></li>
              <li><a href="Arthub - Como Funciona.html">Cómo funciona</a></li>
              <li><a href="Arthub - Tecnologia.html">Tecnología</a></li>
              <li><a href="Arthub - Artistas.html">Artistas</a></li>
              <li><a href="Arthub - Inversionistas.html">Inversionistas</a></li>
              <li><a href="Arthub - Nosotros.html">Nosotros</a></li>
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
        <div class="legal">
          <span>© 2026 Arthub S.A.C. · Todos los derechos reservados.</span>
          <div class="socials">
            <a href="#" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10 v8"/><path d="M8 7 v.01"/><path d="M12 18 v-5 a3 3 0 0 1 6 0 v5"/><path d="M12 10 v8"/></svg></a>
            <a href="#" aria-label="YouTube"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M10 9 L15 12 L10 15 Z" fill="currentColor"/></svg></a>
            <a href="#" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          </div>
        </div>
      </div>
    </footer>`;

  // Insert into placeholders
  const headerSlot = document.getElementById('site-header-slot');
  const footerSlot = document.getElementById('site-footer-slot');
  if (headerSlot) headerSlot.innerHTML = utility + header;
  if (footerSlot) footerSlot.innerHTML = footer;
}

/* Auto-init: read data-page from <body> */
document.addEventListener('DOMContentLoaded', () => {
  const id = document.body.dataset.page || '';
  renderChrome(id);
});
