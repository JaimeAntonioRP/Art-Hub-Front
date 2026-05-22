"use client";

import dynamic from "next/dynamic";
import { comoFuncionaHtml } from "@/lib/pages";

const ComoFuncionaVideo = dynamic(
  () => import("@/components/ComoFuncionaVideo"),
  { ssr: false }
);

export default function ComoFuncionaPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: comoFuncionaHtml }} />
      <ComoFuncionaVideo />
    </>
  );
}
