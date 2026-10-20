"use client";

import { useState } from "react";
import { API_BASE, type CommercialRequestType } from "@/lib/api";

type Errors = Partial<Record<"name" | "email" | "phone" | "type" | "message" | "consent" | "form", string>>;

/**
 * Solicitud de información o intención de compra (§14). No hay pago en línea:
 * el equipo de ArtHub recibe la solicitud y contacta al interesado.
 */
export function RequestForm({ artworkId, artworkTitle, canBuy }: { artworkId: number; artworkTitle: string; canBuy: boolean }) {
  const [type, setType] = useState<CommercialRequestType>(canBuy ? "intencion_compra" : "informacion");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSending(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE}/artworks/${artworkId}/requests`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, consent: data.consent === "on" }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setSent(body.message ?? "Recibimos tu solicitud.");
        return;
      }
      if (res.status === 422 && body.errors) {
        const next: Errors = {};
        for (const [field, messages] of Object.entries(body.errors as Record<string, string[]>)) {
          next[field as keyof Errors] = messages[0];
        }
        setErrors(next);
        return;
      }
      setErrors({
        form: res.status === 429
          ? "Recibimos varias solicitudes seguidas desde tu conexión. Intenta de nuevo en un minuto."
          : "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.",
      });
    } catch {
      setErrors({ form: "No pudimos conectar con ArtHub. Revisa tu conexión e intenta de nuevo." });
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="req-done" role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg>
        <h3>{sent}</h3>
        <p>Te enviamos una copia a tu correo. Un asesor de ArtHub te contactará para conversar sobre <em>{artworkTitle}</em>.</p>
      </div>
    );
  }

  return (
    <form className="req-form" onSubmit={submit} noValidate>
      <fieldset className="req-types">
        <legend className="sr-only">¿Qué te gustaría?</legend>
        {canBuy ? (
          <label data-checked={type === "intencion_compra" || undefined}>
            <input type="radio" name="type" value="intencion_compra" checked={type === "intencion_compra"} onChange={() => setType("intencion_compra")} />
            <strong>Quiero comprarla</strong>
            <span>Te contactamos para coordinar el pago y la entrega.</span>
          </label>
        ) : null}
        <label data-checked={type === "informacion" || undefined}>
          <input type="radio" name="type" value="informacion" checked={type === "informacion"} onChange={() => setType("informacion")} />
          <strong>Quiero más información</strong>
          <span>Fotos, estado de conservación, procedencia.</span>
        </label>
      </fieldset>

      <div className="req-row">
        <Field name="name" label="Nombre" error={errors.name} autoComplete="name" required />
        <Field name="email" label="Correo" type="email" error={errors.email} autoComplete="email" required />
      </div>
      <Field name="phone" label="Teléfono o WhatsApp" type="tel" error={errors.phone} autoComplete="tel" optional />
      <label className="req-field">
        <span>Mensaje <small>(opcional)</small></span>
        <textarea name="message" rows={4} maxLength={2000} placeholder="Cuéntanos qué te interesa saber o desde dónde nos escribes."
          aria-invalid={Boolean(errors.message) || undefined} />
        {errors.message ? <em className="req-error">{errors.message}</em> : null}
      </label>

      {/* Campo trampa: las personas no lo ven; si llega lleno, la API rechaza el envío. */}
      <div className="req-trap" aria-hidden="true">
        <label>Sitio web <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="req-consent">
        <input type="checkbox" name="consent" required aria-invalid={Boolean(errors.consent) || undefined} />
        <span>Acepto que ArtHub use estos datos solo para responder a esta solicitud.</span>
      </label>
      {errors.consent ? <em className="req-error">{errors.consent}</em> : null}

      {errors.form ? <p className="req-alert" role="alert">{errors.form}</p> : null}

      <button type="submit" className="btn btn-gold btn-lg req-submit" disabled={sending}>
        {sending ? "Enviando…" : "Enviar solicitud"}
      </button>
      <p className="req-note">Sin pagos en línea ni compromiso: un asesor te escribe para seguir.</p>
    </form>
  );
}

function Field({ name, label, error, optional, type = "text", ...rest }: {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="req-field">
      <span>{label}{optional ? <small> (opcional)</small> : null}</span>
      <input name={name} type={type} aria-invalid={Boolean(error) || undefined} {...rest} />
      {error ? <em className="req-error">{error}</em> : null}
    </label>
  );
}
