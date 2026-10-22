import type { Metadata } from "next";
import Link from "next/link";
import { PdfCheck } from "@/components/verify/PdfCheck";
import { CERTIFICATE_STATUS, certificateKey, getCertificate } from "@/lib/certificates";
import type { PublicCertificate } from "@/lib/api";
import "@/components/verify/verify.css";

type Params = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const certificate = await getCertificate(certificateKey((await params).token));
  if (!certificate) return { title: "Certificado no encontrado" };
  return {
    title: `Certificado ${certificate.number}`,
    description: `${CERTIFICATE_STATUS[certificate.status].label}: ${certificate.artwork?.title ?? ""}`,
    robots: { index: false }, // las páginas de certificados no deben aparecer en buscadores
  };
}

const DOCUMENT_CATEGORY: Record<string, string> = {
  declaracion: "Declaración del artista", certificado: "Certificado existente", procedencia: "Procedencia",
  informe: "Informe", peritaje: "Peritaje de terceros", permiso: "Permiso", historico: "Documentación histórica", otro: "Otro",
};

function formatDate(iso: string | null): string | null {
  return iso ? new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeZone: "America/Lima" }).format(new Date(iso)) : null;
}

/** Ficha de un certificado en el portal (§20): estado, obra, datos certificados y huellas. */
export default async function CertificatePage({ params }: { params: Params }) {
  const certificate = await getCertificate(certificateKey((await params).token));
  if (!certificate) return <NotFound />;

  const { artwork, data } = certificate;
  const status = CERTIFICATE_STATUS[certificate.status];
  const obra = data?.obra;
  const size = obra?.alto_cm && obra?.ancho_cm
    ? `${obra.alto_cm} × ${obra.ancho_cm}${obra.profundidad_cm ? ` × ${obra.profundidad_cm}` : ""} cm`
    : null;

  return (
    <>
      <section className={`vf-status is-${certificate.status}`}>
        <div className="wrap">
          <div className="vf-status-row">
            <StatusIcon status={certificate.status} />
            <div>
              <p className="vf-status-label">{status.label}</p>
              <h1>{certificate.number}</h1>
              <p>{status.text}</p>
              {certificate.status === "anulado" && certificate.revoke_reason ? (
                <p className="vf-reason">Motivo: {certificate.revoke_reason} {certificate.revoked_at ? `(${formatDate(certificate.revoked_at)})` : null}</p>
              ) : null}
              {certificate.status === "reemplazado" && certificate.replaced_by ? (
                <Link href={`/verificar/${encodeURIComponent(certificate.replaced_by)}`} className="vf-reason">
                  Ver el certificado vigente {certificate.replaced_by} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="vf-body">
        <div className="wrap vf-cert">
          <div className="vf-artwork">
            {artwork?.image_url ? <img src={artwork.image_url} alt={artwork.title} /> : null}
          </div>

          <div>
            <div className="eyebrow">Obra certificada</div>
            <h2 className="vf-title">{obra?.titulo ?? artwork?.title}</h2>
            <p className="vf-artist">{obra?.artista ?? artwork?.artist_name}</p>

            <dl className="vf-details">
              {[
                ["Código ArtHub", obra?.codigo ?? artwork?.code],
                ["Técnica", obra?.tecnica],
                ["Soporte", obra?.soporte],
                ["Medidas", size],
                ["Año", obra?.anio ? String(obra.anio) : null],
                ["Emitido", formatDate(certificate.issued_at)],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>

            <div className="vf-actions">
              {certificate.pdf_url ? (
                <a href={certificate.pdf_url} className="btn btn-outline-dark" target="_blank" rel="noreferrer">Descargar el PDF</a>
              ) : null}
              {artwork?.id ? <Link href={`/obras/${artwork.id}`} className="btn btn-ghost">Ver la obra en el catálogo →</Link> : null}
            </div>
          </div>
        </div>

        <div className="wrap vf-grid vf-grid-tight">
          <div className="vf-panel">
            <h2>Huellas digitales</h2>
            <p>Una huella SHA-256 cambia por completo si se altera un solo carácter del archivo o de los datos.</p>
            <Fingerprint label="Datos certificados (impresa en el PDF)" value={certificate.data_sha256} />
            <Fingerprint label="Archivo PDF emitido" value={certificate.pdf_sha256} />
            {data?.imagen_principal_sha256 ? <Fingerprint label="Imagen principal de la obra" value={data.imagen_principal_sha256} /> : null}
            {data?.documentos.length ? (
              <>
                <h3>Documentos del expediente incluidos</h3>
                <ul className="vf-docs">
                  {data.documentos.map((d) => (
                    <li key={`${d.titulo}-${d.version}`}>
                      <span>{d.titulo} <small>({DOCUMENT_CATEGORY[d.categoria] ?? d.categoria}, versión {d.version})</small></span>
                      <code>{d.sha256}</code>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="vf-panel">
            <h2>¿Tienes el PDF?</h2>
            <p>Comprueba que es el original emitido para este certificado.</p>
            <PdfCheck expected={certificate} />
          </div>
        </div>
      </section>
    </>
  );
}

function Fingerprint({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="vf-hash">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

function StatusIcon({ status }: { status: PublicCertificate["status"] }) {
  return (
    <svg className="vf-status-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {status === "vigente" ? <path d="m9 12 2 2 4-4" /> : <path d="m9.5 9.5 5 5m0-5-5 5" />}
    </svg>
  );
}

function NotFound() {
  return (
    <section className="vf-head">
      <div className="wrap">
        <div className="eyebrow">Portal de verificación</div>
        <h1>No encontramos ese certificado</h1>
        <p>Revisa el número o vuelve a escanear el código QR. Si el problema sigue, el certificado no fue emitido por ArtHub.</p>
        <Link href="/verificar" className="btn btn-outline-dark" style={{ marginTop: 24 }}>Volver a consultar</Link>
      </div>
    </section>
  );
}
