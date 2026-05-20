"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  AuthCard,
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/catalogo";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(
        err instanceof Error
          ? "Credenciales incorrectas o servicio no disponible."
          : "Error desconocido.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta de inversionista o administrador."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" style={{ color: "var(--oro-cusco)" }}>
            Crear cuenta
          </Link>
        </>
      }
    >
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

        <div style={fieldStyle}>
          <label htmlFor="password" style={labelStyle}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-gold btn-lg"
          style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
