import Link from "next/link";
import { isInternal } from "@/lib/content";

/** Encabezado de sección: antetítulo, título e introducción opcionales. */
export function SectionHead({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  align?: "center" | "left";
}) {
  if (!eyebrow && !title && !intro) return null;
  return (
    <div className={align === "center" ? "sec-head" : "sec-head-left"}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      {title ? <h2>{title}</h2> : null}
      {intro ? <p>{intro}</p> : null}
    </div>
  );
}

export function ButtonLink({
  label,
  url,
  variant,
}: {
  label?: string;
  url?: string;
  variant: "gold" | "outline-dark" | "outline-light";
}) {
  if (!label || !url) return null;
  const className = `btn btn-${variant} btn-lg`;
  return isInternal(url) ? (
    <Link href={url} className={className}>{label}</Link>
  ) : (
    <a href={url} className={className} target={url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{label}</a>
  );
}

/** Texto con párrafos separados por una línea en blanco (así se escribe en el panel). */
export function Paragraphs({ text, className }: { text?: string; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className={className}>{p.trim()}</p>
      ))}
    </>
  );
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  obra: <><rect x="3" y="4" width="18" height="14" rx="1.5" /><path d="M3 15l5-5 4 4 3-3 6 6" /><circle cx="15.5" cy="8.5" r="1.5" /></>,
  artista: <><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><circle cx="11" cy="11" r="2" /></>,
  documento: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  revision: <><path d="M9 11l3 3 8-8" /><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" /></>,
  verificar: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  realidad: <><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></>,
  catalogo: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  contacto: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
};

export function BlockIcon({ name }: { name?: string }) {
  const paths = name ? ICON_PATHS[name] : undefined;
  if (!paths) return null;
  return (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths}
    </svg>
  );
}
