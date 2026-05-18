"use client";

import { useState, useEffect, type ReactNode } from "react";

const ICON_PATHS: Record<string, ReactNode> = {
  "arrow-up-right": (<><path d="M7 17 L17 7" /><path d="M8 7 H17 V16" /></>),
  "arrow-right": (<><path d="M5 12 H19" /><path d="M13 6 L19 12 L13 18" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21 L16 16" /></>),
  "scan-line": (<><path d="M3 7 V5 a2 2 0 0 1 2 -2 H7" /><path d="M17 3 H19 a2 2 0 0 1 2 2 V7" /><path d="M21 17 V19 a2 2 0 0 1 -2 2 H17" /><path d="M7 21 H5 a2 2 0 0 1 -2 -2 V17" /><path d="M7 12 H17" /></>),
  "scan-eye": (<><path d="M3 7 V5 a2 2 0 0 1 2 -2 H7" /><path d="M17 3 H19 a2 2 0 0 1 2 2 V7" /><path d="M21 17 V19 a2 2 0 0 1 -2 2 H17" /><path d="M7 21 H5 a2 2 0 0 1 -2 -2 V17" /><circle cx="12" cy="12" r="3" /><path d="M21 12 c-2.5 3 -5.5 4.5 -9 4.5 S5.5 15 3 12 c2.5 -3 5.5 -4.5 9 -4.5 S18.5 9 21 12 z" /></>),
  "shield-check": (<><path d="M12 22 s8 -4 8 -10 V5 l-8 -3 -8 3 v7 c0 6 8 10 8 10 z" /><path d="M9 12 l2 2 l4 -4" /></>),
  "package-check": (<><path d="M21 16 V8 a2 2 0 0 0 -1 -1.73 l-7 -4 a2 2 0 0 0 -2 0 l-7 4 A2 2 0 0 0 3 8 v8 a2 2 0 0 0 1 1.73 l7 4 a2 2 0 0 0 2 0 l4 -2.28" /><path d="M3.3 7 L12 12 l8.7 -5" /><path d="M12 22 V12" /><path d="M16 19 l2 2 l4 -4" /></>),
  bookmark: (<><path d="M19 21 L12 16 L5 21 V5 a2 2 0 0 1 2 -2 h10 a2 2 0 0 1 2 2 z" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2 V6" /><path d="M8 2 V6" /><path d="M3 10 H21" /></>),
};

function Icon({ name, size = 18, stroke = 1.5, className = "" }: { name: string; size?: number; stroke?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
    >
      {ICON_PATHS[name] || null}
    </svg>
  );
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 17 L12 7 L17 17" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="miter" />
        <path d="M9.2 13 H14.8" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="font-display tracking-[0.22em] uppercase text-[13px]">Arthub</span>
    </div>
  );
}

function Topstrip() {
  return (
    <div className="border-b rule">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-9 flex items-center justify-between text-[11px] font-display ink-soft">
        <div className="flex items-center gap-6">
          <span className="tracking-[0.22em] uppercase">Cusco · Lima · Miami · Zürich</span>
          <span className="hidden md:inline tracking-[0.22em] uppercase">Subasta privada — 14 Jun 2026</span>
        </div>
        <div className="flex items-center gap-5">
          <button className="tracking-[0.22em] uppercase hover:[color:var(--ink)]">ES</button>
          <span className="opacity-30">/</span>
          <button className="tracking-[0.22em] uppercase hover:[color:var(--ink)]">EN</button>
          <span className="hidden md:inline opacity-30">|</span>
          <span className="hidden md:inline tracking-[0.22em] uppercase">USD</span>
        </div>
      </div>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onS = () => setScrolled(window.scrollY > 8);
    onS();
    window.addEventListener("scroll", onS, { passive: true });
    return () => window.removeEventListener("scroll", onS);
  }, []);

  const links = [
    { label: "Catálogo", href: "#catalogo" },
    { label: "Tecnología", href: "#tecnologia" },
    { label: "Logística", href: "#logistica" },
    { label: "Coleccionistas", href: "#coleccionistas" },
  ];

  return (
    <header className={`sticky top-0 z-40 nav-blur border-b ${scrolled ? "rule" : "border-transparent"}`}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
        <a href="#top" className="flex items-center"><Logo /></a>
        <nav className="hidden md:flex items-center gap-9 font-display text-[13px] tracking-[0.04em]">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="ink-soft hover:[color:var(--ink)] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex items-center gap-2 font-display text-[12px] tracking-[0.18em] uppercase ink-soft hover:[color:var(--ink)]">
            <Icon name="search" size={15} stroke={1.4} />
            Buscar
          </button>
          <a href="#acceso" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 font-display text-[12px] tracking-[0.18em] uppercase">
            Acceso Inversionistas
            <Icon name="arrow-up-right" size={14} stroke={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display font-light text-[28px] tracking-[-0.01em] leading-none">{v}</div>
      <div className="mt-2 eyebrow">{k}</div>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between py-2.5 ${last ? "" : "border-b rule"}`}>
      <span className="eyebrow">{k}</span>
      <span className="font-display text-[13px] tracking-[0.04em]">{v}</span>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-8 fade-up">
            <div className="flex items-center gap-3 mb-8">
              <span className="secnum">/ 01 — La Tesis</span>
              <span className="h-px w-16 bg-current opacity-20" />
              <span className="eyebrow">Art Asset Management</span>
            </div>
            <h1 className="font-display font-light leading-[0.95] tracking-[-0.02em] text-[clamp(44px,7.4vw,108px)]">
              El óleo cusqueño,<br />
              transformado en un{" "}
              <span className="italic font-serif font-light" style={{ color: "var(--accent)" }}>
                activo institucional
              </span>
              .
            </h1>
            <p className="mt-10 max-w-[58ch] text-[18px] lg:text-[19px] leading-[1.55] ink-soft">
              Arthub conecta a los maestros pintores del Cusco con coleccionistas e
              inversionistas de alto patrimonio. Cada obra es validada por
              <span style={{ color: "var(--ink)" }}> visión artificial biométrica</span>,
              titulada en cadena de bloques y custodiada bajo respaldo institucional —
              eliminando la fricción logística y el riesgo de procedencia.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a href="#catalogo" className="btn-primary inline-flex items-center gap-3 px-7 py-4 font-display text-[12px] tracking-[0.22em] uppercase">
                Explorar Catálogo Curado
                <Icon name="arrow-right" size={15} stroke={1.4} />
              </a>
              <a href="#ar" className="btn-ghost inline-flex items-center gap-3 px-7 py-4 font-display text-[12px] tracking-[0.22em] uppercase">
                <Icon name="scan-line" size={15} stroke={1.4} />
                Ver Demostración AR
              </a>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 fade-up" style={{ animationDelay: "120ms" }}>
            <div className="border-t rule pt-6 grid grid-cols-2 gap-y-7 gap-x-6">
              <Stat k="Obras curadas" v="312" />
              <Stat k="Maestros activos" v="47" />
              <Stat k="Volumen colocado" v="USD 8.4M" />
              <Stat k="Procedencia verificada" v="100%" />
            </div>
            <div className="hairline-divider my-8" />
            <p className="text-[13px] leading-[1.6] ink-soft font-serif italic">
              &quot;Una infraestructura de confianza para el arte maestro
              latinoamericano.&quot; — Boletín ADAAE, Q1 2026.
            </p>
          </div>
        </div>

        <div className="mt-20 lg:mt-28 grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-7">
            <div className="aspect-[16/10] placeholder-canvas relative overflow-hidden border rule">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[10px] tracking-[0.32em] uppercase ink-soft">
                  [ óleo destacado — 1200×750 ]
                </span>
              </div>
              <div className="absolute left-6 top-6 flex items-center gap-2">
                <span className="tag"><span className="w-1.5 h-1.5 rounded-full bg-accent" />Lote 014</span>
                <span className="tag">Validado por IA</span>
              </div>
              <div className="absolute right-6 bottom-6 text-right">
                <div className="font-display text-[10px] tracking-[0.28em] uppercase ink-soft">Vista previa</div>
                <div className="font-display text-[12px] tracking-[0.1em] mt-1">Procesión en Sacsayhuamán</div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:pl-4">
            <div className="secnum mb-4">/ obra destacada</div>
            <h3 className="font-display font-light text-[28px] lg:text-[34px] leading-[1.05] tracking-[-0.01em]">
              Procesión en Sacsayhuamán
            </h3>
            <p className="ink-soft text-[13px] mt-2 font-display tracking-[0.04em]">
              Maestro Hilario Mendívil · 2024 · Óleo sobre lienzo · 90 × 120 cm
            </p>
            <div className="hairline-divider my-6" />
            <Row k="Tasación" v="USD 28,500" />
            <Row k="Certificación" v="Biométrica · Hash 0x9c…a3f" />
            <Row k="Custodia" v="Bóveda climatizada, Lima" />
            <Row k="Seguro" v="DHL Fine Art — póliza total" last />
            <a href="#" className="mt-7 inline-flex items-center gap-2 font-display text-[12px] tracking-[0.22em] uppercase accent">
              Solicitar dossier privado <Icon name="arrow-up-right" size={14} stroke={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerMarquee() {
  const items = [
    "ADAAE", "Ministerio de Cultura", "DHL Fine Art", "Banco de la Nación",
    "Sotheby's Institute", "Universidad Nacional San Antonio Abad",
    "Cámara de Comercio Cusco", "Christie's Education",
  ];
  const row = [...items, ...items];
  return (
    <div className="border-y rule overflow-hidden bg-alt">
      <div className="py-6">
        <div className="marquee whitespace-nowrap font-display text-[12px] tracking-[0.32em] uppercase ink-soft">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-12 pr-12">
              {t}
              <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Trust() {
  const cards = [
    { num: "01", icon: "scan-eye", kicker: "Visión artificial", title: "Certificación biométrica de cada pincelada.", body: "Una red neuronal entrenada con más de 38,000 obras del corpus cusqueño extrae la firma biométrica del óleo —textura, ritmo del trazo, capa pigmentaria— generando un certificado único e irrepetible.", bullets: ["Análisis multiespectral", "Firma de trazo", "Detección de retoque"] },
    { num: "02", icon: "shield-check", kicker: "Blockchain", title: "Título de propiedad inmutable y trazable.", body: "Cada obra recibe un token de procedencia anclado a una cadena pública. Transferencias, exhibiciones y restauraciones quedan registradas en un historial criptográfico verificable durante generaciones.", bullets: ["Smart-contract custodiado", "Historial perpetuo", "Royalties al maestro"] },
    { num: "03", icon: "package-check", kicker: "Logística llave en mano", title: "Exportación, seguro y entrega global.", body: "Alianza operativa con DHL Fine Art: embalaje museístico, trámite CITES, póliza total y trazabilidad sensórica desde el taller del maestro hasta la residencia o bóveda del coleccionista.", bullets: ["Embalaje museístico", "Trámite documental", "Cobertura puerta a puerta"] },
  ];
  return (
    <section id="tecnologia" className="border-t rule">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid grid-cols-12 gap-8 mb-16 lg:mb-24 items-end">
          <div className="col-span-12 lg:col-span-7">
            <div className="secnum mb-5">/ 02 — Infraestructura</div>
            <h2 className="font-display font-light leading-[1] tracking-[-0.02em] text-[clamp(36px,5vw,68px)]">
              Tres pilares para mover<br />una obra maestra.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:pl-8">
            <p className="ink-soft text-[16px] leading-[1.6]">
              El arte maestro ha sido históricamente ilíquido: difícil de autenticar,
              difícil de mover, difícil de asegurar. Arthub resuelve los tres frentes
              con tecnología y alianzas institucionales auditables.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-[color:var(--rule)] border rule">
          {cards.map((c) => (
            <article key={c.num} className="bg-[color:var(--bg)] p-8 lg:p-10 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 border rule flex items-center justify-center accent">
                  <Icon name={c.icon} size={22} stroke={1.3} />
                </div>
                <span className="secnum">{c.num}</span>
              </div>
              <div className="eyebrow mt-10">{c.kicker}</div>
              <h3 className="font-display font-light text-[26px] lg:text-[30px] leading-[1.1] tracking-[-0.01em] mt-3">
                {c.title}
              </h3>
              <p className="mt-5 text-[15px] leading-[1.6] ink-soft">{c.body}</p>
              <ul className="mt-7 pt-6 border-t rule space-y-2.5">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 font-display text-[12px] tracking-[0.06em]">
                    <span className="w-3 h-px bg-current opacity-50" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type Work = {
  lot: string; title: string; master: string; origin: string;
  medium: string; price: string; tags: string[]; palette: string[];
};

const WORKS: Work[] = [
  { lot: "Lote 027", title: "Virgen del Carmen (estudio)", master: "Maestro Edilberto Mérida", origin: "Cusco · 2025", medium: "Óleo sobre lienzo · 80 × 60 cm", price: "USD 15,000", tags: ["Validado por IA", "AR Disponible", "Procedencia 0x4a…b1"], palette: ["#3a2a1f", "#7a4a30", "#c89058", "#e9d4a8"] },
  { lot: "Lote 031", title: "Plaza de Armas, lluvia tardía", master: "Maestro Antonio Olave", origin: "Cusco · 2024", medium: "Óleo sobre lienzo · 110 × 140 cm", price: "USD 32,400", tags: ["Validado por IA", "AR Disponible", "Custodia Lima"], palette: ["#1e2027", "#3d4a5c", "#7d8aa0", "#cfd5df"] },
  { lot: "Lote 042", title: "Cosecha en Maras", master: "Maestra Florinda Quispe", origin: "Sacred Valley · 2025", medium: "Óleo sobre lienzo · 95 × 130 cm", price: "USD 22,800", tags: ["Validado por IA", "Edición única", "AR Disponible"], palette: ["#2a1e15", "#8c5a2e", "#d49a4a", "#f1deb6"] },
];

function FilterChip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      className={`font-display text-[11px] tracking-[0.18em] uppercase px-4 py-2 border rule rounded-full transition-colors ${active ? "" : "ink-soft hover:[color:var(--ink)]"}`}
      style={active ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : {}}
    >
      {children}
    </button>
  );
}

function WorkCard({ w }: { w: Work }) {
  return (
    <article className="work-card group">
      <div className="work-mask aspect-[4/5] placeholder-canvas relative border rule">
        <div className="work-frame absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${w.palette[0]} 0%, ${w.palette[1]} 38%, ${w.palette[2]} 68%, ${w.palette[3]} 100%)`,
              opacity: 0.85,
              mixBlendMode: "multiply",
            }}
          />
          <div className="absolute inset-0 flex items-end justify-start p-5">
            <span className="font-display text-[10px] tracking-[0.28em] uppercase text-white/80">
              [ {w.lot.toLowerCase()} — imagen ]
            </span>
          </div>
        </div>
        <div className="absolute left-4 top-4">
          <span className="tag" style={{ background: "color-mix(in oklab, var(--bg) 86%, transparent)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {w.lot}
          </span>
        </div>
        <button
          className="absolute right-4 top-4 w-9 h-9 rounded-full border rule flex items-center justify-center"
          style={{ background: "color-mix(in oklab, var(--bg) 86%, transparent)" }}
          aria-label="Vista AR"
        >
          <Icon name="scan-line" size={15} stroke={1.4} />
        </button>
      </div>
      <div className="pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display font-light text-[22px] lg:text-[24px] leading-[1.1] tracking-[-0.01em]">
            {w.title}
          </h3>
          <span className="font-display text-[14px] tracking-[0.02em] whitespace-nowrap">{w.price}</span>
        </div>
        <p className="mt-2 font-display text-[12px] tracking-[0.06em] ink-soft">
          {w.master} <span className="opacity-50 mx-1.5">·</span> {w.origin}
        </p>
        <p className="mt-1 text-[13px] italic ink-soft">{w.medium}</p>
        <div className="mt-5 pt-5 border-t rule flex flex-wrap gap-1.5">
          {w.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <a href="#" className="font-display text-[12px] tracking-[0.22em] uppercase accent inline-flex items-center gap-2">
            Ficha técnica
            <Icon name="arrow-up-right" size={13} stroke={1.5} />
          </a>
          <a href="#" className="font-display text-[12px] tracking-[0.22em] uppercase ink-soft hover:[color:var(--ink)] inline-flex items-center gap-2">
            <Icon name="bookmark" size={13} stroke={1.4} />
            Reservar
          </a>
        </div>
      </div>
    </article>
  );
}

function Catalog() {
  return (
    <section id="catalogo" className="bg-alt border-t border-b rule">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 lg:mb-20">
          <div>
            <div className="secnum mb-5">/ 03 — Catálogo Curado</div>
            <h2 className="font-display font-light leading-[1] tracking-[-0.02em] text-[clamp(36px,5vw,68px)]">
              Selección de Primavera 2026.
            </h2>
            <p className="ink-soft mt-6 max-w-[52ch] text-[16px] leading-[1.6]">
              Tres obras de la cohorte actual. El catálogo completo —312 piezas— se
              comparte bajo acuerdo de confidencialidad con coleccionistas verificados.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip active>Todas</FilterChip>
            <FilterChip>Maestros consagrados</FilterChip>
            <FilterChip>Nuevas voces</FilterChip>
            <FilterChip>Bajo USD 20K</FilterChip>
            <FilterChip>Edición única</FilterChip>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {WORKS.map((w) => (
            <WorkCard key={w.lot} w={w} />
          ))}
        </div>
        <div className="mt-16 flex items-center justify-between border-t rule pt-8">
          <span className="ink-soft font-display text-[12px] tracking-[0.22em] uppercase">
            Mostrando 3 de 312 obras curadas
          </span>
          <a href="#" className="btn-ghost inline-flex items-center gap-3 px-7 py-3.5 font-display text-[12px] tracking-[0.22em] uppercase">
            Solicitar catálogo completo
            <Icon name="arrow-up-right" size={14} stroke={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

function CTABand() {
  return (
    <section id="acceso" className="border-b rule">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-24 lg:py-32 grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 lg:col-span-8">
          <div className="secnum mb-5">/ 04 — Acceso Institucional</div>
          <h2 className="font-display font-light leading-[1] tracking-[-0.02em] text-[clamp(36px,5vw,68px)]">
            Solicite credenciales de inversionista <br />
            <span className="italic font-serif font-light" style={{ color: "var(--accent)" }}>
              acreditado.
            </span>
          </h2>
          <p className="ink-soft mt-7 max-w-[60ch] text-[16px] leading-[1.6]">
            La incorporación requiere verificación KYC, declaración de patrimonio y
            firma de acuerdo de confidencialidad. El proceso toma 72 horas hábiles y
            es atendido por nuestra mesa privada en Lima y Zürich.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
          <a href="#" className="btn-primary inline-flex items-center justify-between px-6 py-4 font-display text-[12px] tracking-[0.22em] uppercase">
            Iniciar Acreditación
            <Icon name="arrow-up-right" size={14} stroke={1.5} />
          </a>
          <a href="#" className="btn-ghost inline-flex items-center justify-between px-6 py-4 font-display text-[12px] tracking-[0.22em] uppercase">
            Agendar con un asesor
            <Icon name="calendar" size={14} stroke={1.4} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Plataforma", links: ["Catálogo curado", "Tecnología IA/AR", "Logística llave en mano", "Custodia y bóveda", "Reportes de procedencia"] },
    { h: "Compañía", links: ["Tesis institucional", "Equipo curatorial", "Maestros afiliados", "Notas de prensa", "Carreras"] },
    { h: "Coleccionistas", links: ["Acreditación KYC", "Mesa privada", "Servicios fiduciarios", "Donación filantrópica", "Atención 24/7"] },
  ];
  return (
    <footer className="bg-alt">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4">
            <Logo size={26} />
            <p className="mt-8 ink-soft text-[14px] leading-[1.6] max-w-[40ch]">
              Arthub S.A.C. opera bajo la legislación peruana y mantiene alianzas
              estratégicas con instituciones del sector cultural y financiero.
            </p>
            <div className="mt-10">
              <div className="eyebrow mb-4">Alianzas estratégicas</div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 font-display text-[12px] tracking-[0.12em]">
                <span>ADAAE</span><span className="opacity-30">·</span>
                <span>Ministerio de Cultura</span><span className="opacity-30">·</span>
                <span>DHL Fine Art</span><span className="opacity-30">·</span>
                <span>Banco de la Nación</span><span className="opacity-30">·</span>
                <span>Universidad San Antonio Abad</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-6">
            {cols.map((c) => (
              <div key={c.h}>
                <div className="eyebrow mb-5">{c.h}</div>
                <ul className="space-y-3 font-display text-[13px]">
                  {c.links.map((l) => (
                    <li key={l}><a href="#" className="ink-soft hover:[color:var(--ink)]">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="col-span-12 lg:col-span-3">
            <div className="eyebrow mb-5">Mesa privada</div>
            <div className="font-display text-[14px] leading-[1.7]">
              concierge@arthub.art<br />
              +51 84 000 000 · Cusco<br />
              +1 305 000 0000 · Miami<br />
              +41 44 000 00 00 · Zürich
            </div>
            <div className="hairline-divider my-7" />
            <div className="eyebrow mb-3">Boletín curatorial</div>
            <form className="flex border rule">
              <input
                type="email"
                placeholder="email@institución.com"
                className="flex-1 bg-transparent px-4 py-3 text-[13px] font-display placeholder:ink-soft focus:outline-none"
              />
              <button className="px-4 bg-[color:var(--ink)] text-[color:var(--bg)]" aria-label="Suscribirse">
                <Icon name="arrow-right" size={14} stroke={1.5} />
              </button>
            </form>
          </div>
        </div>
        <div className="hairline-divider my-12" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ink-soft font-display text-[11px] tracking-[0.22em] uppercase">
          <div>© 2026 Arthub S.A.C. — Cusco, Perú · Todos los derechos reservados.</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="hover:[color:var(--ink)]">Términos</a>
            <a href="#" className="hover:[color:var(--ink)]">Privacidad</a>
            <a href="#" className="hover:[color:var(--ink)]">Cookies</a>
            <a href="#" className="hover:[color:var(--ink)]">Cumplimiento KYC/AML</a>
            <a href="#" className="hover:[color:var(--ink)]">Procedencia</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div>
      <Topstrip />
      <Nav />
      <main>
        <Hero />
        <PartnerMarquee />
        <Trust />
        <Catalog />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}
