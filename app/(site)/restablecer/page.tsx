"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import {
  AuthCard,
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

/** Llega desde el enlace del correo: /restablecer?token=…&email=… */
function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token || !email) {
    return (
      <AuthCard
        title="Enlace incompleto"
        subtitle="Abre el enlace tal como llegó a tu correo, o pide uno nuevo."
      >
        <Link href="/recuperar" className="btn btn-gold btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Pedir un enlace nuevo
        </Link>
      </AuthCard>
    );
  }

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
      await api.resetPassword({ token, email, password, password_confirmation: passwordConfirmation });
      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("422")
          ? "El enlace no es válido o ya venció. Pide uno nuevo."
          : "Servicio no disponible. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Contraseña actualizada" subtitle="Ya puedes iniciar sesión con tu contraseña nueva.">
        <Link href="/login" className="btn btn-gold btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Iniciar sesión
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crea una contraseña nueva"
      subtitle={`Para la cuenta ${email}.`}
      footer={
        <Link href="/recuperar" style={{ color: "var(--accent-text)" }}>
          Pedir un enlace nuevo
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <div style={fieldStyle}>
          <label htmlFor="password" style={labelStyle}>
            Contraseña nueva
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
          {submitting ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function RestablecerPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
