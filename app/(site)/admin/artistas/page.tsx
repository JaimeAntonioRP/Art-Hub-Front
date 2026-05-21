"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api, type Artist } from "@/lib/api";
import { errorBoxStyle, fieldStyle, inputStyle, labelStyle } from "@/components/AuthCard";

type FormState = {
  name: string;
  slug: string;
  origin: string;
  birth_year: string;
  death_year: string;
  specialty: string;
  bio: string;
  profile_image_url: string;
  featured: boolean;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  origin: "Cusco, Perú",
  birth_year: "",
  death_year: "",
  specialty: "",
  bio: "",
  profile_image_url: "",
  featured: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminArtistasPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !token) {
      router.replace("/login?redirect=/admin/artistas");
      return;
    }
    if (user.role !== "admin") router.replace("/");
  }, [user, token, loading, router]);

  const refresh = () => {
    api.listArtists().then(setArtists).catch(() => setError("No se pudo cargar artistas."));
  };

  useEffect(() => {
    if (token && user?.role === "admin") refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => {
        const next = { ...f, [key]: value } as FormState;
        // autogenera slug desde el nombre si no se editó manualmente
        if (key === "name" && !slugTouched && !editingId) {
          next.slug = slugify(String(value));
        }
        return next;
      });
    };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setError(null);
    setMessage("Subiendo imagen...");
    try {
      const result = await api.uploadImage(token, file);
      setForm((f) => ({ ...f, profile_image_url: result.url }));
      setMessage("Imagen subida.");
    } catch {
      setError("No fue posible subir la imagen.");
      setMessage(null);
    }
  };

  const startEdit = (a: Artist) => {
    setEditingId(a.id);
    setSlugTouched(true);
    setForm({
      name: a.name,
      slug: a.slug,
      origin: a.origin,
      birth_year: a.birth_year ? String(a.birth_year) : "",
      death_year: a.death_year ? String(a.death_year) : "",
      specialty: a.specialty,
      bio: a.bio,
      profile_image_url: a.profile_image_url,
      featured: a.featured,
    });
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSlugTouched(false);
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
        name: form.name,
        slug: form.slug,
        origin: form.origin,
        birth_year: form.birth_year ? Number(form.birth_year) : null,
        death_year: form.death_year ? Number(form.death_year) : null,
        specialty: form.specialty,
        bio: form.bio,
        profile_image_url: form.profile_image_url,
        featured: form.featured,
      };
      if (editingId) {
        await api.updateArtist(token, editingId, payload);
        setMessage("Artista actualizado.");
      } else {
        await api.createArtist(token, payload);
        setMessage("Artista creado.");
      }
      cancelEdit();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm("¿Eliminar este artista? No se puede deshacer.")) return;
    try {
      await api.deleteArtist(token, id);
      refresh();
    } catch {
      setError("No fue posible eliminar el artista.");
    }
  };

  if (loading || !user) {
    return (
      <section className="section">
        <div className="wrap">
          <p className="muted">Verificando sesión...</p>
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
      {/* tabs */}
      <div className="wrap" style={{ marginBottom: 28, display: "flex", gap: 10 }}>
        <Link href="/admin" className="btn btn-outline-dark" style={{ padding: "9px 18px", fontSize: 13 }}>
          Obras
        </Link>
        <Link href="/admin/artistas" className="btn btn-gold" style={{ padding: "9px 18px", fontSize: 13 }}>
          Artistas
        </Link>
        <Link href="/admin/marca" className="btn btn-outline-dark" style={{ padding: "9px 18px", fontSize: 13 }}>
          Logo / Marca
        </Link>
      </div>

      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 36 }}>
        {/* formulario */}
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
            {editingId ? "Editar artista" : "Nuevo artista"}
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
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} required value={form.name} onChange={update("name")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Slug (URL)</label>
              <input
                style={inputStyle}
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                }}
                placeholder="ej. jaime-antonio-rodriguez"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Origen</label>
              <input style={inputStyle} required value={form.origin} onChange={update("origin")} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Año nac. (opcional)</label>
                <input style={inputStyle} type="number" value={form.birth_year} onChange={update("birth_year")} />
              </div>
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label style={labelStyle}>Año fall. (opcional)</label>
                <input style={inputStyle} type="number" value={form.death_year} onChange={update("death_year")} />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Especialidad</label>
              <input style={inputStyle} required value={form.specialty} onChange={update("specialty")} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Biografía</label>
              <textarea
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                required
                value={form.bio}
                onChange={update("bio")}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Foto del artista</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                style={{ ...inputStyle, padding: "8px", background: "var(--paper-2)" }}
              />
              {form.profile_image_url ? (
                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={form.profile_image_url}
                    alt="preview"
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--rule)" }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                    value={form.profile_image_url}
                    onChange={update("profile_image_url")}
                    placeholder="o pega una URL / ruta"
                  />
                </div>
              ) : (
                <input
                  style={{ ...inputStyle, marginTop: 8, fontSize: 12 }}
                  value={form.profile_image_url}
                  onChange={update("profile_image_url")}
                  placeholder="o pega una URL o ruta (ej. /artistas/nombre.jpg)"
                />
              )}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={update("featured")}
                style={{ width: 16, height: 16, accentColor: "var(--oro-cusco)" }}
              />
              Artista destacado
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-gold btn-lg"
                style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear artista"}
              </button>
              {editingId ? (
                <button type="button" onClick={cancelEdit} className="btn btn-outline-dark btn-lg">
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        {/* listado */}
        <div>
          <div className="eyebrow">Catálogo de artistas</div>
          <h2 className="serif" style={{ fontSize: 26, margin: "6px 0 18px" }}>
            Artistas registrados
          </h2>

          {!artists ? (
            <p className="muted">Cargando...</p>
          ) : artists.length === 0 ? (
            <p className="muted">Aún no hay artistas.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {artists.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--rule)",
                    borderRadius: 10,
                    padding: 14,
                    display: "grid",
                    gridTemplateColumns: "64px 1fr auto",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={a.profile_image_url}
                    alt={a.name}
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", objectPosition: "center top", border: "1px solid var(--rule)" }}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.endsWith("/placeholder-obra.svg")) el.src = "/placeholder-obra.svg";
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {a.name}
                      {a.featured ? <span style={{ color: "var(--oro-cusco)", marginLeft: 6 }}>★</span> : null}
                    </div>
                    <div className="kicker">{a.specialty}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {a.origin} · {a.total_obras ?? 0} obras
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/artistas/${a.slug}`} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
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
