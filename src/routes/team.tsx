import { createFileRoute } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { team, TEAM_EVENT, TEAM_NAME } from "@/data/team";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — HEDWIG" },
      { name: "description", content: `The people behind HEDWIG, ${TEAM_EVENT}.` },
      { property: "og:title", content: "Team — HEDWIG" },
      { property: "og:description", content: `The people behind HEDWIG, ${TEAM_EVENT}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
      <p className="eyebrow">{TEAM_EVENT}</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{TEAM_NAME}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        HEDWIG was built for {TEAM_EVENT}: a simulated three-party quantum digital signature
        platform with two-tier statistical threat detection.
      </p>

      <section aria-labelledby="members-heading" className="mt-10">
        <h2 id="members-heading" className="text-xl font-semibold">
          Members
        </h2>

        {team.length === 0 ? (
          <p className="mt-2 text-muted-foreground">
            Names and roles pending. Add them in <code>src/data/team.ts</code>.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {team.map((member) => (
              <li
                key={member.name}
                className="card-hover flex items-start gap-3 rounded-md border border-border bg-card p-5"
              >
                <UserRound className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <h3 className="text-lg font-medium">{member.name}</h3>
                  <p className="mt-0.5 text-sm text-primary">{member.role}</p>
                  {member.areas.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground marker:text-border">
                      {member.areas.map((area) => (
                        <li key={area}>{area}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
