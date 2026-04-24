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
  title: "Level9OS · We build the half it all runs on",
  description:
    "AI for operations. 6+ production products, 138 workflows, 48 domain officers. We build the half it all runs on. The operational layer that determines whether strategy survives contact with reality.",
  metadataBase: new URL("https://level9os.com"),
  openGraph: {
    title: "Level9OS · We build the half it all runs on",
    description:
      "AI for operations. Planning through execution, governance, and measurement. Built, not advised.",
    url: "https://level9os.com",
    siteName: "Level9OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Level9OS · We build the half it all runs on",
    description:
      "AI for operations. 6+ production products. Built, not advised.",
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
