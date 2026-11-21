import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import katex from "katex";
import katexCss from "katex/dist/katex.min.css?url";
import { SCOPE_LIMIT } from "@/data/site";
import securityArgument from "@/content/security-argument.md?raw";
import numbersProofSheet from "@/content/numbers-proof-sheet.md?raw";

export const Route = createFileRoute("/docs")({
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
      <p className="eyebrow">Research / Documentation</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Documentation</h1>
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
                <div className="mt-6 min-w-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h3 className="mt-10 text-xl font-semibold">{children}</h3>
                      ),
                      h3: ({ children }) => (
                        <h4 className="mt-8 text-lg font-semibold">{children}</h4>
                      ),
                      p: ({ children }) => (
                        <p className="mt-4 leading-7 text-muted-foreground">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="leading-7">{children}</li>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      hr: () => <hr className="my-8 border-border" />,
                      code: ({ children }) => (
                        <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-sm text-foreground">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted p-4 text-sm leading-6">
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="mt-6 overflow-x-auto rounded-md border border-border">
                          <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted text-left">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="border-b border-border px-3 py-2 align-top font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-b border-border px-3 py-2 align-top leading-6 text-muted-foreground">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {securityArgument}
                  </ReactMarkdown>
                </div>
              )}
              {id === "proof" && (
                <div className="mt-6 min-w-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h3 className="mt-10 text-xl font-semibold">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="mt-4 leading-7 text-muted-foreground">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                          {children}
                        </ul>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-sm text-foreground">
                          {children}
                        </code>
                      ),
                      table: ({ children }) => (
                        <div className="mt-6 overflow-x-auto rounded-md border border-border">
                          <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted text-left">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="border-b border-border px-3 py-2 align-top font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-b border-border px-3 py-2 align-top leading-6 text-muted-foreground">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {numbersProofSheet}
                  </ReactMarkdown>
                </div>
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
