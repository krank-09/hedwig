import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRawReplay, getReplay, scenarios, type Replay, type Scenario } from "@/data/replays";
import {
  VERIFIERS,
  runningTotals,
  shortHeld,
  statedLimits,
  tokenSteps,
  type Running,
  type TokenStep,
  type Verifier,
} from "@/data/replays/tokenSteps";

const NAME: Record<Verifier, string> = { bob: "Bob", charlie: "Charlie" };
const STROKE: Record<Verifier, string> = { bob: "stroke-role-bob", charlie: "stroke-role-charlie" };
const TEXT: Record<Verifier, string> = { bob: "text-role-bob", charlie: "text-role-charlie" };
const SPEEDS = [0.5, 1, 2, 4] as const;
const STEP_MS = 900;

const card = "rounded-md border border-border bg-card p-4";
const cardTitle = "text-sm font-semibold";
const pct = (m: number, c: number) => (c ? `${((m / c) * 100).toFixed(1)}%` : "—");

/**
 * Step through a recorded run one signature position at a time, the way Bob and Charlie
 * checked it. Every value comes from the exported recording; nothing runs live.
 */
export function TokenReplay({
  scenario,
  setScenario,
}: {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
}) {
  const replay = getReplay(scenario);
  if (!replay) return null;
  return (
    <section aria-labelledby="token-replay-title" className="mt-16 border-t border-border pt-10">
      <p className="font-mono text-xs font-medium tracking-wider text-primary uppercase">
        Step by step
      </p>
      <h2 id="token-replay-title" className="mt-1 text-2xl font-semibold sm:text-3xl">
        Every check, token by token
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Follow each signature position through a recorded run and see what Bob and Charlie found
        when they checked it against their own eliminations. All values come from the exported
        recording, and nothing runs live.
      </p>
      <TokenReplayBody key={scenario} replay={replay} setScenario={setScenario} />
    </section>
  );
}

