import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import katex from "katex";
import katexCss from "katex/dist/katex.min.css?url";
import { SCOPE_LIMIT } from "@/data/site";

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
    links: [{ rel: "stylesheet", href: katexCss }],
  }),
  component: SciencePage,
});

const sections = [
  { id: "security-argument", title: "Security argument" },
  { id: "proof", title: "Proof" },
  { id: "notation", title: "Notation" },
];

function Math({ tex }: { tex: string }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { trust: false }) }} />;
}

function SciencePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <p className="eyebrow">Research / Science</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">The science</h1>
      <p className="mt-4 prose-width text-lg text-muted-foreground">{SCOPE_LIMIT}</p>
      <div className="mt-10 grid items-start gap-10 border-t border-border pt-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav
          aria-labelledby="science-toc"
          className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
        >
          <p id="science-toc" className="eyebrow">
            On this page
          </p>
          <ul className="mt-3 space-y-2 border-l border-border pl-3 text-sm">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-primary hover:underline">
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-width min-w-0 space-y-12">
          {sections.map(({ id, title }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="flex scroll-mt-24 items-center gap-3 text-2xl font-semibold">
                {title}
                <a
                  href={`#${id}`}
                  aria-label={`Link to ${title}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Link2 className="size-4" aria-hidden />
                </a>
              </h2>
              {id === "security-argument" && (
                <p className="mt-4">
                  <span className="placeholder-text">
                    [CONTENT: SECURITY_ARGUMENT.md + PROOF.md]
                  </span>
                </p>
              )}
              {id === "proof" && (
                <p className="mt-4">
                  <span className="placeholder-text">[CONTENT: PROOF.md]</span>
                </p>
              )}
              {id === "notation" && (
                <dl className="mt-4 divide-y divide-border border-y border-border">
                  <div className="grid gap-2 py-4 sm:grid-cols-2">
                    <dt>Bra–ket notation</dt>
                    <dd>
                      <Math tex={String.raw`\langle\phi\mid\psi\rangle`} />
                    </dd>
                  </div>
                  <div className="grid gap-2 py-4 sm:grid-cols-2">
                    <dt>Threshold notation</dt>
                    <dd>
                      <Math tex={String.raw`s_{\mathrm{accept}},\quad s_{\mathrm{verify}}`} />
                    </dd>
                  </div>
                </dl>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
