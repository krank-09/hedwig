import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — HEDWIG" },
      { name: "description", content: "Privacy notice for the HEDWIG project site." },
      { property: "og:title", content: "Privacy — HEDWIG" },
      { property: "og:description", content: "Privacy notice for the HEDWIG project site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Privacy</h1>
      <div className="prose-width mt-4 space-y-4 text-muted-foreground">
        <p>
          HEDWIG is a static site. The site does not collect visitor data or use analytics, cookies,
          or tracking.
        </p>
        <p>
          If you change the theme, your preference stays in your browser and is not sent to HEDWIG.
        </p>
      </div>
    </article>
  );
}
