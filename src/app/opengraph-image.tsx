/**
 * level9os.com — OG image (1200x630) for social shares.
 * Uses next/og programmatic generation via Satori.
 * Brand-aligned: obsidian background, gradient edge stroke,
 * tilted "9" chip on left + tagline + URL on right.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Level9OS — We build the half it all runs on.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "linear-gradient(135deg, #14082E 0%, #041521 100%)",
          padding: "80px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Left: chip mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "320px",
            height: "320px",
            borderRadius: "56px",
            background: "linear-gradient(135deg, #14082E 0%, #041521 100%)",
            border: "3px solid #8B5CF6",
            marginRight: "80px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "240px",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              transform: "rotate(-14deg)",
              display: "flex",
            }}
          >
            9
          </div>
        </div>

        {/* Right: text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "24px",
              display: "flex",
            }}
          >
            Level9OS
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              display: "flex",
            }}
          >
            We build the half it all runs on.
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
            }}
          >
            AI for Operations · level9os.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
