import { inicioHtml } from "@/lib/pages";

export const metadata = {
  title: "Arthub — Arte cusqueño, validado y certificado",
};

export default function InicioPage() {
  return <div dangerouslySetInnerHTML={{ __html: inicioHtml }} />;
}
