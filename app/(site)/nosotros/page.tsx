import { nosotrosHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Nosotros" };

export default function NosotrosPage() {
  return <div dangerouslySetInnerHTML={{ __html: nosotrosHtml }} />;
}
