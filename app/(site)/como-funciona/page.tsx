import { comoFuncionaHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Cómo funciona" };

export default function ComoFuncionaPage() {
  return <div dangerouslySetInnerHTML={{ __html: comoFuncionaHtml }} />;
}
