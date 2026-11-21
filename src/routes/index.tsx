import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { landingClaims } from "@/data/claims";
import { threats } from "@/data/threats";
import { steps } from "@/data/steps";
import { SCOPE_LIMIT } from "@/data/site";
import { Section } from "@/components/site/Section";
import { PendingBadge, StateBadge } from "@/components/site/StateBadge";
import { ProtocolSchematic } from "@/components/site/ProtocolSchematic";

const DESC =
  "HEDWIG is a simulated three-party quantum digital signature platform from Team ATHENA, QHack-2026.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HEDWIG — Simulated quantum digital signatures" },
      { name: "description", content: DESC },
      { property: "og:title", content: "HEDWIG — Simulated quantum digital signatures" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="hero-grid">
          <div className="min-w-0">
            <p className="eyebrow">Team ATHENA · QHack-2026</p>
            <h1 className="hero-title mt-4 max-w-4xl font-semibold">
              A signature you cannot forge — even with a quantum computer.
            </h1>
            <div className="mt-6 prose-width space-y-4 text-lg text-muted-foreground">
              <p>
                HEDWIG lets one person, <span className="text-role-alice">Alice</span>, sign a
                message so that two others, <span className="text-role-bob">Bob</span> and{" "}
                <span className="text-role-charlie">Charlie</span>, can each check it on their own
                and agree whether it is genuine.
              </p>
              <p>
                It sends the signature pieces over a deliberately noisy channel and uses statistics
                to tell ordinary noise apart from someone eavesdropping, stopping the exchange and
                recording a tamper-evident audit certificate when it detects an attack.
              </p>
            </div>
            <p className="mt-6 prose-width border-l-2 border-primary pl-4 text-base text-foreground">
              {SCOPE_LIMIT}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Watch a replay <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/results"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Read the results
              </Link>
            </div>
          </div>
          <ProtocolSchematic />
        </div>
      </section>

      <Section id="how" eyebrow="Protocol" title="How it works" band>
        <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="step-edge bg-card p-5"
              style={{ "--step-color": `var(--step-${i + 1})` } as React.CSSProperties}
            >
              <span className="step-number font-mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="results" eyebrow="Findings" title="What the results say">
        <p className="-mt-4 mb-8 prose-width text-muted-foreground">
          Each claim is reported as measured, including hypotheses the data did not support.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {landingClaims.map((c) => (
            <article
              key={c.id}
              className="card-hover flex flex-col rounded-md border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium">{c.label}</h3>
              </div>
              <dl className="mt-5 space-y-3 font-mono text-sm">
                <div>
                  <dt className="eyebrow">Value</dt>
                  <dd className="claim-value mt-1 text-foreground">{c.value}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Interval</dt>
                  <dd className="mt-1 text-muted-foreground">{c.interval}</dd>
                </div>
              </dl>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 mt-6">
                {c.verified ? (
                  <span className="font-mono text-xs text-muted-foreground">verified</span>
                ) : (
                  <PendingBadge />
                )}
                {c.source ? (
                  <a
                    href={c.source.href}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Source <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">Source pending</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="threats" eyebrow="Adversaries" title="Threat catalogue" band>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {threats.map((t) => (
            <li
              key={t.name}
              data-outcome={t.outcome.kind === "breaker" ? t.outcome.state : "classical"}
              className="outcome-edge card-hover flex flex-col gap-3 rounded-md border border-border bg-card p-4"
            >
              <code className="font-mono text-sm font-medium text-foreground break-all">
                {t.name}
              </code>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              {t.caveat && (
                <p className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
                  {t.caveat}
                </p>
              )}
              <div className="mt-auto">
                {t.outcome.kind === "breaker" ? (
                  <>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StateBadge state={t.outcome.state} />
                      {"next" in t.outcome && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {t.outcome.relation}
                          </span>
                          <StateBadge state={t.outcome.next} />
                        </>
                      )}
                    </div>
                    {t.outcome.note && (
                      <p className="mt-2 text-xs text-muted-foreground">{t.outcome.note}</p>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-block rounded-sm border border-border bg-classical-bg px-2 py-0.5 font-mono text-xs text-classical">
                      {t.outcome.result === "rejected"
                        ? "classical rejection"
                        : "classical outcome: session incomplete"}
                    </span>
                    {t.outcome.result === "rejected" && (
                      <code className="mt-2 block text-xs wrap-anywhere">{t.outcome.code}</code>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">Link is not locked.</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Circuit-breaker state legend">
          <StateBadge state="OPEN" />
          <StateBadge state="WATCH" />
          <StateBadge state="QUARANTINED" />
          <StateBadge state="RESET_PENDING" />
        </div>
      </Section>
    </>
  );
}
