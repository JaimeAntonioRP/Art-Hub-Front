import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArtworkGallery } from "@/components/catalog/ArtworkGallery";
import { RequestForm } from "@/components/catalog/RequestForm";
import { Paragraphs } from "@/components/blocks/shared";
import { AVAILABILITY_LABEL, type ArtworkDetail } from "@/lib/api";
import { getArtwork } from "@/lib/catalog";
import { formatArtworkPrice } from "@/lib/format";
import "@/components/catalog/catalog.css";
import "@/components/catalog/artwork.css";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const artwork = await getArtwork(Number((await params).id));
  if (!artwork) return {};

  const description = artwork.description?.slice(0, 160)
    ?? [artwork.artist_name, artwork.technique, artwork.dimensions].filter(Boolean).join(" · ");

  return {
    title: `${artwork.title} · ${artwork.artist_name}`,
    description,
    openGraph: artwork.image_url ? { images: [{ url: artwork.image_url, alt: artwork.title }] } : undefined,
  };
}

/** Ficha pública de una obra (§13) con su solicitud comercial (§14). */
export default async function ArtworkPage({ params }: { params: Params }) {
  const artwork = await getArtwork(Number((await params).id));
  if (!artwork) notFound();

  const canBuy = artwork.availability === "disponible" || artwork.availability === "reservada";
  const artist = artwork.artist;

  return (
    <>
      <section className="art-top">
        <div className="wrap">
          <nav className="art-crumbs" aria-label="Ruta">
            <Link href="/obras">Colección</Link>
            {artist?.has_page ? <><span aria-hidden="true">/</span><Link href={`/artistas/${artist.slug}`}>{artist.name}</Link></> : null}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{artwork.title}</span>
          </nav>

          <div className="art-layout">
            <ArtworkGallery title={artwork.title} images={artwork.images} modelUrl={artwork.model_3d_url} />

            <div className="art-info">
              {artist?.has_page
                ? <Link href={`/artistas/${artist.slug}`} className="art-artist">{artwork.artist_name}</Link>
                : <span className="art-artist">{artwork.artist_name}</span>}
              <h1>{artwork.title}</h1>
              <p className="art-sub">{[artwork.technique, artwork.year].filter(Boolean).join(", ")}</p>

              <div className="art-buy">
                <strong className="art-price">{formatArtworkPrice(artwork)}</strong>
                <span className={`art-status is-${artwork.availability}`}>{AVAILABILITY_LABEL[artwork.availability]}</span>
              </div>
              <div className="art-ctas">
                <a href="#solicitud" className="btn btn-gold btn-lg">
                  {canBuy ? "Me interesa esta obra" : "Pedir información"}
                </a>
                {artwork.certificate?.verification_token && artwork.certificate.status === "vigente" ? (
                  <Link href={`/verificar/${artwork.certificate.verification_token}`} className="btn btn-outline-dark btn-lg">
                    Verificar autenticidad
                  </Link>
                ) : null}
              </div>
              <p className="art-trust">Expediente revisado por ArtHub · Sin pagos en línea: un asesor te acompaña en la compra.</p>

              <Details artwork={artwork} />

              {artwork.description ? (
                <div className="art-text">
                  <h2>Sobre la obra</h2>
                  <Paragraphs text={artwork.description} />
                </div>
              ) : null}
              {artwork.history_notes ? (
                <div className="art-text">
                  <h2>Historia y procedencia</h2>
                  <Paragraphs text={artwork.history_notes} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="solicitud" className="art-request">
        <div className="wrap art-request-grid">
          <div>
            <div className="eyebrow">Solicitud</div>
            <h2>{canBuy ? "¿Te interesa esta obra?" : "¿Quieres saber más?"}</h2>
            <p>
              Déjanos tus datos y un asesor de ArtHub te escribirá para resolver tus dudas
              {canBuy ? ", reservarla y coordinar el pago y la entrega" : ""}. No cobramos nada por consultar.
            </p>
            <div className="art-request-work">
              {artwork.image_url ? <img src={artwork.image_url} alt="" /> : null}
              <div>
                <strong>{artwork.title}</strong>
                <span>{artwork.artist_name} · {artwork.code}</span>
              </div>
            </div>
          </div>
          <RequestForm artworkId={artwork.id} artworkTitle={artwork.title} canBuy={canBuy} />
        </div>
      </section>

      {artist ? (
        <section className="art-more">
          <div className="wrap">
            <div className="art-artist-card">
              {artist.photo_url ? <img src={artist.photo_url} alt={artist.name} /> : <span aria-hidden="true">{artist.name.charAt(0)}</span>}
              <div>
                <div className="eyebrow">El artista</div>
                <h2>{artist.name}</h2>
                <p>{[artist.specialty, artist.origin].filter(Boolean).join(" · ")}</p>
              </div>
              {artist.has_page ? <Link href={`/artistas/${artist.slug}`} className="blk-more">Ver perfil →</Link> : null}
            </div>

            {artwork.related.length ? (
              <>
                <div className="blk-row-head">
                  <h2>Más obras de {artist.name}</h2>
                  {artist.has_page ? <Link href={`/obras?artist=${artist.slug}`} className="blk-more">Ver todas →</Link> : null}
                </div>
                <div className="blk-works">
                  {artwork.related.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

/** Ficha técnica: solo las filas con dato. */
function Details({ artwork }: { artwork: ArtworkDetail }) {
  const rows: [string, string | null | undefined][] = [
    ["Código", artwork.code],
    ["Técnica", artwork.technique],
    ["Soporte", artwork.support],
    ["Medidas", artwork.dimensions],
    ["Peso", artwork.weight_kg ? `${Number(artwork.weight_kg)} kg` : null],
    ["Año", artwork.year ? String(artwork.year) : null],
  ];

  return (
    <dl className="art-details">
      {rows.filter(([, v]) => v).map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
