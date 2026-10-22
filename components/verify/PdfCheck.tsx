"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { API_BASE, type PublicCertificate } from "@/lib/api";
import { CERTIFICATE_STATUS } from "@/lib/certificates";

type Result =
  | { kind: "match"; hash: string; certificate: Pick<PublicCertificate, "number" | "status"> }
  | { kind: "nomatch"; hash: string }
  | { kind: "error"; message: string };

const MAX_BYTES = 30 * 1024 * 1024;

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Comprobación de integridad de un PDF (§22). La huella se calcula en el navegador:
 * el archivo nunca sale del equipo. Con `expected` se compara contra un certificado
 * concreto; sin él, se busca a qué certificado corresponde.
 */
export function PdfCheck({ expected }: { expected?: Pick<PublicCertificate, "number" | "status" | "pdf_sha256"> }) {
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function check(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    if (file.size > MAX_BYTES) {
      setResult({ kind: "error", message: "El archivo es demasiado grande para ser un certificado de ArtHub." });
      return;
    }
    setBusy(true);
    try {
      const hash = await sha256Hex(file);
      if (expected) {
        setResult(hash === expected.pdf_sha256
          ? { kind: "match", hash, certificate: expected }
          : { kind: "nomatch", hash });
        return;
      }
      const res = await fetch(`${API_BASE}/certificates/fingerprint/${hash}`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { match: boolean; certificate: PublicCertificate | null };
      setResult(body.match && body.certificate
        ? { kind: "match", hash, certificate: body.certificate }
        : { kind: "nomatch", hash });
    } catch {
      setResult({ kind: "error", message: "No pudimos comprobar el archivo. Intenta de nuevo en unos minutos." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pdf-check">
      <label
        className="pdf-drop"
        data-dragging={dragging || undefined}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); check(e.dataTransfer.files[0]); }}
      >
        <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only"
          onChange={(e) => { check(e.target.files?.[0]); e.target.value = ""; }} />
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3" /></svg>
        <strong>{busy ? "Calculando la huella…" : fileName ?? "Elige o arrastra el PDF del certificado"}</strong>
        <span>El archivo no se sube: la huella se calcula en tu equipo.</span>
      </label>

      {result ? (
        <div className={`pdf-result is-${result.kind}`} role="status">
          {result.kind === "match" ? (
            <>
              <strong>Integridad verificada</strong>
              <p>
                El archivo es idéntico al PDF del certificado {result.certificate.number}.{" "}
                {result.certificate.status !== "vigente" ? <em>Atención: {CERTIFICATE_STATUS[result.certificate.status].label.toLowerCase()}.</em> : null}
              </p>
              {!expected ? <Link href={`/verificar/${encodeURIComponent(result.certificate.number)}`}>Ver el certificado →</Link> : null}
            </>
          ) : result.kind === "nomatch" ? (
            <>
              <strong>Integridad no verificada</strong>
              <p>
                {expected
                  ? `Este archivo no coincide con el PDF emitido para el certificado ${expected.number}: fue modificado o es otro documento.`
                  : "Este archivo no coincide con ningún certificado emitido por ArtHub: fue modificado o no es un certificado original."}
              </p>
            </>
          ) : (
            <p>{result.message}</p>
          )}
          {"hash" in result ? <code>SHA-256 {result.hash}</code> : null}
        </div>
      ) : null}
    </div>
  );
}
