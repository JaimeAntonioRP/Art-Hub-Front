import { API_BASE, type PublicCertificate } from "@/lib/api";

/** Acepta el token o el número del certificado, o el enlace completo que lleva el QR. */
export function certificateKey(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/verificar\/([^/?#\s]+)/);
  const key = match ? match[1] : trimmed;
  try {
    return decodeURIComponent(key);
  } catch {
    return key; // un «%» suelto no debe romper la página
  }
}

/** Certificado por token o número; null si no existe. */
export async function getCertificate(key: string): Promise<PublicCertificate | null> {
  if (!key || key.length > 80) return null;
  const res = await fetch(`${API_BASE}/certificates/${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
    // Sin caché: una anulación tiene que verse en el portal al instante.
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} al consultar el certificado`);
  return (await res.json()) as PublicCertificate;
}

export const CERTIFICATE_STATUS: Record<PublicCertificate["status"], { label: string; text: string }> = {
  vigente: { label: "Certificado vigente", text: "La obra está registrada en ArtHub y este certificado es válido." },
  reemplazado: { label: "Certificado reemplazado", text: "Este certificado fue sustituido por una versión más reciente y ya no es válido." },
  anulado: { label: "Certificado anulado", text: "ArtHub anuló este certificado: ya no es válido." },
};
