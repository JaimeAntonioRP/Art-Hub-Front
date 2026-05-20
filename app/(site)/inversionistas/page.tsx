import { inversionistasHtml } from "@/lib/pages";

export const metadata = { title: "Arthub — Inversionistas" };

export default function InversionistasPage() {
  return <div dangerouslySetInnerHTML={{ __html: inversionistasHtml }} />;
}
