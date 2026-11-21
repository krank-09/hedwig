import type { ReactNode } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { StateBadge } from "@/components/site/StateBadge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getReplayOutcome, type Replay } from "@/data/replays";

const panel = "min-w-0 border-t border-border py-5";
const title = "mb-4 text-lg font-semibold tracking-normal";

export function BreakerPanel({ replay, phase }: { replay: Replay; phase: number }) {
  const { earlyAbort } = getReplayOutcome(replay);
  const transitions = replay.frames.filter(
    (frame) => frame.phase <= phase && frame.transition && (!earlyAbort || frame.phase < 4),
  );
  if (earlyAbort && phase >= 4) {
    transitions.push({ ...replay.frames[3], transition: replay.frames[4].transition });
  }
  return (
    <section className={panel} aria-labelledby="breaker-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="breaker-title" className="text-lg font-semibold tracking-normal">
          Circuit breaker
        </h2>
        <StateBadge state={replay.frames[phase - 1]?.breakerState ?? null} />
      </div>
      {transitions.length === 0 && replay.frames[phase - 1]?.breakerState === "OPEN" && (
        <p className="text-sm text-muted-foreground">
          {phase === replay.frames.length
            ? "No state change: the run finished with the link OPEN."
            : "No state change up to this phase: the link is OPEN."}
        </p>
      )}
      <ol className="flex flex-wrap items-start gap-x-3 gap-y-2" aria-label="State transitions">
        {transitions.map((frame, index) => (
          <li key={frame.phase} className="flex items-start gap-3">
            {index > 0 && <ArrowRight className="mt-5 size-3 text-muted-foreground" aria-hidden />}
            <div className="space-y-1">
              <p className="font-mono text-xs text-muted-foreground">
                {earlyAbort && frame.phase === 4 ? "Channel-test stop" : `Phase ${frame.phase}`}
              </p>
              <StateBadge state={frame.breakerState} />
              <p className="max-w-40 text-xs text-muted-foreground">{frame.transition}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const fmtP = (p: number) => (p === 0 ? "0" : p < 0.001 ? p.toExponential(1) : p.toFixed(3));
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const human = (s: string) => s.replaceAll("_", " ").replaceAll("+", " + ");

const ATTRIBUTION: Record<string, string> = {
  undetermined: "Undetermined: contradictions within what the channel explains",
  signature_inconsistency: "Signature inconsistency",
  channel_disturbance: "Channel disturbance",
};

function Verdict({ alarm, children }: { alarm: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-xs ${
        alarm
          ? "border-state-quarantined/40 bg-state-quarantined-bg text-state-quarantined"
          : "border-state-open/40 bg-state-open-bg text-state-open"
      }`}
    >
      {children}
    </span>
  );
}

const pending = (when: string) => (
  <span className="font-sans text-muted-foreground">Pending · decided at {when}</span>
);

/**
 * Detection readout for one phase. Tier 1 exists once the channel test has run (phase 4);
 * Tier 2 and the run verdict exist once the run is decided (`decided`).
 */
export function DetectionPanel({
  replay,
  phase,
  decided,
}: {
  replay: Replay;
  phase: number;
  decided: boolean;
}) {
  const qber = replay.frames[phase - 1]?.detection.qber ?? null;
  const { detectionDetail: d, outcome } = replay;
  const [ciLow, ciHigh] = d.qber_ci;
  const row = "flex flex-wrap justify-between gap-x-4 gap-y-1 py-3";
  return (
    <section className={panel} aria-labelledby="detection-title">
      <h2 id="detection-title" className={title}>
        Detection readout
      </h2>
      <dl className="divide-y divide-border text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-3">
          <dt className="text-muted-foreground">Test-token QBER</dt>
          <dd className="font-mono">
            {qber ? (
              <>
                {pct(qber.errors / qber.tested)} ({qber.errors}/{qber.tested}) · interval [
                {pct(ciLow)}, {pct(ciHigh)}]
              </>
            ) : (
              pending("the channel test (phase 4)")
            )}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted-foreground">Tier 1 · channel test</dt>
          <dd className="w-full min-w-0 space-y-1 wrap-anywhere">
            {!qber ? (
              pending("the channel test (phase 4)")
            ) : !d.tier1 ? (
              <span className="text-muted-foreground">
                Not run in this scenario; decided by {human(d.decided_by)}.
              </span>
            ) : (
              <>
                <Verdict alarm={d.tier1.alarm}>{d.tier1.alarm ? "ALARM" : "PASS"}</Verdict>
                <p className="font-mono text-xs text-muted-foreground">
                  {d.tier1.error_count}/{d.tier1.test_count} test errors · alarm if more than{" "}
                  {d.tier1.alarm_threshold_errors} (α = {d.tier1.false_alarm_alpha}) · p ={" "}
                  {fmtP(d.tier1.p_value)}
                  {d.tier1.early_abort &&
                    ` · early abort after ${d.tier1.tokens_sent}/${d.tier1.tokens_planned} tokens`}
                </p>
              </>
            )}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted-foreground">Tier 2 · attribution</dt>
          <dd className="w-full min-w-0 space-y-1 wrap-anywhere">
            {!decided ? (
              pending("verification (phase 5)")
            ) : !d.tier2 || !d.tier2.applicable ? (
              <span className="text-muted-foreground">
                Not applicable to this run: no revealed signature copies to attribute.
              </span>
            ) : (
              <>
                <Verdict alarm={d.tier2.attribution !== "undetermined"}>
                  {ATTRIBUTION[d.tier2.attribution] ?? human(d.tier2.attribution)}
                </Verdict>
                <p className="font-mono text-xs text-muted-foreground">
                  {d.tier2.contradictions}/{d.tier2.copies} copies contradict · p_excess ={" "}
                  {fmtP(d.tier2.p_excess)} (α₂ {d.tier2.alpha2}) · p_channel ={" "}
                  {fmtP(d.tier2.p_channel)} (β {d.tier2.beta})
                </p>
              </>
            )}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 pt-3">
          <dt className="text-muted-foreground">Run verdict</dt>
          <dd className="w-full min-w-0 space-y-1 wrap-anywhere">
            {!decided ? (
              pending("verification (phase 5)")
            ) : (
              <>
                <Verdict alarm={outcome.is_threat_detected}>{outcome.verdict}</Verdict>
                <p className="text-muted-foreground">{d.details}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  decided by {human(d.decided_by)} · evidence p = {fmtP(d.evidence_p)} · response:{" "}
                  {outcome.enforcement_action === "none"
                    ? "none"
                    : `${human(outcome.enforcement_action)} on ${outcome.link}`}
                  {outcome.incident_id && ` · incident ${outcome.incident_id}`}
                </p>
              </>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function TokenPanel({
  tokens,
  earlyAbort = false,
}: {
  tokens: Replay["tokens"] | null;
  earlyAbort?: boolean;
}) {
  return (
    <section className={panel} aria-labelledby="tokens-title">
      <h2 id="tokens-title" className={title}>
        Token table
      </h2>
      {earlyAbort ? (
        <div className="space-y-2 border-l-4 border-state-watch pl-4">
          <h3 className="font-semibold">Sequential early abort · no signature revealed</h3>
          <p className="text-sm text-muted-foreground">
            Transmission stopped at the channel test before any signature evidence existed. No
            tokens were revealed; phases 4–5 were not reached. This is the recorded outcome, not
            missing data.
          </p>
        </div>
      ) : tokens ? (
        <div
          className="max-h-80 overflow-auto rounded-sm border border-border focus-visible:outline-ring"
          tabIndex={0}
          role="region"
          aria-label="Token measurements"
        >
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-muted text-muted-foreground">
              <tr>
                {["Position", "Basis", "Measured value", "Eliminated candidate"].map((label) => (
                  <th key={label} scope="col" className="px-2 py-2.5 font-medium sm:px-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.position} className="border-t border-border even:bg-muted/40">
                  <th scope="row" className="px-2 py-2 font-normal sm:px-3">
                    {String(token.position).padStart(2, "0")}
                  </th>
                  <td className="px-2 py-2 sm:px-3">{token.basis}</td>
                  <td className="px-2 py-2 sm:px-3">{token.measuredValue}</td>
                  <td className="px-2 py-2 sm:px-3">{token.eliminatedCandidate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No token measurements recorded in this phase.
        </p>
      )}
    </section>
  );
}

export function CertificatePanel({ certificate }: { certificate: Replay["certificate"] | null }) {
  return (
    <section className={panel} aria-labelledby="certificate-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="certificate-title" className="text-lg font-semibold tracking-normal">
          Audit certificate
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="inline-flex rounded-sm"
              aria-label="Certificate verification unavailable"
            >
              <Button type="button" variant="outline" size="sm" disabled>
                <LockKeyhole aria-hidden /> Verify this certificate
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            Will call the public verification endpoint once wired.
          </TooltipContent>
        </Tooltip>
      </div>
      {certificate ? (
        <>
          <pre
            className="max-h-80 overflow-auto rounded-sm border border-border bg-muted/50 p-3 font-mono text-xs wrap-anywhere whitespace-pre-wrap"
            tabIndex={0}
            aria-label="Certificate JSON"
          >
            {JSON.stringify(certificate, null, 2)}
          </pre>
          <h3 className="mb-2 mt-4 text-sm font-semibold tracking-normal">
            Hash chain · {certificate.hashAlgorithm}
          </h3>
          <ol
            className="divide-y divide-border border-y border-border"
            aria-label="Certificate hash chain"
          >
            {certificate.hashChain.map(({ hash, phase, event }) => (
              <li
                key={hash}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 py-2 font-mono text-xs"
              >
                <span className="text-muted-foreground">{String(phase).padStart(2, "0")}</span>
                <div className="min-w-0 space-y-0.5">
                  <p className="wrap-anywhere">{event}</p>
                  <code className="block wrap-anywhere text-muted-foreground">{hash}</code>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No certificate recorded in this phase.</p>
      )}
    </section>
  );
}
