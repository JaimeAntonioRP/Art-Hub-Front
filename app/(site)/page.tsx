import { CmsPage, cmsMetadata } from "@/components/blocks/CmsPage";

/** Contenido editable en el panel: Sitio web → Páginas → «inicio». */
export const generateMetadata = () => cmsMetadata("inicio");

export default function InicioPage() {
  return <CmsPage slug="inicio" />;
}
