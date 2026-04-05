import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Manokalpa — Integrated Wellness & Counselling Platform",
    template: "%s | Manokalpa",
  },
  description:
    "Manokalpa brings professional mental health counselling, self-assessment tools, wellness content, and daily reflection journaling to your fingertips. Your mind matters.",
  keywords: [
    "mental health",
    "counselling",
    "therapy",
    "wellness",
    "psychology",
    "India",
    "online counselling",
  ],
  authors: [{ name: "Manokalpa Wellness" }],
  metadataBase: new URL("https://manokalpa.in"),
  openGraph: {
    title: "Manokalpa — Integrated Wellness & Counselling",
    description: "Professional mental health support, accessible to all.",
    url: "https://manokalpa.in",
    siteName: "Manokalpa",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manokalpa — Integrated Wellness",
    description: "Professional mental health support, accessible to all.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
