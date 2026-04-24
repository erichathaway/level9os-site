import type { Metadata } from "next";
import { CookiePolicy } from "@level9/brand/legal/level9os";

export const metadata: Metadata = {
  title: "Cookie Policy · Level9OS",
  description: "How Level9OS uses cookies and similar technologies.",
};

export default function Page() {
  return <CookiePolicy />;
}
