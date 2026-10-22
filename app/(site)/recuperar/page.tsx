"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  AuthCard,
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { message } = await api.forgotPassword(email);
      setSent(message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("429")
          ? "Demasiados intentos. Espera un minuto y vuelve a intentarlo."
          : message.includes("422")
            ? "Escribe un correo válido."
            : "Servicio no disponible. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <a href="/login" style={{ color: "var(--accent-text)" }}>
          Volver a iniciar sesión
        </a>
      }
    >
      {sent ? (
        <div
          role="status"
          style={{
            background: "var(--success-bg)",
            color: "var(--success)",
            padding: "12px 14px",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {sent} Revisa también la carpeta de spam. El enlace vence en 60 minutos.
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error ? <div style={errorBoxStyle}>{error}</div> : null}

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

          <button
            type="submit"
            disabled={submitting || !email}
            className="btn btn-gold btn-lg"
            style={{ width: "100%", opacity: submitting || !email ? 0.7 : 1 }}
          >
            {submitting ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
