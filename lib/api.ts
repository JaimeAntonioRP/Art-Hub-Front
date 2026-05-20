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

export type Artwork = {
  id: number;
  title: string;
  artist_name: string;
  price: string;
  description: string;
  image_url: string;
  model_3d_url: string | null;
  status: "available" | "sold";
  certificate?: Certificate | null;
};

export type Certificate = {
  id: number;
  artwork_id: number;
  biometric_hash: string;
  match_percentage: string;
  blockchain_tx_id: string | null;
  contract_address: string | null;
};

export type AuthResponse = {
  user: { id: number; name: string; email: string; role: string; wallet_address: string | null };
  token: string;
};

export const api = {
  listArtworks: () => request<Artwork[]>("/artworks"),
  getArtwork: (id: number) => request<Artwork>(`/artworks/${id}`),
  adminListArtworks: (token: string) =>
    request<Artwork[]>("/admin/artworks", { token }),
  updateArtwork: (
    token: string,
    id: number,
    payload: {
      title: string;
      artist_name: string;
      price: number;
      description: string;
      image_url: string;
      model_3d_url?: string;
    },
  ) => request<Artwork>(`/artworks/${id}`, { method: "PUT", token, body: payload }),
  deleteArtwork: (token: string, id: number) =>
    request<{ message: string }>(`/artworks/${id}`, { method: "DELETE", token }),
  me: (token: string) => request<AuthResponse["user"]>("/me", { token }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    wallet_address?: string;
  }) => request<AuthResponse>("/register", { method: "POST", body: payload }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/login", { method: "POST", body: payload }),

  logout: (token: string) =>
    request<{ message: string }>("/logout", { method: "POST", token }),

  createArtwork: (
    token: string,
    payload: {
      title: string;
      artist_name: string;
      price: number;
      description: string;
      image_url: string;
      model_3d_url?: string;
    },
  ) => request<Artwork>("/artworks", { method: "POST", token, body: payload }),

  uploadImage: (token: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ path: string; url: string }>("/uploads/image", {
      method: "POST",
      token,
      body: form,
    });
  },

  verify: (token: string, artworkId: number, image: File) => {
    const form = new FormData();
    form.append("artwork_id", String(artworkId));
    form.append("image", image);
    return request<{
      certificate: Certificate;
      verification_result: { match_percentage: number; biometric_hash: string; engine?: string };
      is_authentic: boolean;
      fallback: boolean;
    }>("/verify", { method: "POST", token, body: form });
  },

  purchase: (token: string, artworkId: number) =>
    request<{ message: string; artwork: Artwork; blockchain_tx_id: string }>(
      "/purchase",
      { method: "POST", token, body: { artwork_id: artworkId } },
    ),
};

export { API_BASE };
