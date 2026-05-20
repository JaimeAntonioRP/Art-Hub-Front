"use client";

import Link from "next/link";
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

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        wallet_address: walletAddress || undefined,
      });
      router.push("/catalogo");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido.";
      if (message.includes("422")) {
        setError(
          "No fue posible registrar la cuenta. Verifica que el correo no esté en uso.",
        );
      } else {
        setError("Servicio no disponible. Intenta nuevamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Únete a la red global de inversionistas en arte cusqueño."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--oro-cusco)" }}>
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>
            Nombre completo
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
          <label htmlFor="wallet" style={labelStyle}>
            Wallet (opcional)
          </label>
          <input
            id="wallet"
            type="text"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
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
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
