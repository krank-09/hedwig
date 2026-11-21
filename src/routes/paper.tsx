import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paper } from "@/data/research";

export const Route = createFileRoute("/paper")({
  head: () => ({
    meta: [
      { title: "Paper — HEDWIG" },
      { name: "description", content: "The HEDWIG research write-up from Team ATHENA." },
      { property: "og:title", content: "Paper — HEDWIG" },
      { property: "og:description", content: "The HEDWIG research write-up from Team ATHENA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaperPage,
});

function PaperPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <p className="eyebrow">Research / Paper</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Paper</h1>
      <section
        aria-labelledby="paper-summary"
        className="mt-8 max-w-3xl border-l-2 border-primary pl-4"
      >
        <h2 id="paper-summary" className="text-xl font-semibold">
          Summary
        </h2>
        <p className="mt-2 text-muted-foreground">{paper.summary}</p>
      </section>
      <section
        aria-labelledby="paper-viewer"
        className="mt-10 overflow-hidden rounded-md border border-border bg-card"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 id="paper-viewer" className="font-semibold">
            Placeholder PDF
          </h2>
          <Button variant="outline" size="sm" asChild>
            <a href={paper.url} download>
              <Download aria-hidden /> Download PDF
            </a>
          </Button>
        </div>
        <object
          data={paper.url}
          type="application/pdf"
          aria-label="Embedded placeholder PDF"
          className="block h-128 w-full bg-muted sm:h-168"
        >
          <div className="grid h-full place-items-center p-4 text-center text-muted-foreground">
            <a href={paper.url} className="text-primary underline underline-offset-4">
              Open placeholder PDF
            </a>
          </div>
        </object>
      </section>
    </div>
  );
}
