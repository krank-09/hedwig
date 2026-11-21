import { createFileRoute } from "@tanstack/react-router";
import HedwigGuide from "../../HedwigGuide";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Science — HEDWIG" },
      {
        name: "description",
        content: "Background on quantum digital signatures and the HEDWIG protocol.",
      },
      { property: "og:title", content: "Science — HEDWIG" },
      {
        property: "og:description",
        content: "Background on quantum digital signatures and the HEDWIG protocol.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SciencePage,
});

function SciencePage() {
  return <HedwigGuide />;
}
