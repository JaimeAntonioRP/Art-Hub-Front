import { tecnologiaHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Tecnología" };

export default function TecnologiaPage() {
  return <div dangerouslySetInnerHTML={{ __html: tecnologiaHtml }} />;
}
