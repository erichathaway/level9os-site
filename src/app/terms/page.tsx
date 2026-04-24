import type { Metadata } from "next";
import { TermsOfService } from "@level9/brand/legal/level9os";

export const metadata: Metadata = {
  title: "Terms of Service · Level9OS",
  description: "Terms governing use of Level9OS products and services.",
};

export default function Page() {
  return <TermsOfService />;
}
