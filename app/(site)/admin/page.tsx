"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artwork } from "@/lib/api";
import {
  errorBoxStyle,
  fieldStyle,
  inputStyle,
  labelStyle,
} from "@/components/AuthCard";

type FormState = {
  title: string;
  artist_name: string;
  price: string;
  description: string;
  image_url: string;
  model_3d_url: string;
};

const EMPTY: FormState = {
  title: "",
  artist_name: "",
  price: "",
  description: "",
  image_url: "",
  model_3d_url: "",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[] | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace("/login?redirect=/admin");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, token, loading, router]);

  const refresh = () => {
    if (!token) return;
    api
      .adminListArtworks(token)
      .then(setArtworks)
      .catch(() => setError("No fue posible cargar el listado."));
  };

  useEffect(() => {
    if (token && user?.role === "admin") refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setError(null);
    setMessage("Subiendo imagen...");
    try {
      const result = await api.uploadImage(token, file);
      setForm((f) => ({ ...f, image_url: result.url }));
      setMessage("Imagen subida correctamente.");
    } catch {
      setError("No fue posible subir la imagen.");
      setMessage(null);
    }
  };

  const startEdit = (a: Artwork) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      artist_name: a.artist_name,
      price: String(a.price),
      description: a.description,
      image_url: a.image_url,
      model_3d_url: a.model_3d_url ?? "",
    });
    setMessage(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        title: form.title,
        artist_name: form.artist_name,
        price: Number(form.price),
        description: form.description,
        image_url: form.image_url,
        model_3d_url: form.model_3d_url || undefined,
      };
      if (editingId) {
        await api.updateArtwork(token, editingId, payload);
        setMessage("Obra actualizada.");
      } else {
        await api.createArtwork(token, payload);
        setMessage("Obra creada.");
      }
      setForm(EMPTY);
      setEditingId(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Eliminar esta obra? Esta accion no se puede deshacer.")) return;
    try {
      await api.deleteArtwork(token, id);
      refresh();
    } catch {
      setError("No fue posible eliminar la obra.");
    }
  };

  if (loading || !user) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Verificando sesion...</p>
        </div>
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Acceso restringido a administradores.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 36 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--rule)",
            borderRadius: 12,
            padding: 28,
            height: "fit-content",
          }}
        >
          <div className="eyebrow">Panel</div>
          <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>
            {editingId ? "Editar obra" : "Nueva obra"}
          </h2>

          {error ? <div style={errorBoxStyle}>{error}</div> : null}
          {message ? (
            <div
              style={{
                background: "#EAF2E6",
                border: "1px solid #7A846B55",
                color: "#3D4A2E",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13.5,
                marginBottom: 18,
              }}
            >
              {message}
            </div>
          ) : null}

          <form onSubmit={onSubmit} noValidate>
            <div style={fieldStyle}>
              <label style={labelStyle}>Titulo</label>
              <input style={inputStyle} required value={form.title} onChange={update("title")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Artista</label>
              <input style={inputStyle} required value={form.artist_name} onChange={update("artist_name")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Precio (USD)</label>
              <input
                style={inputStyle}
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={update("price")}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Descripcion</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                required
                value={form.description}
                onChange={update("description")}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Imagen de la obra</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                style={{ ...inputStyle, padding: "8px", background: "var(--paper-2)" }}
              />
              {form.image_url ? (
                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={form.image_url}
                    alt="preview"
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--rule)" }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                    type="url"
                    value={form.image_url}
                    onChange={update("image_url")}
                    placeholder="o pega una URL"
                  />
                </div>
              ) : (
                <input
                  style={{ ...inputStyle, marginTop: 8, fontSize: 12 }}
                  type="url"
                  value={form.image_url}
                  onChange={update("image_url")}
                  placeholder="o pega una URL"
                />
              )}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>URL modelo 3D (opcional)</label>
              <input style={inputStyle} type="url" value={form.model_3d_url} onChange={update("model_3d_url")} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-gold btn-lg"
                style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear obra"}
              </button>
              {editingId ? (
                <button type="button" onClick={cancelEdit} className="btn btn-outline-dark btn-lg">
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div>
          <div className="eyebrow">Inventario completo</div>
          <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>
            Obras registradas
          </h2>

          {!artworks ? (
            <p className="muted">Cargando...</p>
          ) : artworks.length === 0 ? (
            <p className="muted">Aun no hay obras.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {artworks.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--rule)",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gridTemplateColumns: "80px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      background: `center/cover no-repeat url(${a.image_url})`,
                    }}
                  />
                  <div>
                    <div className="kicker">{a.artist_name}</div>
                    <div style={{ fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      ${Number(a.price).toLocaleString("en-US")} · {a.status}
                      {a.certificate ? ` · match ${a.certificate.match_percentage}%` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/obras/${a.id}`} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
                      Ver
                    </Link>
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="btn btn-outline-dark"
                      style={{ padding: "8px 12px", fontSize: 12 }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="btn btn-outline-dark"
                      style={{ padding: "8px 12px", fontSize: 12, borderColor: "#C56A4A", color: "#C56A4A" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
