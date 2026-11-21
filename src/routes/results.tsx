import { createFileRoute } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { CopyCommands } from "@/components/site/CopyCommands";
import { PendingBadge } from "@/components/site/StateBadge";
import { claims, groupClaims } from "@/data/claims";
import { charts, reproduceCommands } from "@/data/research";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — HEDWIG" },
      {
        name: "description",
        content: "Measured outcomes of the HEDWIG simulation, including unsupported hypotheses.",
      },
      { property: "og:title", content: "Results — HEDWIG" },
      {
        property: "og:description",
        content: "Measured outcomes of the HEDWIG simulation, including unsupported hypotheses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const groups = groupClaims(claims);
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <p className="eyebrow">Research / Results</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Results</h1>
      <p className="mt-4 prose-width text-lg text-muted-foreground">
        Every published number is reproducible and links to the file that produced it. Results from
        the full experiment are pending.
      </p>

      <section aria-labelledby="claims-heading" className="mt-12">
        <h2 id="claims-heading" className="text-2xl font-semibold">
          Claims
        </h2>
        {groups.length > 0 ? (
          <div
            role="region"
            aria-label="Claims table"
            tabIndex={0}
            className="mt-4 overflow-x-auto rounded-md border border-border"
          >
            <table className="w-full min-w-168 border-collapse text-left text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  {["Claim", "Value", "95% CI", "Source file"].map((label) => (
                    <th key={label} scope="col" className="px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map(({ category, rows }) => (
                <tbody key={category ?? "pending-category"}>
                  <tr className="border-t border-border bg-secondary/50">
                    <th
                      colSpan={4}
                      scope="rowgroup"
                      className="px-4 py-2 text-xs font-medium text-muted-foreground"
                    >
                      {category ?? "Category pending"}
                    </th>
                  </tr>
                  {rows.map((claim) => (
                    <tr key={claim.id} className="border-t border-border bg-card align-top">
                      <th scope="row" className="px-4 py-4 font-medium">
                        {claim.label}
                        {!claim.verified && (
                          <div className="mt-2">
                            <PendingBadge />
                          </div>
                        )}
                      </th>
                      <td className="px-4 py-4 font-mono">{claim.value}</td>
                      <td className="px-4 py-4 font-mono">{claim.interval}</td>
                      <td className="px-4 py-4 font-mono">
                        {claim.source ? (
                          <a
                            href={claim.source.href}
                            className="text-primary underline underline-offset-4"
                          >
                            {claim.source.path}
                          </a>
                        ) : (
                          "[pending]"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No claims have been added.</p>
        )}
      </section>

      <section aria-labelledby="proof-sheet-heading" className="mt-14 border-t border-border pt-8">
        <h2 id="proof-sheet-heading" className="text-2xl font-semibold">
          Executive proof sheet
        </h2>
        <p className="mt-3 prose-width text-muted-foreground">
          Headline numbers from the repository-backed current result set. All entries below link to
          the same source JSON; theoretical estimates are not included until a source is available.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            claims.find((claim) => claim.id === "honest-false-quarantine"),
            claims.find((claim) => claim.id === "forgery-detected"),
            claims.find((claim) => claim.id === "intercept-detected"),
            claims.find((claim) => claim.id === "partial-intercept-detected"),
          ].map((claim) =>
            claim ? (
              <article key={claim.id} className="rounded-md border border-border bg-card p-5">
                <h3 className="text-sm font-medium">{claim.label}</h3>
                <p className="mt-4 font-mono text-3xl text-foreground">{claim.value}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">{claim.interval}</p>
              </article>
            ) : null,
          )}
        </div>
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Reproduction: <code>python run_experiments.py --seed 2026</code>
        </p>
      </section>

      <section aria-labelledby="charts-heading" className="mt-14 border-t border-border pt-8">
        <h2 id="charts-heading" className="text-2xl font-semibold">
          Charts
        </h2>
        {charts.length > 0 ? (
          <div className="mt-5 grid gap-x-6 gap-y-8 md:grid-cols-2">
            {charts.map((chart) => (
              <figure
                key={chart.id}
                aria-labelledby={`${chart.id}-title`}
                className="flex flex-col"
              >
                <div className="grid min-h-28 place-items-center overflow-hidden rounded-md border border-border bg-chart-surface">
                  {chart.svg ? (
                    <img src={chart.svg} alt={chart.alt} className="block h-auto w-full" />
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageOff className="size-4" aria-hidden /> SVG pending
                    </span>
                  )}
                </div>
                <figcaption className="mt-3">
                  <h3 id={`${chart.id}-title`} className="font-semibold">
                    {chart.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{chart.caption}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source path:{" "}
                    <code className="font-mono wrap-anywhere">
                      {chart.sourcePath ?? "[pending]"}
                    </code>
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-muted-foreground">No charts have been added.</p>
        )}
      </section>

      <section aria-labelledby="reproduce-heading" className="mt-14 border-t border-border pt-8">
        <h2 id="reproduce-heading" className="text-2xl font-semibold">
          Reproduce this
        </h2>
        <div className="mt-4 max-w-3xl">
          <CopyCommands commands={reproduceCommands} />
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          [CONTENT: manifest.json — commit, versions, timings]
        </p>
      </section>
    </div>
  );
}
