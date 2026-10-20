import { CmsPage, cmsMetadata } from "@/components/blocks/CmsPage";

/** Contenido editable en el panel: Sitio web → Páginas → «nosotros». */
export const generateMetadata = () => cmsMetadata("nosotros");

export default function NosotrosPage() {
  return <CmsPage slug="nosotros" />;
}
