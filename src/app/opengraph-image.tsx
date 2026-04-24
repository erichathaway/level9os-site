/**
 * level9os.com — OG image (1200x630) for social shares.
 * Renders @level9/brand/components/og.OgCard with the canonical
 * level9os preset from @level9/brand/content/siteMeta.
 */
import { ImageResponse } from "next/og";
import { SITE_META } from "@level9/brand/content/siteMeta";
import { OgCard } from "@level9/brand/components/og";

const meta = SITE_META.level9os;

export const runtime = "edge";
export const alt = meta.description;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<OgCard meta={meta} />, { ...size });
}
