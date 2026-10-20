import { CmsPage, cmsMetadata } from "@/components/blocks/CmsPage";

/** Contenido editable en el panel: Sitio web → Páginas → «tecnologia». */
export const generateMetadata = () => cmsMetadata("tecnologia");

export default function TecnologiaPage() {
  return <CmsPage slug="tecnologia" />;
}
