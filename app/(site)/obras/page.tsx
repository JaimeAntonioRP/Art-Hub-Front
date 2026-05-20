"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Artwork } from "@/lib/api";

function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ObrasPage() {
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listArtworks()
      .then(setArtworks)
      .catch(() => setError("No fue posible cargar el catalogo."));
  }, []);

  return (
    <section className="section" style={{ background: "var(--paper)" }}>
      <div className="wrap">
        <div className="eyebrow">Catalogo en vivo</div>
        <h1 className="h-display" style={{ fontSize: 48, margin: "8px 0 28px" }}>
          Obras <em>disponibles</em>
        </h1>

        {error ? (
          <p className="muted">{error}</p>
        ) : !artworks ? (
          <p className="muted">Cargando obras...</p>
        ) : artworks.length === 0 ? (
          <p className="muted">No hay obras disponibles en este momento.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {artworks.map((a) => (
              <Link
                key={a.id}
                href={`/obras/${a.id}`}
                className="card"
                style={{
                  background: "var(--paper-card)",
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4 / 3",
                    background: `center/cover no-repeat url(${a.image_url})`,
                  }}
                />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="kicker">{a.artist_name}</div>
                  <h3 className="serif" style={{ fontSize: 20, lineHeight: 1.2 }}>
                    {a.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <strong style={{ color: "var(--oro-cusco)" }}>
                      {formatPrice(a.price)}
                    </strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
