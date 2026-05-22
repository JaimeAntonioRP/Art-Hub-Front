"use client";

import dynamic from "next/dynamic";
import { tecnologiaHtml } from "@/lib/pages";

const TecnologiaVideo = dynamic(
  () => import("@/components/TecnologiaVideo"),
  { ssr: false }
);

export default function TecnologiaPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: tecnologiaHtml }} />
      <TecnologiaVideo />
    </>
  );
}
