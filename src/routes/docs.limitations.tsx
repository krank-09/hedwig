import { createFileRoute } from "@tanstack/react-router";
import { SCOPE_LIMIT } from "@/data/site";

const description = "The scope of the HEDWIG simulation and the status of its research claims.";

export const Route = createFileRoute("/docs/limitations")({
  head: () => ({
    meta: [
      { title: "Limitations — HEDWIG" },
      { name: "description", content: description },
      { property: "og:title", content: "Limitations — HEDWIG" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LimitationsPage,
});

function LimitationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Limitations</h1>
      <div className="mt-4 prose-width space-y-4 text-muted-foreground">
        <p>{SCOPE_LIMIT}</p>
        <p>
          Results from the full experiment are pending. Values in the sample replay are
          illustrative, not research findings.
        </p>
      </div>
    </div>
  );
}
