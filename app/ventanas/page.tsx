import { ventanasHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Ventanas" };

export default function VentanasPage() {
  return <div dangerouslySetInnerHTML={{ __html: ventanasHtml }} />;
}
