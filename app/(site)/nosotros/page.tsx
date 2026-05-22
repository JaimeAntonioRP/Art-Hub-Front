"use client";

import { useState } from "react";

/* ── tipos ───────────────────────────────────────────────────────────────── */

type Member = {
  name: string;
  role: string;
  roleLabel: string;
  photo: string;
  bio: string;
  institutions: string[];
  color: string;
};

/* ── datos del equipo ────────────────────────────────────────────────────── */

const TEAM: Member[] = [
  {
    name: "Johanna Calanche Fernandez",
    role: "CEO",
    roleLabel: "Chief Executive Officer",
    photo: "/equipo/johana.png",
    bio: "Lidera la visión estratégica de Arthub, conectando el arte cusqueño con mercados globales de inversión. Impulsa el crecimiento sostenible y la identidad de la plataforma.",
    institutions: ["UNSAAC", "UAUTONOMA", "Univ. Norbert Wiener", "PEI Consultores"],
    color: "#CBA24A",
  },
  {
    name: "Augusto García Peñalva",
    role: "CAO",
    roleLabel: "Chief Art Officer",
    photo: "/equipo/augusto.png",
    bio: "Máxima autoridad en curaduría y autenticación artística. Con formación en la UNADQTC, garantiza el rigor académico y cultural de cada obra certificada en Arthub.",
    institutions: ["UNADQTC", "Ministerio de Cultura Perú", "UNESCO"],
    color: "#4F7A5E",
  },
  {
    name: "Manuel Ryu García",
    role: "CMO",
    roleLabel: "Chief Marketing Officer",
    photo: "/equipo/manuel.png",
    bio: "Dirige la estrategia de marca y posicionamiento internacional. Trabaja con organismos como ZEGEL y el DIRCETUR Cusco para amplificar el alcance del arte peruano.",
    institutions: ["Universidad del Pacífico", "ZEGEL", "DIRCETUR Cusco", "AXON", "PROM PERU"],
    color: "#B8653B",
  },
  {
    name: "Rodriguez Phillco Jaime Antonio",
    role: "CTO",
    roleLabel: "Chief Technology Officer",
    photo: "/equipo/jaime.png",
    bio: "Arquitecto del ecosistema tecnológico de Arthub. Diseña la infraestructura blockchain, los algoritmos de autenticación biométrica y la plataforma de tokenización de activos artísticos.",
    institutions: ["UNSAAC", "GEREDU", "JISA ADVENTURE", "JUMPER STUDIO AI"],
    color: "#0D1B2A",
  },
  {
    name: "Atauchi Mamani Jose Emilio",
    role: "CTO",
    roleLabel: "Chief Technology Officer",
    photo: "/equipo/emilio.png",
    bio: "Co-responsable de la arquitectura técnica. Especialista en sistemas distribuidos e integración con redes de energía y datos. Experiencia en infraestructura crítica con Electro Sur Este.",
    institutions: ["UNSAAC", "Electro Sur Este"],
    color: "#0D1B2A",
  },
];

/* ── MemberCard ──────────────────────────────────────────────────────────── */

