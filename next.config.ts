import type { NextConfig } from "next";

/** Raíz del backend (sin /api): ahí viven los paneles de Filament. */
const backendUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Páginas de inversión retiradas: el plan excluye fraccionamiento y tokenización (§29.6).
      { source: "/inversionistas", destination: "/obras", permanent: false },
      { source: "/ventanas", destination: "/obras", permanent: false },
      // La administración se hace en el panel del backend.
      { source: "/admin/:path*", destination: `${backendUrl}/admin`, permanent: false },
    ];
  },
};

export default nextConfig;