function TokenReplayBody({
  replay,
  setScenario,
}: {
  replay: Replay;
  setScenario: (s: Scenario) => void;
}) {
  const steps = useMemo(() => tokenSteps(replay), [replay]);
  const totals = useMemo(() => runningTotals(steps), [steps]);
  const limits = statedLimits(replay.detectionDetail.details);
  const authentic = getReplay("authentic");
  const authTotals = useMemo(
    () => (authentic ? runningTotals(tokenSteps(authentic)) : null),
    [authentic],
  );

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [compare, setCompare] = useState(false);
  const [showElim, setShowElim] = useState(true);
  const n = steps.length;
  const step = steps[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= n - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setI(i + 1), STEP_MS / speed);
    return () => window.clearTimeout(t);
  }, [playing, i, n, speed]);

  const go = (next: number) => {
    setPlaying(false);
    setI(Math.min(Math.max(0, next), Math.max(0, n - 1)));
  };
  const comparing = compare && replay.scenario !== "authentic" && authTotals !== null;

  return (
    <>
      {/* Controls */}
      <div className={`${card} mt-6 space-y-4`}>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <label className="w-full text-xs text-muted-foreground sm:w-auto">
            Recorded case
            <select
              className="mt-1 block h-9 w-full rounded-md border border-border bg-background px-2 font-mono text-sm text-foreground sm:w-80"
              value={replay.scenario}
              onChange={(e) => setScenario(e.currentTarget.value as Scenario)}
            >
              {scenarios.map((s) => (
                <option key={s} value={s}>
                  {getReplay(s)?.label ?? s} · seed {getReplay(s)?.seed}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={compare}
              disabled={replay.scenario === "authentic"}
              onChange={(e) => setCompare(e.currentTarget.checked)}
            />
            Compare with the authentic run
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={showElim}
              onChange={(e) => setShowElim(e.currentTarget.checked)}
            />
            Show eliminated states
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <div className="flex shrink-0 gap-1.5">
            <IconBtn label="Restart" onClick={() => go(0)} disabled={n === 0}>
              <RotateCcw />
            </IconBtn>
            <IconBtn label="Previous position" onClick={() => go(i - 1)} disabled={i === 0}>
              <SkipBack />
            </IconBtn>
            <IconBtn
              label={playing ? "Pause" : "Play"}
              onClick={() => {
                if (playing) return setPlaying(false);
                if (i >= n - 1) setI(0);
                setPlaying(true);
              }}
              disabled={n === 0}
              primary
            >
              {playing ? <Pause /> : <Play />}
            </IconBtn>
            <IconBtn label="Next position" onClick={() => go(i + 1)} disabled={i >= n - 1}>
              <SkipForward />
            </IconBtn>
          </div>
          <label htmlFor="token-slider" className="shrink-0 text-sm font-medium">
            Position
          </label>
          <input
            id="token-slider"
            type="range"
            min={0}
            max={Math.max(0, n - 1)}
            value={i}
            disabled={n === 0}
            onChange={(e) => go(e.currentTarget.valueAsNumber)}
            aria-valuetext={n ? `Position ${i + 1} of ${n}` : "No positions"}
            className="h-7 min-w-32 flex-1 cursor-pointer accent-primary"
          />
          <span className="shrink-0 font-mono text-sm tabular-nums">
            {n ? i + 1 : 0} / {n}
          </span>
          <select
            aria-label="Playback speed"
            className="h-9 shrink-0 rounded-md border border-border bg-background px-2 text-sm"
            value={speed}
            onChange={(e) => setSpeed(Number(e.currentTarget.value) as (typeof SPEEDS)[number])}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}× speed
              </option>
            ))}
          </select>
        </div>
      </div>

      {n === 0 || !step ? (
        <div className={`${card} mt-4`} role="status">
          <h3 className={cardTitle}>No token checks to step through</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This run stopped before the signature was revealed, so neither verifier checked any
            positions. That is the recorded outcome, not missing data. See how it ended below.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <NetworkCard steps={steps} i={i} onPick={go} showElim={showElim} />
          <div className="space-y-4">
            <TokenCard step={step} n={n} i={i} />
            <CheckCard
              replay={replay}
              totals={totals}
              authTotals={comparing ? authTotals : null}
              limits={limits}
              i={i}
              step={step}
              showElim={showElim}
            />
          </div>
        </div>
      )}

      <EndedCard replay={replay} totals={totals} />
      {n > 0 && (
        <details className={`${card} mt-4`}>
          <summary className={`${cardTitle} cursor-pointer`}>Jump to a position</summary>
          <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-1.5">
            {steps.map((s, k) => (
              <li key={s.position}>
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-current={k === i ? "step" : undefined}
                  className={`flex w-full items-center justify-between rounded-sm border px-2 py-1 font-mono text-xs hover:bg-muted ${
                    k === i ? "border-primary" : "border-border"
                  }`}
                >
                  #{String(s.position).padStart(2, "0")}
                  <span className="flex gap-1.5">
                    {VERIFIERS.map((v) => (
                      <Mark key={v} check={s.checks[v]} who={NAME[v]} />
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      <ProvenanceCard replay={replay} />
    </>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={primary ? "default" : "outline"}
      className="size-9"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function Mark({ check, who }: { check: TokenStep["checks"][Verifier]; who: string }) {
  if (!check || check.eliminated.length === 0)
    return (
      <span className="text-muted-foreground" aria-label={`${who}: no copy`}>
        ·
      </span>
    );
  return check.mismatches > 0 ? (
    <span className="text-state-quarantined" aria-label={`${who}: contradiction`}>
      ✗
    </span>
  ) : (
    <span className="text-state-open" aria-label={`${who}: consistent`}>
      ✓
    </span>
  );
}

/* ---------------------------------------------------------------- network + grid */

function NetworkCard({
  steps,
  i,
  onPick,
  showElim,
}: {
  steps: TokenStep[];
  i: number;
  onPick: (k: number) => void;
  showElim: boolean;
}) {
  const step = steps[i];
  if (!step) return null;
  const nodes = { alice: [62, 110], bob: [298, 48], charlie: [298, 172] } as const;
  const swapped = VERIFIERS.some((v) => step.checks[v]?.held.some((h) => /Forwarded/.test(h)));
  const edge = (v: Verifier) => {
    const active = (step.checks[v]?.held.length ?? 0) > 0;
    return (
      <line
        x1={nodes.alice[0]}
        y1={nodes.alice[1]}
        x2={nodes[v][0]}
        y2={nodes[v][1]}
        className={active ? STROKE[v] : "stroke-border"}
        strokeWidth={active ? 3 : 1.5}
      />
    );
  };
  return (
    <div className={card}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className={cardTitle}>Who checked position {String(step.position).padStart(2, "0")}</h3>
        <span className="font-mono text-xs text-muted-foreground">revealed {step.revealed}</span>
      </div>
      <svg
        viewBox="0 0 360 220"
        className="w-full rounded-sm bg-muted/40"
        role="img"
        aria-label={`Position ${step.position}: Alice revealed ${step.revealed}. ${VERIFIERS.map(
          (v) => {
            const c = step.checks[v];
            if (!c || c.eliminated.length === 0) return `${NAME[v]} held no copy`;
            return `${NAME[v]} ${c.mismatches ? "found a contradiction" : "found it consistent"}`;
          },
        ).join(". ")}.`}
      >
        {edge("bob")}
        {edge("charlie")}
        <line
          x1={nodes.bob[0]}
          y1={nodes.bob[1]}
          x2={nodes.charlie[0]}
          y2={nodes.charlie[1]}
          className={swapped ? "stroke-quantum" : "stroke-border"}
          strokeWidth={swapped ? 2.5 : 1.5}
          strokeDasharray="5 4"
        />
        <text x={316} y={114} className="fill-muted-foreground text-[10px]">
          swap
        </text>
        {(
          [
            ["alice", "A", "Alice", "fill-role-alice", "stroke-role-alice"],
            ["bob", "β", "Bob", "fill-role-bob", "stroke-role-bob"],
            ["charlie", "γ", "Charlie", "fill-role-charlie", "stroke-role-charlie"],
          ] as const
        ).map(([key, glyph, label, fill, stroke]) => {
          const [x, y] = nodes[key];
          const c = key === "alice" ? undefined : step.checks[key];
          const verdict =
            key === "alice"
              ? null
              : !c || c.eliminated.length === 0
                ? "·"
                : c.mismatches
                  ? "✗"
                  : "✓";
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={22} className={`fill-card ${stroke}`} strokeWidth={2} />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className={`${fill} text-[15px] font-semibold`}
              >
                {glyph}
              </text>
              <text
                x={x}
                y={key === "bob" ? y - 30 : y + 38}
                textAnchor="middle"
                className="fill-foreground text-[11px]"
              >
                {label}
              </text>
              {verdict && (
                <text
                  x={x + 30}
                  y={y + 5}
                  className={`text-[16px] font-bold ${
                    verdict === "✗"
                      ? "fill-state-quarantined"
                      : verdict === "✓"
                        ? "fill-state-open"
                        : "fill-muted-foreground"
                  }`}
                >
                  {verdict}
                </text>
              )}
              {showElim && c && c.eliminated.length > 0 && (
                <text
                  x={x - 30}
                  y={y + 5}
                  textAnchor="end"
                  className="fill-muted-foreground font-mono text-[10px]"
                >
                  ¬{c.eliminated.join(" ¬")}
                </text>
              )}
            </g>
          );
        })}
        <g>
          <rect x={20} y={150} width={84} height={24} rx={4} className="fill-primary" />
          <text
            x={62}
            y={166}
            textAnchor="middle"
            className="fill-primary-foreground font-mono text-[11px]"
          >
            #{String(step.position).padStart(2, "0")} {step.revealed}
          </text>
        </g>
      </svg>

      <div className="mt-3 space-y-1.5" role="group" aria-label="All positions">
        {VERIFIERS.map((v) => (
          <div key={v} className="flex items-center gap-2">
            <span className={`w-14 shrink-0 text-xs font-medium ${TEXT[v]}`}>{NAME[v]}</span>
            <div className="flex flex-wrap gap-1">
              {steps.map((s, k) => {
                const c = s.checks[v];
                const none = !c || c.eliminated.length === 0;
                const future = k > i;
                const cls = none
                  ? "border border-dashed border-border bg-transparent"
                  : future
                    ? "bg-muted"
                    : c.mismatches
                      ? "bg-state-quarantined"
                      : "bg-state-open";
                const state = none
                  ? "no copy"
                  : future
                    ? "not yet checked"
                    : c.mismatches
                      ? "contradiction"
                      : "consistent";
                return (
                  <button
                    key={s.position}
                    type="button"
                    onClick={() => onPick(k)}
                    aria-label={`Position ${s.position}, ${NAME[v]}: ${state}`}
                    title={`#${s.position} · ${state}`}
                    className={`size-4 rounded-[3px] ${cls} ${k === i ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-state-open" /> consistent
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-state-quarantined" /> contradiction
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-muted" /> not yet checked
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] border border-dashed border-border" /> held no
          copy
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-quantum" /> copy swapped between
          verifiers
        </li>
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- the token */

function TokenCard({ step, n, i }: { step: TokenStep; n: number; i: number }) {
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={cardTitle}>The token</h3>
        <span className="font-mono text-xs text-muted-foreground">
          position {String(step.position).padStart(2, "0")} · step {i + 1} of {n}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Alice prepared</dt>
          <dd className="font-mono">{step.prepared}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Revealed in the signature</dt>
          <dd className="font-mono">{step.revealed}</dd>
        </div>
      </dl>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {VERIFIERS.map((v) => {
          const c = step.checks[v];
          return (
            <div key={v} className="rounded-sm border border-border p-2.5">
              <p className={`text-xs font-semibold ${TEXT[v]}`}>{NAME[v]}</p>
              {!c || c.held.length === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">Held no copy of this position.</p>
              ) : (
                <>
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {c.held.map((h, k) => (
                      <li key={h} className="flex justify-between gap-2" title={h}>
                        <span className="text-muted-foreground">{shortHeld(h)}</span>
                        <span className="font-mono">¬{c.eliminated[k] ?? "—"}</span>
                      </li>
                    ))}
                  </ul>
                  <p
                    className={`mt-1.5 text-xs font-medium ${c.mismatches ? "text-state-quarantined" : "text-state-open"}`}
                  >
                    {c.mismatches
                      ? `✗ ${c.mismatches} cop${c.mismatches === 1 ? "y" : "ies"} had eliminated ${step.revealed}`
                      : "✓ consistent with every held copy"}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- the check */

function CheckCard({
  replay,
  totals,
  authTotals,
  limits,
  i,
  step,
  showElim,
}: {
  replay: Replay;
  totals: Record<Verifier, Running[]>;
  authTotals: Record<Verifier, Running[]> | null;
  limits: Partial<Record<Verifier, number>>;
  i: number;
  step: TokenStep;
  showElim: boolean;
}) {
  const now = (v: Verifier) => totals[v][i] ?? { mismatches: 0, checked: 0 };
  const both = VERIFIERS.reduce(
    (acc, v) => ({ m: acc.m + now(v).mismatches, c: acc.c + now(v).checked }),
    { m: 0, c: 0 },
  );
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={cardTitle}>The check so far</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {both.m}/{both.c} copies contradict
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {VERIFIERS.map((v) => {
          const r = now(v);
          const auth = authTotals?.[v][i];
          const limit = limits[v];
          return (
            <div key={v}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs">
                <span className={`font-semibold ${TEXT[v]}`}>{NAME[v]}</span>
                <span className="font-mono text-muted-foreground">
                  {r.mismatches}/{r.checked} · {pct(r.mismatches, r.checked)}
                  {limit !== undefined ? ` · limit ${limit}` : ""}
                  {limit !== undefined && r.mismatches > limit && (
                    <span className="text-state-quarantined"> · over limit</span>
                  )}
                </span>
              </div>
              <Bar value={r.checked ? r.mismatches / r.checked : 0} bad={r.mismatches > 0} />
              {auth && (
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  authentic run at this step: {auth.mismatches}/{auth.checked}
                </p>
              )}
            </div>
          );
        })}
        {Object.keys(limits).length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            This recording doesn't state acceptance limits; they appear only on rejections.
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniCard title="Mismatches so far">
          <MismatchChart totals={totals} authTotals={authTotals} i={i} />
        </MiniCard>
        <MiniCard title="Revealed state, X–Z">
          <StateCircle step={step} showElim={showElim} />
        </MiniCard>
        <MiniCard title="Mismatch rate">
          <Gauge value={both.c ? both.m / both.c : 0} />
        </MiniCard>
      </div>

      <details className="mt-3 rounded-sm border border-border p-2.5" open>
        <summary className="cursor-pointer text-xs font-semibold">Why this verdict?</summary>
        <p className="mt-1.5 text-xs text-muted-foreground">{replay.detectionDetail.details}</p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          decided by {replay.detectionDetail.decided_by.replaceAll("_", " ")} · Bob{" "}
          {replay.certificate.receiverVerdicts.bob.split(" - ")[0]} · Charlie{" "}
          {replay.certificate.receiverVerdicts.charlie.split(" - ")[0]}
        </p>
      </details>
    </div>
  );
}

function Bar({ value, bad }: { value: number; bad: boolean }) {
  // Scale so small rates are visible: the full bar is 50% of copies contradicting.
  const w = Math.min(100, (value / 0.5) * 100);
  return (
    <div className="mt-1 h-2 rounded-full bg-muted" aria-hidden>
      <div
        className={`h-2 rounded-full ${bad ? "bg-state-quarantined" : "bg-state-open"}`}
        style={{ width: `${Math.max(w, value > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

function MiniCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-border p-2">
      <p className="mb-1 text-[11px] text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function MismatchChart({
  totals,
  authTotals,
  i,
}: {
  totals: Record<Verifier, Running[]>;
  authTotals: Record<Verifier, Running[]> | null;
  i: number;
}) {
  const W = 120;
  const H = 64;
  const n = totals.bob.length;
  const max = Math.max(1, ...VERIFIERS.flatMap((v) => totals[v].map((r) => r.mismatches)));
  const xy = (r: Running, k: number): [number, number] => [
    (k / Math.max(1, n - 1)) * (W - 8) + 4,
    H - 6 - (r.mismatches / max) * (H - 14),
  ];
  const pts = (rows: Running[]) =>
    rows
      .slice(0, i + 1)
      .map((r, k) => xy(r, k).join(","))
      .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Cumulative mismatches up to step ${i + 1}: ${VERIFIERS.map((v) => `${NAME[v]} ${totals[v][i]?.mismatches ?? 0}`).join(", ")}`}
    >
      <line x1={4} y1={H - 6} x2={W - 4} y2={H - 6} className="stroke-border" />
      {authTotals &&
        VERIFIERS.map((v) => (
          <polyline
            key={`a-${v}`}
            points={pts(authTotals[v])}
            fill="none"
            strokeDasharray="3 3"
            className={`${STROKE[v]} opacity-50`}
            strokeWidth={1.5}
          />
        ))}
      {VERIFIERS.map((v) => {
        const now = totals[v][i];
        const [x, y] = now ? xy(now, i) : [0, 0];
        return (
          <g key={v}>
            <polyline points={pts(totals[v])} fill="none" className={STROKE[v]} strokeWidth={2} />
            {now && (
              <circle
                cx={x}
                cy={y}
                r={2.5}
                className={`fill-card ${STROKE[v]}`}
                strokeWidth={1.5}
              />
            )}
          </g>
        );
      })}
      <text x={4} y={9} className="fill-muted-foreground text-[8px]">
        max {max}
      </text>
    </svg>
  );
}

function StateCircle({ step, showElim }: { step: TokenStep; showElim: boolean }) {
  const r = 24;
  const c = 32;
  const at: Record<string, [number, number]> = {
    "|0⟩": [c, c - r],
    "|1⟩": [c, c + r],
    "|+⟩": [c + r, c],
    "|−⟩": [c - r, c],
  };
  const rev = at[step.revealed];
  const elim = showElim
    ? VERIFIERS.flatMap((v) => step.checks[v]?.eliminated ?? []).filter((s) => at[s])
    : [];
  return (
    <svg
      viewBox="0 0 64 64"
      className="mx-auto w-full max-w-24"
      role="img"
      aria-label={`Revealed ${step.revealed}${elim.length ? `; eliminated ${[...new Set(elim)].join(", ")}` : ""}`}
    >
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-border" />
      <line x1={c} y1={c - r} x2={c} y2={c + r} className="stroke-border" strokeDasharray="2 2" />
      <line x1={c - r} y1={c} x2={c + r} y2={c} className="stroke-border" strokeDasharray="2 2" />
      {[...new Set(elim)].map((s) => {
        const [x, y] = at[s]!;
        return (
          <g key={s} className="stroke-state-quarantined" strokeWidth={1.5}>
            <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} />
            <line x1={x - 3} y1={y + 3} x2={x + 3} y2={y - 3} />
          </g>
        );
      })}
      {rev && (
        <>
          <line
            x1={c}
            y1={c}
            x2={rev[0]}
            y2={rev[1]}
            className="stroke-primary"
            strokeWidth={1.5}
          />
          <circle cx={rev[0]} cy={rev[1]} r={3.5} className="fill-primary" />
        </>
      )}
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  // 0% to 50% of copies contradicting, left to right.
  const t = Math.min(1, value / 0.5);
  const a = Math.PI * (1 - t);
  const [cx, cy, r] = [40, 38, 28];
  return (
    <div>
      <svg
        viewBox="0 0 80 46"
        className="w-full"
        role="img"
        aria-label={`Mismatch rate ${(value * 100).toFixed(1)}%`}
      >
        <path
          d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          className="stroke-muted"
          strokeWidth={6}
        />
        {t > 0 && (
          <path
            d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`}
            fill="none"
            className="stroke-state-quarantined"
            strokeWidth={6}
          />
        )}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 6) * Math.cos(a)}
          y2={cy - (r - 6) * Math.sin(a)}
          className="stroke-foreground"
          strokeWidth={1.5}
        />
      </svg>
      <p className="text-center font-mono text-[10px] text-muted-foreground">
        {(value * 100).toFixed(1)}% of copies
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- ending + provenance */

const STATUS: Record<string, string> = {
  complete: "complete",
  aborted: "aborted here",
  not_reached: "not reached",
};

function EndedCard({ replay, totals }: { replay: Replay; totals: Record<Verifier, Running[]> }) {
  const { outcome, auditCertificate: audit } = replay;
  return (
    <div className={`${card} mt-4`}>
      <h3 className={cardTitle}>How this run ended</h3>
      <p className="mt-1 text-sm">
        <span className={outcome.is_threat_detected ? "text-state-quarantined" : "text-state-open"}>
          {outcome.verdict}
        </span>
        <span className="text-muted-foreground">
          {" "}
          · response:{" "}
          {outcome.enforcement_action === "none"
            ? "none"
            : `${outcome.enforcement_action.replaceAll("_", " ")} on ${outcome.link}`}
          {outcome.incident_id && ` · incident ${outcome.incident_id}`}
        </span>
      </p>
      <ol className="mt-3 list-disc space-y-1 pl-5 text-sm">
        {replay.phases.map((p, k) => (
          <li
            key={p.name}
            className={p.status === "not_reached" ? "text-muted-foreground" : undefined}
          >
            Phase {k + 1}: {p.name} ·{" "}
            <span className={p.status === "aborted" ? "text-state-quarantined" : undefined}>
              {STATUS[p.status]}
            </span>
          </li>
        ))}
        {VERIFIERS.map((v) => {
          const last = totals[v].at(-1);
          const verdict = replay.certificate.receiverVerdicts[v];
          return (
            <li key={v}>
              {NAME[v]}:{" "}
              {last && last.checked
                ? `${last.mismatches}/${last.checked} copies contradicted · `
                : ""}
              {verdict}
            </li>
          );
        })}
        <li>
          Audit record {audit.artifact_id} · chain #{audit.chain_seq} · {audit.assurance}
        </li>
      </ol>
    </div>
  );
}

function ProvenanceCard({ replay }: { replay: Replay }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(getRawReplay(replay.scenario), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hedwig-replay-${replay.scenario}-seed${replay.seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const p = replay.provenance;
  return (
    <details className={`${card} mt-4`}>
      <summary className={`${cardTitle} cursor-pointer`}>
        Recording provenance &amp; downloads
      </summary>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Case</dt>
        <dd>
          {replay.label} · seed {replay.seed}
        </dd>
        <dt className="text-muted-foreground">Recorded</dt>
        <dd className="font-mono text-xs">{replay.generated}</dd>
        <dt className="text-muted-foreground">Engine commit</dt>
        <dd className="font-mono text-xs">{p.git_commit.slice(0, 12)}</dd>
        <dt className="text-muted-foreground">Backend</dt>
        <dd className="font-mono text-xs">{p.backend}</dd>
        <dt className="text-muted-foreground">Command</dt>
        <dd>
          <code className="font-mono text-xs wrap-anywhere">{p.command}</code>
        </dd>
        <dt className="text-muted-foreground">Note</dt>
        <dd className="text-xs text-muted-foreground">{p.note}</dd>
      </dl>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={download}>
        <Download aria-hidden /> Download this recording (JSON)
      </Button>
    </details>
  );
}
