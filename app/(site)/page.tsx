"use client";

import dynamic from "next/dynamic";
import { inicioHtml } from "@/lib/pages";

// split the static HTML at the painting slot
const SLOT = "__PAINTING_SLOT__";
const slotIdx = inicioHtml.indexOf(SLOT);
const beforeSlot = slotIdx >= 0 ? inicioHtml.slice(0, slotIdx) : inicioHtml;
const afterSlot  = slotIdx >= 0 ? inicioHtml.slice(slotIdx + SLOT.length) : "";

// lazy-load to keep SSR clean (uses browser APIs + fetch)
const FeaturedArtworkHero = dynamic(
  () => import("@/components/FeaturedArtworkHero"),
  { ssr: false }
);

export default function InicioPage() {
  if (slotIdx < 0) {
    // fallback: render whole page as-is if slot not found
    return <div dangerouslySetInnerHTML={{ __html: inicioHtml }} />;
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: beforeSlot }} />
      <FeaturedArtworkHero />
      <div dangerouslySetInnerHTML={{ __html: afterSlot }} />
    </>
  );
}