function MemberCard({ member, featured }: { member: Member; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        background: "#FFFFFF",
        border: `1px solid ${hovered ? member.color : "var(--rule, #E6D5BB)"}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        boxSizing: "border-box" as const,
        transition: "box-shadow .3s, border-color .3s, transform .3s",
        boxShadow: hovered
          ? `0 16px 40px rgba(13,27,42,0.13), 0 0 0 1px ${member.color}33`
          : "0 2px 10px rgba(13,27,42,0.06)",
        transform: hovered ? "translateY(-5px)" : "none",
        padding: featured ? "36px 28px 28px" : "28px 22px 22px",
      }}
    >
      {/* role badge */}
      <div
        style={{
          background: member.color,
          color: member.color === "#0D1B2A" ? "#EDE3CC" : "#14110C",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          fontSize: featured ? 13 : 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "5px 16px",
          borderRadius: 99,
          marginBottom: 20,
        }}
      >
        {member.role}
      </div>

      {/* photo */}
      <div
        style={{
          width: featured ? 140 : 110,
          height: featured ? 140 : 110,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${member.color}44`,
          marginBottom: 16,
          background: "var(--arena, #EFE6D5)",
          flexShrink: 0,
        }}
      >
        <img
          src={member.photo}
          alt={member.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent) {
              parent.style.background = `${member.color}22`;
              parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${featured ? 36 : 28}px;font-family:serif;color:${member.color};font-weight:700">${member.name.charAt(0)}</div>`;
            }
          }}
        />
      </div>

      {/* name */}
      <h3
        className="serif"
        style={{
          fontSize: featured ? 20 : 17,
          lineHeight: 1.2,
          margin: "0 0 4px",
          color: "var(--ink, #0D1B2A)",
          textAlign: "center",
        }}
      >
        {member.name}
      </h3>

      {/* role label */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11.5,
          color: member.color,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          margin: "0 0 14px",
          textAlign: "center",
        }}
      >
        {member.roleLabel}
      </p>

      {/* bio */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "var(--ink-soft, #6B7A8A)",
          lineHeight: 1.6,
          textAlign: "center",
          margin: "0 0 16px",
        }}
      >
        {member.bio}
      </p>

      {/* institutions */}
      {member.institutions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "1px solid var(--rule, #E6D5BB)",
            width: "100%",
          }}
        >
          {member.institutions.map((inst) => (
            <span
              key={inst}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10.5,
                color: "var(--ink-soft, #6B7A8A)",
                background: "var(--arena, #EFE6D5)",
                border: "1px solid var(--rule, #E6D5BB)",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {inst}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */

export default function NosotrosPage() {
  const ceo = TEAM.find((m) => m.role === "CEO")!;
  const cao = TEAM.find((m) => m.role === "CAO")!;
  const cmo = TEAM.find((m) => m.role === "CMO")!;
  const ctos = TEAM.filter((m) => m.role === "CTO");

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            El Equipo · Arthub
          </div>
          <h1
            className="h-display"
            style={{
              color: "var(--ink-soft)",
              fontSize: "clamp(36px, 5vw, 62px)",
              maxWidth: 620,
              marginBottom: 16,
            }}
          >
            Las personas detrás de <em>Arthub</em>
          </h1>
          <p
            style={{
              color: "var(--ink-soft)",
              maxWidth: 540,
              marginTop: 0,
              marginBottom: 0,
              fontSize: 15.5,
            }}
          >
            Un equipo multidisciplinario unido por la misión de democratizar el acceso
            al arte cusqueño y proteger el patrimonio cultural del Perú mediante
            tecnología blockchain y certificación biométrica.
          </p>
        </div>

        {/* wave */}
        <div style={{ height: 28, background: "var(--arena)", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 28,
              background: "var(--marfil)",
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          />
        </div>
      </div>

      {/* ── TEAM GRID ─────────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper)", padding: "56px 0 96px" }}>
        <div className="wrap">
          {/*
            Grid de 6 columnas iguales.
            Fila 1: CEO(2) | CAO(2) | CMO(2)
            Fila 2: vacío(1) | CTO(2) | CTO(2) | vacío(1)  → centrados
          */}
          <div
            className="team-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 24,
            }}
          >
            {/* ── fila superior ── */}
            <div style={{ gridColumn: "1 / span 2", display: "flex" }}>
              <MemberCard member={ceo} featured />
            </div>
            <div style={{ gridColumn: "3 / span 2", display: "flex" }}>
              <MemberCard member={cao} featured />
            </div>
            <div style={{ gridColumn: "5 / span 2", display: "flex" }}>
              <MemberCard member={cmo} featured />
            </div>

            {/* ── fila inferior: 2 CTOs centrados ── */}
            <div style={{ gridColumn: "2 / span 2", display: "flex" }}>
              <MemberCard member={ctos[0]} />
            </div>
            <div style={{ gridColumn: "4 / span 2", display: "flex" }}>
              <MemberCard member={ctos[1]} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MISIÓN STRIP ──────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--azul-profundo, #0D1B2A)",
          padding: "64px 0",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 32,
          }}
        >
          {[
            {
              icon: "🎨",
              title: "Arte Auténtico",
              desc: "Certificamos cada obra con biometría y la anclamos en blockchain para garantía permanente de autenticidad.",
            },
            {
              icon: "🌎",
              title: "Alcance Global",
              desc: "Conectamos a coleccionistas e inversores de todo el mundo con los maestros del arte cusqueño.",
            },
            {
              icon: "🔒",
              title: "Tecnología Segura",
              desc: "Infraestructura de nivel financiero para proteger cada transacción y cada certificado digital.",
            },
            {
              icon: "🏛️",
              title: "Patrimonio Vivo",
              desc: "Preservamos y difundimos el legado cultural del Cusco para las generaciones futuras.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
              <h3
                className="serif"
                style={{ color: "var(--oro-cusco, #CBA24A)", fontSize: 20, margin: "0 0 10px" }}
              >
                {title}
              </h3>
              <p
                style={{
                  color: "rgba(237,227,204,0.7)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        /* tablet → 2 cols */
        @media (max-width: 860px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .team-grid > div { grid-column: span 1 !important; }
        }
        /* mobile → 1 col */
        @media (max-width: 520px) {
          .team-grid {
            grid-template-columns: 1fr !important;
          }
          .team-grid > div { grid-column: span 1 !important; }
        }
      `}</style>
    </>
  );
}
