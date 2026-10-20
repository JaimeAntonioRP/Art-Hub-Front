import { CmsPage, cmsMetadata } from "@/components/blocks/CmsPage";

/** Contenido editable en el panel: Sitio web → Páginas → «como-funciona». */
export const generateMetadata = () => cmsMetadata("como-funciona");

export default function ComoFuncionaPage() {
  return <CmsPage slug="como-funciona" />;
}
