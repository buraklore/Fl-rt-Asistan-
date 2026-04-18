import type { Metadata } from "next";
import { Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rizzai.app"),
  title: {
    default: "RizzAI — Yapay Zeka İlişki Koçu",
    template: "%s · RizzAI",
  },
  description:
    "Crush'ından gelen mesaja saniyeler içinde kopyala-yapıştır hazır cevaplar. Üç tonda, kişiye özel, gerçekten insan gibi.",
  keywords: [
    "ilişki koçu",
    "flört tavsiyesi",
    "mesajlaşma yardımı",
    "yapay zeka",
    "crush cevap",
    "rizz",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "RizzAI — Yapay Zeka İlişki Koçu",
    description: "Crush'ının mesajına nasıl cevap verileceğini biliyor.",
    siteName: "RizzAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RizzAI",
    description: "Ne yazacağını zaten biliyor.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`dark ${display.variable} ${body.variable}`}
    >
      <body className="min-h-screen grain">
        {children}
      </body>
    </html>
  );
}
