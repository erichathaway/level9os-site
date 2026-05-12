import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { interWeights, playfairWeights } from "@level9/brand/tokens/typography";
import "./globals.css";

// Canonical weight lists live in @level9/brand/tokens/typography
// (`interWeights`, `playfairWeights`). next/font's SWC plugin requires
// literal array arguments here, so we keep the literals inline AND assert
// at the type level that they match the brand source. If brand updates the
// canonical list, the type assertion below will fail until this file is
// updated to match.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _INTER_WEIGHTS = ["300", "400", "500", "600", "700", "900"] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PLAYFAIR_WEIGHTS = ["400", "700"] as const;
type _Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _interMatch: _Eq<typeof _INTER_WEIGHTS, typeof interWeights> = true;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _playfairMatch: _Eq<typeof _PLAYFAIR_WEIGHTS, typeof playfairWeights> = true;

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Level9OS · We build the half it all runs on",
  description:
    "AI for operations. 6+ production products, 138 workflows, 48 domain officers. We build the half it all runs on. The operational layer that determines whether strategy survives contact with reality.",
  metadataBase: new URL("https://level9os.com"),
  icons: {
    icon: "/icon.svg",
    apple: "/brand/logos/level9/chip.svg",
  },
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
  const isPreview = process.env.VERCEL_ENV === "preview";
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {isPreview && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              zIndex: 9999,
              background: "rgba(139, 92, 246, 0.95)",
              color: "white",
              padding: "4px 12px",
              fontSize: "10px",
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              letterSpacing: "0.1em",
              borderBottomLeftRadius: "6px",
              pointerEvents: "none",
            }}
          >
            PREVIEW · {branch || "rebuild"}
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
