"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  AuthCard,
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

type PublicRole = "comprador" | "artista";

const ROLE_OPTIONS: { value: PublicRole; title: string; detail: string }[] = [
  { value: "comprador", title: "Quiero conocer obras", detail: "Consulta el catálogo y solicita información." },
  { value: "artista", title: "Soy artista", detail: "Registra tu perfil y tus obras en ArtHub." },
];

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<PublicRole>("comprador");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [artistPanelUrl, setArtistPanelUrl] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      if (user.role === "artista" && user.artist_panel_url) {
        setArtistPanelUrl(user.artist_panel_url);
      } else {
        router.push("/obras");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido.";
      if (message.includes("422")) {
        setError(
          "No fue posible registrar la cuenta. Verifica que el correo no esté en uso.",
        );
      } else if (message.includes("429")) {
        setError("Demasiados intentos. Espera un minuto y vuelve a intentarlo.");
      } else {
        setError("Servicio no disponible. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (artistPanelUrl) {
    return (
      <AuthCard
        title="Tu cuenta de artista está lista"
        subtitle="El siguiente paso es completar tu perfil. El equipo de ArtHub lo revisará antes de publicarlo."
      >
        <ol style={{ margin: "0 0 24px", paddingLeft: 20, color: "var(--ink-soft)", lineHeight: 1.7, fontSize: 14.5 }}>
          <li>Ingresa con tu correo y contraseña: te llevamos directo a tu panel de artista.</li>
          <li>Completa tu biografía, técnicas, trayectoria y fotografía.</li>
          <li>Te avisaremos por correo cuando tu perfil sea aprobado.</li>
        </ol>
        <a href={artistPanelUrl} className="btn btn-gold btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Ingresar a mi panel
        </a>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Elige cómo quieres usar ArtHub."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "var(--accent-text)" }}>
            Iniciar sesión
          </a>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <fieldset style={{ border: 0, padding: 0, margin: "0 0 22px" }}>
          <legend style={labelStyle}>Tipo de cuenta</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.value;
              return (
                <label
                  key={option.value}
                  style={{
                    position: "relative",
                    display: "block",
                    cursor: "pointer",
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                    background: selected ? "var(--accent-subtle)" : "var(--surface)",
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={() => setRole(option.value)}
                    style={{ position: "absolute", opacity: 0, inset: 0, margin: 0, cursor: "pointer" }}
                  />
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                    {option.title}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45 }}>
                    {option.detail}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>
            {role === "artista" ? "Nombres y apellidos" : "Nombre completo"}
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email" style={labelStyle}>
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="password" style={labelStyle}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="password_confirmation" style={labelStyle}>
            Confirmar contraseña
          </label>
          <input
            id="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-gold btn-lg"
          style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Creando cuenta..." : role === "artista" ? "Crear cuenta de artista" : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
