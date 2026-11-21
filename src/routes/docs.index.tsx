import { createFileRoute, Link } from "@tanstack/react-router";
import { SCOPE_LIMIT } from "@/data/site";
import { steps } from "@/data/steps";

const description =
  "The HEDWIG protocol phases and links to its science, results, and limitations.";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "Docs — HEDWIG" },
      { name: "description", content: description },
      { property: "og:title", content: "Docs — HEDWIG" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Docs</h1>
      <p className="mt-4 text-muted-foreground">{SCOPE_LIMIT}</p>
      <nav
        aria-label="Research pages"
        className="mt-6 flex flex-wrap gap-4 text-sm text-primary underline underline-offset-4"
      >
        <Link to="/science">Science</Link>
        <Link to="/results">Results</Link>
        <Link to="/docs/limitations">Limitations</Link>
      </nav>
      <ol className="mt-8 max-w-3xl space-y-5">
        {steps.map(({ title, body }, index) => (
          <li key={title} className="border-t border-border pt-4">
            <h2 className="font-semibold">
              {index + 1}. {title}
            </h2>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
