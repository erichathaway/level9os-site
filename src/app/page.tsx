/**
 * Level9OS Homepage — Server wrapper.
 *
 * Exports page-level metadata for SEO, then renders the client-side
 * Conversation homepage (ConversationHomepage) which handles all interaction.
 *
 * A semantic HTML block below the fold provides crawler and noscript
 * visibility without interfering with the interactive JS experience.
 */

import type { Metadata } from "next";
import ConversationHomepage from "@/app/_components/ConversationHomepage";

export const metadata: Metadata = {
  title: "Level9OS · The operating layer where humans and AI agents work together",
  description:
    "Level9OS is the AI operating system for operations leaders. Governance, orchestration, autonomous pods, and measurement. SMB-ready, anti-lock-in, running in production. Introduce an agent. Give it a day. It comes back with what it found.",
  metadataBase: new URL("https://level9os.com"),
  alternates: {
    canonical: "https://level9os.com",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/brand/logos/level9/chip.svg",
  },
  openGraph: {
    title: "Level9OS · The operating layer where humans and AI agents work together",
    description:
      "AI for operations. Governance chassis, autonomous pods, multi-vendor orchestration. Anti-lock-in. SMB-first. Live in production.",
    url: "https://level9os.com",
    siteName: "Level9OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Level9OS · The operating layer where humans and AI agents work together",
    description:
      "AI for operations. Governance, orchestration, measurement. Built, not advised.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Semantic HTML for crawlers and noscript users. Hidden visually
          by the ConversationHomepage overlay but readable by bots and
          screen readers before JS hydration. */}
      <div
        aria-hidden="false"
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h1>Level9OS: The Operating Layer for AI-Native Execution</h1>
        <p>
          Level9OS is the AI operating system built for operations leaders. It learns your operation
          in a day, then runs it. Governance, orchestration, autonomous pods, and measurement. Six
          products live in production. Anti-lock-in. SMB-first. Built on 20-plus years of executive
          operational experience across Microsoft, Credit Suisse, T-Mobile, and S&P Global.
        </p>
        <h2>How it works</h2>
        <p>
          Introduce an agent. Give it access. Give it a day. It comes back and walks you through
          what it found. That is the entry point. No slide deck. No discovery engagement before the
          discovery engagement.
        </p>
        <h2>Products</h2>
        <ul>
          <li>StratOS: AI executive decision room. Live at stratos.lucidorg.com.</li>
          <li>CommandOS: AI middle management, 48 domain officers. Beta.</li>
          <li>OutboundOS: Autonomous outbound pod umbrella. Live.</li>
          <li>LinkupOS: LinkedIn signal pod. Live at linkupos.com.</li>
          <li>ABM Engine: Multi-channel outbound automation. Live.</li>
          <li>AutoCS: Customer service automation. Alpha.</li>
          <li>LucidORG: Measurement platform, ECI scoring. Live at lucidorg.com.</li>
          <li>COO Playbook: 30/90/180 install methodology. Live at thenewcoo.com.</li>
          <li>MAX: Voice interface for operations. Beta.</li>
        </ul>
        <h2>Governance</h2>
        <p>
          18 governance services running under every product. Every action logged. Every dollar
          tracked. Every output gated before it reaches production. Truth enforcement, budget
          control, and identity management. Not a feature. The foundation.
        </p>
        <h2>Three paths to start</h2>
        <ul>
          <li>
            <strong>Startup:</strong> Full packaging. Ready to drive tomorrow. Agent live in 24
            hours, governance on from day one.
          </li>
          <li>
            <strong>Growth:</strong> Point us to your docs. Introduce an agent. It returns with a
            report on what it found.
          </li>
          <li>
            <strong>Enterprise:</strong> Try a department. 30-day proof of production lift. Then
            decide.
          </li>
        </ul>
        <p>
          Contact: <a href="/contact">level9os.com/contact</a>.
          Products: <a href="/products">level9os.com/products</a>.
          Governance: <a href="/governance">level9os.com/governance</a>.
          Architecture: <a href="/architecture">level9os.com/architecture</a>.
        </p>
        <p>Level9OS LLC. Built, not advised.</p>
      </div>

      {/* noscript fallback: shown only when JavaScript is disabled */}
      <noscript>
        <div
          style={{
            minHeight: "100vh",
            background: "#070710",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "4rem 2rem",
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(139,92,246,0.7)",
              marginBottom: "1.5rem",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            Level9OS
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            The Operating Layer Where Humans and AI Agents Work Together
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "2rem" }}>
            Level9OS is the AI operating system for operations leaders. Governance, orchestration,
            autonomous pods, and measurement. Six products live in production. SMB-first. Anti-lock-in.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              fontStyle: "italic",
            }}
          >
            &ldquo;Introduce an agent. Give it access. Give it a day. It comes back and walks you
            through what it found.&rdquo;
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <a
              href="/products"
              style={{
                display: "inline-block",
                padding: "0.875rem 1.5rem",
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                color: "white",
                textDecoration: "none",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              See What We&apos;ve Built
            </a>
            <a
              href="/governance"
              style={{
                display: "inline-block",
                padding: "0.875rem 1.5rem",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                borderRadius: "9999px",
                fontSize: "0.9rem",
              }}
            >
              Governance
            </a>
            <a
              href="/architecture"
              style={{
                display: "inline-block",
                padding: "0.875rem 1.5rem",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                borderRadius: "9999px",
                fontSize: "0.9rem",
              }}
            >
              Architecture
            </a>
            <a
              href="/paths"
              style={{
                display: "inline-block",
                padding: "0.875rem 1.5rem",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                borderRadius: "9999px",
                fontSize: "0.9rem",
              }}
            >
              Work With Us
            </a>
            <a
              href="/contact"
              style={{
                display: "inline-block",
                padding: "0.875rem 1.5rem",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                borderRadius: "9999px",
                fontSize: "0.9rem",
              }}
            >
              Contact
            </a>
          </div>
          <p
            style={{
              marginTop: "3rem",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            Level9OS LLC &middot; JavaScript required for the full experience.
          </p>
        </div>
      </noscript>

      {/* The interactive Conversation homepage. Renders on top of the
          semantic block for all JS-enabled visitors. */}
      <ConversationHomepage />
    </>
  );
}
