import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Level9OS — AI for Operations",
  description:
    "We build AI for operations — from planning through execution. Six production products, 138 workflows, 48 domain officers. Operations is not cool. We made it cool.",
  openGraph: {
    title: "Level9OS — AI for Operations",
    description:
      "AI-powered operations. Planning through execution, governance, and measurement. Built, not advised.",
    url: "https://level9os.com",
    siteName: "Level9OS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
