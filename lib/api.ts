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

/** Obra tal como aparece en el catálogo y en las listas de obras. */
export type ArtworkCard = Pick<
  Artwork,
  "id" | "code" | "title" | "technique" | "year" | "price" | "currency" | "show_price"
  | "availability" | "model_3d_url" | "artist_name" | "image_url" | "dimensions"
> & { artist_slug: string | null };

export type CatalogResponse = {
  data: ArtworkCard[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  /** Opciones de los filtros, calculadas sobre todo el catálogo publicado. */
  facets: {
    artists: { slug: string; name: string; total: number }[];
    techniques: string[];
    price: { min: number; max: number };
  };
};

export const CATALOG_SORTS = {
  recent: "Más recientes",
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  title: "Título (A–Z)",
} as const;

export type CatalogFilters = {
  q?: string;
  artist?: string;
  technique?: string;
  availability?: Availability;
  price_min?: string;
  price_max?: string;
  sort?: keyof typeof CATALOG_SORTS;
  page?: string;
};

/** Ficha pública de una obra (§13). */
export type ArtworkDetail = ArtworkCard & {
  support: string | null;
  height_cm: string | null;
  width_cm: string | null;
  depth_cm: string | null;
  weight_kg: string | null;
  description: string | null;
  history_notes: string | null;
  status: ArtworkStatus;
  images: Pick<ArtworkImage, "id" | "kind" | "url" | "is_primary">[];
  artist: {
    name: string;
    artistic_name: string | null;
    slug: string;
    origin: string | null;
    specialty: string | null;
    photo_url: string | null;
    /** Solo los perfiles aprobados tienen página pública. */
    has_page: boolean;
  } | null;
  certificate: Pick<Certificate, "verification_token" | "status"> | null;
  related: ArtworkCard[];
};

export type CommercialRequestType = "informacion" | "intencion_compra";

export type CertificateStatus = "vigente" | "anulado" | "reemplazado";

export type Certificate = {
  verification_token: string | null;
  status: CertificateStatus;
};

/** Certificado tal como lo muestra el portal público de verificación (§20). */
export type PublicCertificate = {
  number: string;
  status: CertificateStatus;
  issued_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  /** Número del certificado que lo reemplazó. */
  replaced_by: string | null;
  data: {
    obra: {
      codigo: string; titulo: string; artista: string | null; anio: number | null;
      tecnica: string | null; soporte: string | null;
      alto_cm: string | null; ancho_cm: string | null; profundidad_cm: string | null;
    };
    imagen_principal_sha256: string | null;
    documentos: { titulo: string; categoria: string; version: number; sha256: string }[];
  } | null;
  data_sha256: string | null;
  pdf_sha256: string | null;
  /** Solo al consultar por el token del QR. */
  pdf_url: string | null;
  artwork: { id: number | null; code: string; title: string; artist_name: string | null; image_url: string | null } | null;
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

};

/** Raíz del backend, donde viven los paneles de Filament (/admin y /artista). */
const PANEL_BASE = API_BASE.replace(/\/api\/?$/, "");

export { API_BASE, PANEL_BASE };
