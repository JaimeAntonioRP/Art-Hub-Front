import Script from "next/script";
import Landing from "@/components/Landing";
import "./landing.css";

export const metadata = { title: "Arthub — Art Asset Management" };

export default function LandingPage() {
  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      <Script id="tw-config" strategy="afterInteractive">{`
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Jost', 'ui-sans-serif', 'system-ui'],
                serif: ['Spectral', 'ui-serif', 'Georgia'],
              },
              letterSpacing: { 'widest-2': '0.32em' },
            },
          },
        };
      `}</Script>
      <Landing />
    </>
  );
}
