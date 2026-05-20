"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artwork } from "@/lib/api";

function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ObraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const artworkId = Number(id);
  const router = useRouter();
  const { user, token } = useAuth();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getArtwork(artworkId)
      .then((a) => setArtwork(a))
      .catch(() => setError("No se encontro la obra."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [artworkId]);

  const handlePurchase = async () => {
    if (!token) {
      router.push(`/login?redirect=/obras/${artworkId}`);
      return;
    }
    setBuying(true);
    setError(null);
    setMessage(null);
    try {
      const result = await api.purchase(token, artworkId);
      setArtwork(result.artwork);
      setMessage(
        `Compra confirmada. Transaccion blockchain: ${result.blockchain_tx_id.slice(0, 22)}...`,
      );
    } catch {
      setError("No fue posible completar la compra.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Cargando obra...</p>
        </div>
      </section>
    );
  }

  if (!artwork) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">{error ?? "Obra no encontrada."}</p>
          <Link href="/obras" className="btn btn-outline-dark" style={{ marginTop: 16 }}>
            ← Volver al catalogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48 }}>
        <div>
          <div
            style={{
              aspectRatio: "4 / 5",
              background: `center/cover no-repeat url(${artwork.image_url})`,
              borderRadius: 12,
              border: "1px solid var(--rule)",
            }}
          />
          {artwork.model_3d_url ? (
            <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Modelo 3D disponible:{" "}
              <a href={artwork.model_3d_url} target="_blank" rel="noreferrer">
                ver en AR
              </a>
            </p>
          ) : null}
        </div>

        <div>
          <div className="kicker">{artwork.artist_name}</div>
          <h1 className="h-display" style={{ fontSize: 44, margin: "8px 0 12px" }}>
            {artwork.title}
          </h1>
          <p style={{ marginTop: 0 }}>{artwork.description}</p>

          <div
            style={{
              marginTop: 24,
              padding: "20px 22px",
              background: "var(--paper-2)",
              border: "1px solid var(--rule)",
              borderRadius: 12,
            }}
          >
            <div className="eyebrow">Precio</div>
            <div
              style={{
                fontSize: 32,
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--oro-cusco)",
              }}
            >
              {formatPrice(artwork.price)}
            </div>
            <div className="kicker" style={{ marginTop: 12 }}>
              Estado:{" "}
              <strong style={{ color: artwork.status === "available" ? "var(--quenua)" : "var(--terracota)" }}>
                {artwork.status === "available" ? "Disponible" : "Vendida"}
              </strong>
            </div>
          </div>

          {artwork.certificate ? (
            <div
              style={{
                marginTop: 18,
                padding: "16px 20px",
                background: "#fff",
                border: "1px solid var(--rule)",
                borderRadius: 12,
                fontSize: 13.5,
              }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>Certificado biometrico</div>
              <div>
                Match IA: <strong>{artwork.certificate.match_percentage}%</strong>
              </div>
              <div style={{ marginTop: 4, wordBreak: "break-all" }}>
                Hash: <code>{artwork.certificate.biometric_hash.slice(0, 32)}...</code>
              </div>
              {artwork.certificate.blockchain_tx_id ? (
                <div style={{ marginTop: 4, wordBreak: "break-all" }}>
                  Tx: <code>{artwork.certificate.blockchain_tx_id.slice(0, 32)}...</code>
                </div>
              ) : null}
            </div>
          ) : null}

          {message ? (
            <div
              style={{
                marginTop: 18,
                padding: "10px 14px",
                background: "#EAF2E6",
                border: "1px solid #7A846B55",
                color: "#3D4A2E",
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              {message}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 18,
                padding: "10px 14px",
                background: "#FBECE6",
                border: "1px solid #C56A4A55",
                color: "#7B2E18",
                borderRadius: 8,
                fontSize: 13.5,
              }}
            >
              {error}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={handlePurchase}
              disabled={buying || artwork.status !== "available"}
              className="btn btn-gold btn-lg"
              style={{ opacity: buying || artwork.status !== "available" ? 0.55 : 1 }}
            >
              {artwork.status !== "available"
                ? "No disponible"
                : buying
                  ? "Procesando..."
                  : user
                    ? "Comprar ahora"
                    : "Iniciar sesion para comprar"}
            </button>
            <Link href="/obras" className="btn btn-outline-dark btn-lg">
              ← Catalogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
