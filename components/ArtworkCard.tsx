import Link from "next/link";
import { AVAILABILITY_LABEL } from "@/lib/api";
import type { FeaturedArtwork } from "@/lib/content";
import { formatArtworkPrice } from "@/lib/format";
import "@/components/blocks/blocks.css";

/** Tarjeta de obra sin caja: la imagen manda. Se usa en la portada, el catálogo y la ficha. */
export function ArtworkCard({ artwork }: { artwork: FeaturedArtwork }) {
  return (
    <Link href={`/obras/${artwork.id}`} className="blk-work">
      <div className="blk-work-img">
        {artwork.image_url ? <img src={artwork.image_url} alt={artwork.title} loading="lazy" /> : null}
        {artwork.availability !== "disponible" ? (
          <span className="blk-work-badge">{AVAILABILITY_LABEL[artwork.availability]}</span>
        ) : null}
      </div>
      <span className="blk-work-artist">{artwork.artist_name}</span>
      <h3 className="serif">{artwork.title}</h3>
      <span className="blk-work-meta">{[artwork.technique, artwork.dimensions].filter(Boolean).join(" · ")}</span>
      <strong className="blk-work-price">{formatArtworkPrice(artwork)}</strong>
    </Link>
  );
}
