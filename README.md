# HEDWIG — project website

Public website for **HEDWIG**, a simulated three-party Quantum Digital Signature platform with
cyber threat detection. Built by **Team ATHENA** for **QHack-2026**.

> HEDWIG is a **classical simulation of a quantum protocol** — not quantum hardware security.
> That caveat belongs on the site and it belongs here too.

This repository holds the **website only**. The quantum engine lives in a separate private
repository (`QDS`): FastAPI + Qiskit, with the protocol, detection, enforcement and audit layers.
Nothing in this repo runs quantum code.

---

## What this site is

| Route                        | What it is                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `/`                          | Landing page: what HEDWIG is, the five protocol phases, the 17 threat scenarios |
| `/results`                   | Claims table where every figure links to the data file that produced it         |
| `/science`                   | The security argument                                                           |
| `/blog`                      | Six posts: results write-ups and explainers                                     |
| `/demo`                      | Replay viewer — plays back pre-computed recorded sessions                       |
| `/team`, `/repo`, `/privacy` | Standard pages                                                                  |

`/docs/*` is **not** in this repo. The documentation is a separate Astro + Starlight app so it
gets a sidebar, prev/next and search for free. The two halves share one `tokens.css` and are
joined by a path rewrite.

## Stack

React + Vite + TypeScript + Tailwind + shadcn/ui, with TanStack Router and Start.

**Frontend only.** No backend, no database, no authentication, no API calls. Every piece of
content comes from local files under `src/data/` and `src/content/`. There is deliberately no
database, no auth and no server state — please keep it that way.

## House rules

These exist because the project's entire argument is that its claims are checkable. Breaking
them does more damage than a bug.

**1. Never invent a number.** Not a percentage, not a detection rate, not a confidence interval.
If a figure is needed and not available, use a `[CONTENT: ...]` placeholder naming its source.
On a quantum cryptography project, a confident fabricated statistic is worse than a blank.

**2. Every statistic lives in `src/data/claims.ts`.** No component hardcodes a number. Each
entry carries `{ id, label, value, interval, source, verified }`. Anything with
`verified: false` renders a visible "pending verification" badge.

**3. `verified: true` is a human assertion.** It means somebody ran the full experiment suite
and checked that number against its source file. Never flip it to clear a badge.

**4. Publish only from a full experiment run.** `experiments/results/manifest.json` in the
engine repo must report `quick: false`. Smoke-test runs produce intervals like
`[0.000, 0.434]` that look like results and are not.

**5. Don't soften the hedges.** "One concrete collective attack, not a proof against collective
attacks in general", the scope-limit line in the hero, the Limitations link in the main nav —
all deliberate. A reviewer who finds a limitation we disclosed trusts everything else.

## Design system

All colour, spacing and type are CSS custom properties. No component hardcodes a colour.

The circuit-breaker state palette is semantic and used consistently — `OPEN` green, `WATCH`
amber, `QUARANTINED` red, `RESET_PENDING` blue, plus a neutral slate for classical rejections
that deliberately do not lock the link. **Never encode state in colour alone**; always keep the
text label.

`src/styles/theme-austere.css` is a complete revert point for the visual redesign. Swapping its
values back restores the earlier austere look without touching a single component. Keep it in
step with any new token you add.

## Current state

Built and working: landing, results, science, blog, demo, team, repo, privacy, 404.

Outstanding:

- The four landing-page claim cards are `[pending]` until the final experiment figures land.
- The `/results` chart slots are empty, waiting on generated SVGs.
- `/demo` currently plays one sample recording; six real exported replays are ready to drop in.
- The GitHub link is hidden because the engine repository is private.

## Working on it

Work on a branch and open a pull request. `main` is protected: it requires a PR and blocks
force-pushes and deletions.

## Licence and attribution

Team ATHENA, QHack-2026. Ask before reusing the content; the prose and the measured results are
the project's own work.

---

## Running it locally

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/krank-09/hedwig-site.git
cd hedwig-site
npm i
npm run dev
```
