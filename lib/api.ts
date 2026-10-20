const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export type ArtworkStatus =
  | "borrador"
  | "en_revision"
  | "observado"
  | "rechazado"
  | "aprobado"
  | "publicado"
  | "despublicado";

export type Availability = "disponible" | "reservada" | "vendida" | "no_venta";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  no_venta: "No a la venta",
};

export type ArtworkImage = {
  id: number;
  kind: "principal" | "adicional" | "posterior" | "detalle" | "firma";
  url: string;
  position: number;
  is_primary: boolean;
};

export type Artwork = {
  id: number;
  code: string;
  artist_id: number;
  title: string;
  artist_name: string;
  price: string | null;
  currency: "PEN" | "USD";
  show_price: boolean;
  description: string | null;
  technique?: string | null;
  support?: string | null;
  year?: number | null;
  dimensions?: string | null;
  height_cm?: string | null;
  width_cm?: string | null;
  depth_cm?: string | null;
  image_url: string | null;
  images?: ArtworkImage[];
  model_3d_url: string | null;
  status: ArtworkStatus;
  availability: Availability;
  certificate?: Certificate | null;
};

export type Certificate = {
  id: number;
  artwork_id: number;
  verification_token: string | null;
  status: "vigente" | "anulado" | "reemplazado";
  created_at?: string;
};

export type Role = "admin" | "artista" | "comprador";

export type ArtistStatus = "pendiente" | "observado" | "aprobado" | "rechazado" | "inactivo";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  /** Solo para artistas: estado del perfil y enlace a su panel. */
  artist_status?: ArtistStatus | null;
  artist_panel_url?: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type Artist = {
  id: number;
  name: string;
  slug: string;
  origin: string;
  birth_year: number | null;
  death_year: number | null;
  specialty: string;
  bio: string;
  profile_image_url: string | null;
  /** URL lista para usar: rutas antiguas del sitio o archivos subidos desde el panel. */
  photo_url: string | null;
  featured: boolean;
  total_obras?: number;
};

export const api = {
  listArtists: () => request<Artist[]>("/artists"),
  getArtist: (slug: string) =>
    request<{ artist: Artist; artworks: Artwork[] }>(`/artists/${slug}`),

  listArtworks: () => request<Artwork[]>("/artworks"),
  getArtwork: (id: number) => request<Artwork>(`/artworks/${id}`),
  me: (token: string) => request<AuthResponse["user"]>("/me", { token }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: "comprador" | "artista";
  }) => request<AuthResponse>("/register", { method: "POST", body: payload }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => request<{ message: string }>("/reset-password", { method: "POST", body: payload }),

  updateMe: (
    token: string,
    payload: Partial<{
      name: string;
      email: string;
      current_password: string;
      password: string;
      password_confirmation: string;
    }>,
  ) => request<AuthUser>("/me", { method: "PUT", token, body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/login", { method: "POST", body: payload }),

  logout: (token: string) =>
    request<{ message: string }>("/logout", { method: "POST", token }),

  getCertificateByToken: (token: string) =>
    request<{ certificate: Certificate; artwork: Artwork }>(`/certificates/${token}`),
};

/** Raíz del backend, donde viven los paneles de Filament (/admin y /artista). */
const PANEL_BASE = API_BASE.replace(/\/api\/?$/, "");

export { API_BASE, PANEL_BASE };
