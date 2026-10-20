import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Páginas de inversión retiradas: el plan excluye fraccionamiento y tokenización (§29.6).
  async redirects() {
    return [
      { source: "/inversionistas", destination: "/obras", permanent: false },
      { source: "/ventanas", destination: "/obras", permanent: false },
    ];
  },
};

export default nextConfig;
