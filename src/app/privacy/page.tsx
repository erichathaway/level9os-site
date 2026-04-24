import type { Metadata } from "next";
import { PrivacyPolicy } from "@level9/brand/legal/level9os";

export const metadata: Metadata = {
  title: "Privacy Notice · Level9OS",
  description: "How Level9OS handles visitor and customer data.",
};

export default function Page() {
  return <PrivacyPolicy />;
}
