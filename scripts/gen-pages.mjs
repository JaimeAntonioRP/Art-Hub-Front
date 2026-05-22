import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "legacy");
const OUT = resolve(__dirname, "..", "lib");
mkdirSync(OUT, { recursive: true });

function rewriteLinks(s) {
  return s
    .replaceAll('href="Arthub - Inicio.html"', 'href="/"')
    .replaceAll('href="Arthub - Catalogo.html"', 'href="/catalogo"')
    .replaceAll('href="Arthub - Como Funciona.html"', 'href="/como-funciona"')
    .replaceAll('href="Arthub - Artistas.html"', 'href="/artistas"')
    .replaceAll('href="Arthub - Tecnologia.html"', 'href="#"')
    .replaceAll('href="Arthub - Inversionistas.html"', 'href="#"')
    .replaceAll('href="Arthub - Nosotros.html"', 'href="#"')
    .replaceAll('href="Arthub Index.html"', 'href="/ventanas"')
    .replaceAll('href="Arthub Landing.html"', 'href="/landing"')
    // Rewrite Cloudflare email-protection hrefs (with or without #hash) to mailto
    .replace(
      /href="\/cdn-cgi\/l\/email-protection[^"]*"/g,
      'href="mailto:info@arthub.pe"'
    )
    // Replace the obfuscated link body "[email protected]" with the actual address
    .replace(/\[email(?:&#160;|\s+|&nbsp;)protected\]/g, "info@arthub.pe");
}

function extract(file) {
  const raw = readFileSync(resolve(ROOT, file), "utf8");
  const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/);
  const style = styleMatch ? styleMatch[1] : "";
  const bodyStart = raw.indexOf('<div id="site-header-slot"></div>');
  const bodyEnd = raw.indexOf('<div id="site-footer-slot"></div>');
  let body = raw.slice(
    bodyStart + '<div id="site-header-slot"></div>'.length,
    bodyEnd
  );
  return { style, body, raw };
}

// ---- Catalogo: pre-expand WORKS ----
function catalogoWorks() {
  const WORKS = [
    { t: "Camino al Qoricancha", a: "Augusto García Peñalva", d: "100 × 80 cm", p: 15000, bg: 1 },
    { t: "Mujeres del mercado", a: "Sabino Cusicanqui", d: "90 × 70 cm", p: 12000, bg: 6 },
    { t: "Atardecer en San Blas", a: "Marcos Chillitupa", d: "100 × 81 cm", p: 18500, bg: 8 },
    { t: "Danza de los Qhapaq Qolla", a: "Fortunato Ccopa", d: "120 × 100 cm", p: 16800, bg: 4 },
    { t: "Valle Sagrado", a: "Augusto García Peñalva", d: "100 × 80 cm", p: 14000, bg: 5 },
    { t: "Tejados de Cusco", a: "Marcos Chillitupa", d: "90 × 70 cm", p: 11500, bg: 3 },
    { t: "Retrato de Mama Cusqueña", a: "Sabino Cusicanqui", d: "80 × 60 cm", p: 10000, bg: 7 },
    { t: "Procesión del Corpus", a: "Fortunato Ccopa", d: "100 × 80 cm", p: 13200, bg: 2 },
  ];
  return WORKS.map(
    (w) => `
    <a class="work" href="#">
      <div class="work-img bg-paint-${w.bg}">
        <span class="stamp">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22 s8 -4 8 -10 V5 l-8 -3 -8 3 v7 c0 6 8 10 8 10 z"/><path d="M9 12 l2 2 l4 -4"/></svg>
          Obra certificada
        </span>
      </div>
      <div class="body">
        <div class="author">${w.a}</div>
        <h4>${w.t}</h4>
        <div class="meta">Óleo sobre lienzo · ${w.d}</div>
        <div class="price">USD ${w.p.toLocaleString("en-US")}</div>
        <div class="row-actions">
          <div class="icons">
            <button class="icon-btn" title="AR">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7 V5 a2 2 0 0 1 2 -2 H7"/><path d="M17 3 H19 a2 2 0 0 1 2 2 V7"/><path d="M21 17 V19 a2 2 0 0 1 -2 2 H17"/><path d="M7 21 H5 a2 2 0 0 1 -2 -2 V17"/><rect x="8" y="8" width="8" height="8"/></svg>
            </button>
            <button class="icon-btn" title="Guardar">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 21 L12 16 L5 21 V5 a2 2 0 0 1 2 -2 h10 a2 2 0 0 1 2 2 z"/></svg>
            </button>
          </div>
          <button class="icon-btn" style="border-color: var(--oro-cusco); color: var(--oro-cusco);" title="Ver">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12 H19"/><path d="M13 6 L19 12 L13 18"/></svg>
          </button>
        </div>
      </div>
    </a>`
  ).join("");
}

// ---- Artistas: pre-expand ARTISTS ----
function artistasRows() {
  const ARTISTS = [
    { name: "Augusto García Peñalva", sub: "Maestro internacional", cat: "Maestro internacional", catC: "chip-gold", tec: "Óleo sobre lienzo", score: 96, stars: 5, val: "Reconocimiento cultural, exposiciones internacionales, documentación completa", pot: "Alto valor", potSub: "Premium", potC: "var(--quenua)", status: "certif", initials: "AG" },
    { name: "Sabino Cusicanqui", sub: "Maestro tradicional", cat: "Maestro tradicional", catC: "chip-tierra", tec: "Óleo sobre lienzo", score: 91, stars: 5, val: "Trayectoria artística regional, reconocimiento cultural, documentación verificada", pot: "Alto potencial", potSub: "Alto", potC: "var(--quenua)", status: "certif", initials: "SC" },
    { name: "Marcos Chillitupa", sub: "Pintor contemporáneo", cat: "Contemporáneo cusqueño", catC: "chip-quenua", tec: "Óleo sobre lienzo", score: 88, stars: 4.5, val: "Exhibiciones colectivas, documentación artística, respaldo galerístico", pot: "Alto potencial", potSub: "Alto", potC: "var(--quenua)", status: "certif", initials: "MC" },
    { name: "Fortunato Ccopa", sub: "Arte costumbrista", cat: "Costumbrista andino", catC: "chip-azul", tec: "Óleo sobre lienzo", score: 85, stars: 4.5, val: "Producción cultural documentada, trayectoria comprobada", pot: "Colección patrimonial", potSub: "Alto", potC: "var(--azul-altura)", status: "certif", initials: "FC" },
    { name: "Cecilia Guzmán", sub: "Realismo andino", cat: "Realismo contemporáneo", catC: "chip-terracota", tec: "Acrílico sobre lienzo", score: 78, stars: 4, val: "Trayectoria artística, documentación parcial", pot: "Inversión media", potSub: "Media", potC: "var(--terracota)", status: "validacion", initials: "CG" },
    { name: "Edgar Abarca", sub: "Paisajismo andino", cat: "Paisajismo", catC: "chip-quenua", tec: "Óleo sobre lienzo", score: 72, stars: 3.5, val: "Documentación en proceso, obras en análisis", pot: "Emergente", potSub: "Media", potC: "var(--terracota)", status: "validacion", initials: "EA" },
    { name: "Yovana Mamani", sub: "Arte contemporáneo", cat: "Arte contemporáneo", catC: "chip-azul", tec: "Técnica mixta sobre lienzo", score: 68, stars: 3.5, val: "Artista emergente, potencial identificado", pot: "Emergente", potSub: "Bajo – Medio", potC: "var(--tierra)", status: "revision", initials: "YM" },
    { name: "Otros maestros", sub: "Diversas técnicas", cat: "Diversas técnicas", catC: "chip", tec: "Varias", score: 60, stars: 3, val: "Evaluación documental pendiente", pot: "Emergente", potSub: "Bajo", potC: "var(--ink-soft)", status: "revision", initials: "••" },
  ];
  const STATUS_MAP = {
    certif: { cls: "", lbl: "Certificado" },
    validacion: { cls: "warn", lbl: "En validación" },
    revision: { cls: "review", lbl: "En revisión" },
  };
  const stars = (n) => {
    const full = Math.floor(n);
    const half = n - full >= 0.5;
    let out = "";
    for (let i = 0; i < full; i++) out += "★";
    if (half) out += "⯨";
    for (let i = 0; i < 5 - full - (half ? 1 : 0); i++) out += "☆";
    return out;
  };
  return ARTISTS.map(
    (a, i) => `
    <tr>
      <td><span class="rank">${String(i + 1).padStart(2, "0")}</span></td>
      <td>
        <div class="who">
          <div class="avatar" style="background: linear-gradient(135deg, var(--oro-cusco), var(--tierra)); display: flex; align-items: center; justify-content: center; color: var(--dark); font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 16px;">${a.initials}</div>
          <div>
            <div class="name">
              ${a.name}
              <span class="verified" title="Verificado">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12 L10 17 L20 7"/></svg>
              </span>
            </div>
            <div class="sub">${a.sub}</div>
          </div>
        </div>
      </td>
      <td><span class="chip ${a.catC}">${a.cat}</span></td>
      <td><span class="muted" style="font-size: 13px;">${a.tec}</span></td>
      <td>
        <div class="score">${a.score}<span style="color:var(--ink-soft); font-size:14px;">/100</span></div>
        <div class="stars">${stars(a.stars)}</div>
      </td>
      <td><span class="muted" style="font-size: 12.5px; display: inline-flex; gap: 8px; align-items: flex-start;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--oro-cusco); flex-shrink: 0; margin-top: 2px;"><path d="M3 21 V11 L12 4 L21 11 V21 H14 V14 H10 V21 Z"/></svg>
        ${a.val}
      </span></td>
      <td>
        <div style="color: ${a.potC}; font-weight: 500; font-size: 14px;">${a.pot}</div>
        <div class="muted" style="font-size: 12px;">(${a.potSub})</div>
      </td>
      <td><span class="status-dot ${STATUS_MAP[a.status].cls}">${STATUS_MAP[a.status].lbl}</span></td>
    </tr>`
  ).join("");
}

const pages = {
  inicio: "Arthub - Inicio.html",
  catalogo: "Arthub - Catalogo.html",
  comoFunciona: "Arthub - Como Funciona.html",
  artistas: "Arthub - Artistas.html",
  tecnologia: "Arthub - Tecnologia.html",
  inversionistas: "Arthub - Inversionistas.html",
  nosotros: "Arthub - Nosotros.html",
};

const result = {};
for (const [key, file] of Object.entries(pages)) {
  let { style, body } = extract(file);
  if (key === "catalogo") {
    body = body.replace(
      '<div class="works-grid" id="works">\n      <!-- works injected below -->\n    </div>',
      `<div class="works-grid" id="works">${catalogoWorks()}</div>`
    );
  }
  if (key === "artistas") {
    body = body.replace(
      '<tbody id="rank-body"></tbody>',
      `<tbody id="rank-body">${artistasRows()}</tbody>`
    );
  }
  // strip any leftover <script> blocks
  body = body.replace(/<script[\s\S]*?<\/script>/g, "");
  const full = rewriteLinks(`<style>${style}</style>\n${body}`);
  result[key] = full;
}

// ---- Ventanas (index gallery): self-contained body + style ----
function ventanas() {
  const raw = readFileSync(resolve(ROOT, "Arthub Index.html"), "utf8");
  const style = raw.match(/<style>([\s\S]*?)<\/style>/)[1];
  let body = raw.slice(raw.indexOf("<body>") + "<body>".length, raw.indexOf("</body>"));
  body = body.replace(/<script[\s\S]*?<\/script>/g, "");
  // only Landing exists; point missing concepts to "#"
  body = body
    .replaceAll('href="Arthub Landing v2 - Nocturno.html" target="_blank" rel="noopener"', 'href="#"')
    .replaceAll('href="Arthub Landing v3 - Editorial.html" target="_blank" rel="noopener"', 'href="#"')
    .replaceAll('href="Arthub Logos.html" target="_blank" rel="noopener"', 'href="#"')
    .replaceAll('href="Arthub Landing.html" target="_blank" rel="noopener"', 'href="/landing"');
  return rewriteLinks(`<style>${style}</style>\n${body}`);
}

const out = `// AUTO-GENERATED by scripts/gen-pages.mjs — do not edit by hand
/* eslint-disable */
export const inicioHtml = ${JSON.stringify(result.inicio)};
export const catalogoHtml = ${JSON.stringify(result.catalogo)};
export const comoFuncionaHtml = ${JSON.stringify(result.comoFunciona)};
export const artistasHtml = ${JSON.stringify(result.artistas)};
export const tecnologiaHtml = ${JSON.stringify(result.tecnologia)};
export const inversionistasHtml = ${JSON.stringify(result.inversionistas)};
export const nosotrosHtml = ${JSON.stringify(result.nosotros)};
export const ventanasHtml = ${JSON.stringify(ventanas())};
`;
writeFileSync(resolve(OUT, "pages.ts"), out, "utf8");
console.log("Wrote lib/pages.ts");
