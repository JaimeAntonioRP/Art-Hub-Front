import Link from "next/link";
import { AVAILABILITY_LABEL } from "@/lib/api";
import type { Block, FeaturedArtwork } from "@/lib/content";
import { formatArtworkPrice } from "@/lib/format";
import { BlockIcon, ButtonLink, Paragraphs, SectionHead } from "./shared";
import "./blocks.css";

type DataOf<T extends Block["type"]> = Extract<Block, { type: T }>["data"];

/** Dibuja los bloques de una página tal como se armaron en el panel. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "hero": return <Hero key={i} data={block.data} />;
          case "text": return <TextBlock key={i} data={block.data} />;
          case "features": return <Features key={i} data={block.data} />;
          case "steps": return <Steps key={i} data={block.data} />;
          case "image_text": return <ImageText key={i} data={block.data} />;
          case "featured_artworks": return <FeaturedArtworks key={i} data={block.data} />;
          case "team": return <Team key={i} data={block.data} />;
          case "video": return <Video key={i} data={block.data} />;
          case "faq": return <Faq key={i} data={block.data} />;
          case "cta": return <Cta key={i} data={block.data} />;
          default: return null; // tipo nuevo en el panel que este frontend aún no conoce
        }
      })}
    </>
  );
}

function Hero({ data }: { data: DataOf<"hero"> }) {
  const artwork = data.show_featured_artwork ? data.artworks?.[0] : undefined;
  const image = artwork?.image_url ?? data.image_url;

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          {data.eyebrow ? <span className="eyebrow">{data.eyebrow}</span> : null}
          <h1>
            {data.title}
            {data.highlight ? <> <em>{data.highlight}</em></> : null}
          </h1>
          {data.text ? <p className="lede">{data.text}</p> : null}
          <div className="blk-actions">
            <ButtonLink label={data.primary_label} url={data.primary_url} variant="gold" />
            <ButtonLink label={data.secondary_label} url={data.secondary_url} variant="outline-dark" />
          </div>
        </div>
        {image ? (
          <figure className="blk-hero-figure">
            <img src={image} alt={artwork ? `${artwork.title}, de ${artwork.artist_name}` : ""} />
            {artwork ? (
              <figcaption>
                <Link href={`/obras/${artwork.id}`}>
                  <b>{artwork.title}</b> · {artwork.artist_name}
                </Link>
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: DataOf<"text"> }) {
  return (
    <section className="section-tight">
      <div className="wrap blk-text">
        <SectionHead eyebrow={data.eyebrow} title={data.title} align="left" />
        <Paragraphs text={data.body} />
      </div>
    </section>
  );
}

function Features({ data }: { data: DataOf<"features"> }) {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <div className="blk-cards">
          {data.items.map((item, i) => (
            <div key={i} className="feat-card">
              <BlockIcon name={item.icon} />
              <h4>{item.title}</h4>
              {item.text ? <p>{item.text}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ data }: { data: DataOf<"steps"> }) {
  return (
    <section className="section blk-steps-section">
      <div className="wrap">
        <SectionHead eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <ol className="blk-steps">
          {data.items.map((item, i) => (
            <li key={i}>
              <span className="blk-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h4>{item.title}</h4>
              {item.text ? <p>{item.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ImageText({ data }: { data: DataOf<"image_text"> }) {
  return (
    <section className="section">
      <div className={`wrap blk-image-text${data.image_side === "left" ? " is-left" : ""}`}>
        <div>
          <SectionHead eyebrow={data.eyebrow} title={data.title} align="left" />
          <Paragraphs text={data.text} className="muted" />
          <div className="blk-actions">
            <ButtonLink label={data.primary_label} url={data.primary_url} variant="gold" />
          </div>
        </div>
        {data.image_url ? <img src={data.image_url} alt="" className="blk-image" /> : null}
      </div>
    </section>
  );
}

function FeaturedArtworks({ data }: { data: DataOf<"featured_artworks"> }) {
  if (!data.artworks.length) return null;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead eyebrow={data.eyebrow} title={data.title} />
        <div className="blk-works">
          {data.artworks.map((a) => <ArtworkCard key={a.id} artwork={a} />)}
        </div>
        {data.button_label ? (
          <div className="blk-center">
            <ButtonLink label={data.button_label} url="/obras" variant="outline-dark" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ArtworkCard({ artwork }: { artwork: FeaturedArtwork }) {
  return (
    <Link href={`/obras/${artwork.id}`} className="blk-work">
      <div className="blk-work-img">
        {artwork.image_url ? <img src={artwork.image_url} alt={artwork.title} loading="lazy" /> : null}
        {artwork.availability !== "disponible" ? (
          <span className="blk-work-badge">{AVAILABILITY_LABEL[artwork.availability]}</span>
        ) : null}
      </div>
      <div className="blk-work-body">
        <span className="kicker">{artwork.artist_name}</span>
        <h3 className="serif">{artwork.title}</h3>
        <span className="muted blk-work-meta">{[artwork.technique, artwork.year, artwork.dimensions].filter(Boolean).join(" · ")}</span>
        <strong className="blk-work-price">{formatArtworkPrice(artwork)}</strong>
      </div>
    </Link>
  );
}

function Team({ data }: { data: DataOf<"team"> }) {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead eyebrow={data.eyebrow} title={data.title} intro={data.intro} />
        <div className="blk-team">
          {data.members.map((m) => (
            <article key={m.name} className="blk-member">
              {m.photo_url ? <img src={m.photo_url} alt={m.name} className="blk-member-photo" /> : <div className="blk-member-photo" aria-hidden="true">{m.name.charAt(0)}</div>}
              {m.role ? <span className="chip chip-gold">{m.role}</span> : null}
              <h3 className="serif">{m.name}</h3>
              {m.role_label ? <span className="kicker">{m.role_label}</span> : null}
              {m.bio ? <p className="muted">{m.bio}</p> : null}
              {m.institutions?.length ? (
                <ul className="blk-tags">
                  {m.institutions.map((inst) => <li key={inst}>{inst}</li>)}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Video({ data }: { data: DataOf<"video"> }) {
  return (
    <section className="section surface-dark blk-video-section">
      <div className="wrap">
        <SectionHead eyebrow={data.eyebrow} title={data.title} intro={data.text} />
        <video className="blk-video" src={data.video_url} poster={data.poster_url} controls preload="metadata" playsInline />
      </div>
    </section>
  );
}

function Faq({ data }: { data: DataOf<"faq"> }) {
  return (
    <section className="section" id="preguntas">
      <div className="wrap blk-faq">
        <SectionHead title={data.title} />
        {data.items.map((item, i) => (
          <details key={i}>
            <summary>{item.question}</summary>
            <p className="muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Cta({ data }: { data: DataOf<"cta"> }) {
  return (
    <section className="cta-band">
      <div className="wrap grid">
        <div>
          <h2>{data.title}</h2>
          {data.text ? <p>{data.text}</p> : null}
        </div>
        <div className="actions">
          <ButtonLink label={data.primary_label} url={data.primary_url} variant="gold" />
          <ButtonLink label={data.secondary_label} url={data.secondary_url} variant="outline-light" />
        </div>
      </div>
    </section>
  );
}
