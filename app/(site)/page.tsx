"use client";

import dynamic from "next/dynamic";
import { inicioHtml } from "@/lib/pages";

// Portal-based: mounts inside .hero .painting without splitting the HTML
const FeaturedArtworkHero = dynamic(
  () => import("@/components/FeaturedArtworkHero"),
  { ssr: false }
);

export default function InicioPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: inicioHtml }} />
      <FeaturedArtworkHero />
    </>
  );
}
