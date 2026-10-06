import type { Metadata } from "next";
import { LandingPageP04 } from "@/components/LandingPageP04";
import { PAGES } from "@/content/pages";

const page = PAGES.P04;

export const metadata: Metadata = { title: page.title, description: page.description };

export default function Page() {
  return <LandingPageP04 page={page} />;
}
