import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { PAGES } from "@/content/pages";

const page = PAGES.P05;

export const metadata: Metadata = { title: page.title, description: page.description };

export default function Page() {
  return <LandingPage page={page} />;
}
