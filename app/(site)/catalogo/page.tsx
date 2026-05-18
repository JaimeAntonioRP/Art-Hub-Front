import { catalogoHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Catálogo de Maestros" };

export default function CatalogoPage() {
  return <div dangerouslySetInnerHTML={{ __html: catalogoHtml }} />;
}
