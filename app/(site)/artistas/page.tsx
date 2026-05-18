import { artistasHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Índice de Valor Artístico" };

export default function ArtistasPage() {
  return <div dangerouslySetInnerHTML={{ __html: artistasHtml }} />;
}
