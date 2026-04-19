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
  metadataBase: new URL("https://flortasistani.app"),
  title: {
    default: "Flört Asistanı — Özel İlişki Koçun",
    template: "%s · Flört Asistanı",
  },
  description:
    "Crush'ından gelen mesaja saniyeler içinde kopyala-yapıştır hazır cevaplar. Üç tonda, kişiye özel, gerçekten insan gibi.",
  keywords: [
    "ilişki koçu",
    "flört tavsiyesi",
    "mesajlaşma yardımı",
    "crush cevap",
    "flört asistanı",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "Flört Asistanı — Özel İlişki Koçun",
    description: "Crush'ının mesajına nasıl cevap verileceğini biliyor.",
    siteName: "Flört Asistanı",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flört Asistanı",
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
