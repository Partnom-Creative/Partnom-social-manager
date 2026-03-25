import type { Metadata } from "next";
import { DesignSystemShowcase } from "./design-system-showcase";

export const metadata: Metadata = {
  title: "Design workspace — Social Hub",
  description:
    "Semantic tokens, UI primitives, and patterns — separate from the product app.",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
