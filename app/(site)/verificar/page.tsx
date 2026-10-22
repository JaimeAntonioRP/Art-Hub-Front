import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PdfCheck } from "@/components/verify/PdfCheck";
import { certificateKey } from "@/lib/certificates";
import "@/components/verify/verify.css";

export const metadata: Metadata = {
  title: "Verificar un certificado",
  description: "Consulta el estado de un certificado de ArtHub con su número o código QR, y comprueba que el PDF no fue modificado.",
};

type SearchParams = Promise<{ codigo?: string | string[] }>;

/** Portal público de verificación (§20, §22). El formulario es GET: funciona sin JavaScript. */
export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).codigo;
  const code = certificateKey(Array.isArray(raw) ? raw[0] ?? "" : raw ?? "");
  if (code) redirect(`/verificar/${encodeURIComponent(code)}`);

  return (
    <>
      <section className="vf-head">
        <div className="wrap">
          <div className="eyebrow">Portal de verificación</div>
          <h1>Verificar un certificado</h1>
          <p>
            Cada obra certificada por ArtHub tiene un número y un código QR. Consulta aquí si el certificado
            está vigente y comprueba que el PDF que tienes es el original.
          </p>
        </div>
      </section>

      <section className="vf-body">
        <div className="wrap vf-grid">
          <div className="vf-panel">
            <h2>Consultar por número o QR</h2>
            <p>Escanea el código QR con la cámara del teléfono, o escribe el número del certificado.</p>
            <form action="/verificar" method="get" className="vf-search">
              <label htmlFor="vf-code" className="sr-only">Número del certificado o enlace del QR</label>
              <input id="vf-code" name="codigo" required autoComplete="off" spellCheck={false}
                placeholder="AH-CUS-2026-000001-C1" />
              <button type="submit" className="btn btn-gold">Consultar</button>
            </form>
            <p className="vf-hint">También puedes pegar el enlace completo que abre el QR.</p>
          </div>

          <div className="vf-panel">
            <h2>Comprobar un PDF</h2>
            <p>Si recibiste el certificado como archivo, comprueba que nadie lo modificó.</p>
            <PdfCheck />
          </div>
        </div>
      </section>
    </>
  );
}
