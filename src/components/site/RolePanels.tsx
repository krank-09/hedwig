import type { ReactNode } from "react";
import { StateBadge } from "@/components/site/StateBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Replay } from "@/data/replays";

/**
 * The three v1 consoles (Alice/Admin, Bob, Charlie) rebuilt from a recorded run, so they can
 * be shown without the live server or a login. Each panel only shows what that role could
 * see at the current phase; the admin panel alone shows what the attack injector set.
 */

type Tone = "ok" | "bad" | "neutral";
const toneCls: Record<Tone, string> = {
  ok: "border-state-open/40 bg-state-open-bg text-state-open",
  bad: "border-state-quarantined/40 bg-state-quarantined-bg text-state-quarantined",
  neutral: "border-border bg-muted text-muted-foreground",
};

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-xs ${toneCls[tone]}`}
    >
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

const Pending = ({ at }: { at: string }) => (
  <span className="text-muted-foreground">Pending · {at}</span>
);

const short = (hex: string, n = 12) => `${hex.slice(0, n)}…`;
const STATE_SYMBOL: Record<string, string> = { "00": "|0⟩", "10": "|1⟩", "01": "|+⟩", "11": "|−⟩" };
// revealed_bits is [bit, basis]: basis 0 = Z (|0⟩, |1⟩), basis 1 = X (|+⟩, |−⟩).
const revealedSymbol = ([bit, basis]: [number, number]) => STATE_SYMBOL[`${bit}${basis}`] ?? "?";

interface PanelProps {
  replay: Replay;
  phase: number;
  decided: boolean;
}

function AdminPanel({ replay, phase, decided }: PanelProps) {
  const commitment = replay.phases[2].data;
  const { tier1 } = replay.detectionDetail;
  const { ground_truth: truth, outcome, auditCertificate: audit } = replay;
  return (
    <div>
      <Row label="Injected by the admin (hidden from verifiers and the detector)">
        <span className="font-mono">{truth.injected_scenario}</span>
        {truth.dishonest_verifier && (
          <span className="text-muted-foreground"> · dishonest: {truth.dishonest_verifier}</span>
        )}
      </Row>
      <Row label="Signed commitment">
        {phase >= 3 ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs">
            <dt className="text-muted-foreground">session</dt>
            <dd className="wrap-anywhere">{commitment.session_id}</dd>
            <dt className="text-muted-foreground">digest</dt>
            <dd title={commitment.message_digest}>{short(commitment.message_digest, 20)}</dd>
            <dt className="text-muted-foreground">nonce</dt>
            <dd>{short(commitment.nonce, 16)}</dd>
            <dt className="text-muted-foreground">to</dt>
            <dd>{commitment.verifiers.join(", ")}</dd>
          </dl>
        ) : (
          <Pending at="commitment binding (phase 3)" />
        )}
      </Row>
      <Row label="Channel test">
        {phase < 4 ? (
          <Pending at="the channel test (phase 4)" />
        ) : tier1 ? (
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={tier1.alarm ? "bad" : "ok"}>{tier1.alarm ? "ALARM" : "PASS"}</Pill>
            <span className="font-mono text-xs text-muted-foreground">
              {tier1.error_count}/{tier1.test_count} test errors
              {tier1.early_abort && " · early abort"}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Decided by per-route tests.</span>
        )}
      </Row>
      <Row label={`Circuit breaker · ${outcome.link}`}>
        <span className="flex flex-wrap items-center gap-2">
          <StateBadge state={replay.frames[phase - 1]?.breakerState ?? null} />
          {decided && outcome.incident_id && (
            <span className="font-mono text-xs text-muted-foreground">
              incident {outcome.incident_id}
            </span>
          )}
        </span>
      </Row>
      <Row label="Signed audit record">
        {decided ? (
          <span className="font-mono text-xs">
            {audit.artifact_id} · chain #{audit.chain_seq} ·{" "}
            <span className="text-muted-foreground">{audit.assurance}</span>
          </span>
        ) : (
          <Pending at="the end of the run" />
        )}
      </Row>
    </div>
  );
}

function verdictView(raw: string): { tone: Tone; label: string; note?: string | undefined } {
  if (raw === "accepted") return { tone: "ok", label: "ACCEPTED" };
  if (raw === "rejected") return { tone: "bad", label: "REJECTED" };
  const [label, note] = raw.split(" - ");
  return { tone: "neutral", label: (label ?? raw).toUpperCase(), note };
}

function VerifierPanel({ replay, phase, decided, role }: PanelProps & { role: "bob" | "charlie" }) {
  const name = role === "bob" ? "Bob" : "Charlie";
  const actions = replay.phases[0].data[`${role}_actions`];
  const kept = actions?.filter((a) => a === "K").length ?? 0;
  const rows = replay.richTokens.filter((t) => t.verifier === role);
  const revealed = phase === replay.frames.length && rows.length > 0;
  const contradictions = rows.filter((t) => t.contradiction).length;
  const verdict = verdictView(replay.certificate.receiverVerdicts[role]);
  return (
    <div>
      <Row label={`${name}'s verdict`}>
        {decided ? (
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={verdict.tone}>{verdict.label}</Pill>
            {verdict.note && <span className="text-xs text-muted-foreground">{verdict.note}</span>}
            {revealed && (
              <span className="font-mono text-xs text-muted-foreground">
                {contradictions}/{rows.length} positions contradict
              </span>
            )}
          </span>
        ) : (
          <Pending at="verification (phase 5)" />
        )}
      </Row>
      <Row label="Symmetrisation (keep K / forward F)">
        {actions ? (
          <>
            <p className="font-mono text-xs tracking-[0.15em] wrap-anywhere">{actions.join("")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              kept {kept}, forwarded {actions.length - kept}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            None: no tokens were distributed to {name} by the claimed sender.
          </p>
        )}
      </Row>
      <Row label="Elimination table (computed by this verifier)">
        {phase < 2 ? (
          <Pending at="teleportation & elimination (phase 2)" />
        ) : rows.length === 0 ? (
          <span className="text-muted-foreground">
            {decided
              ? `No table recorded for ${name}: the signature was not revealed to ${name} in this run.`
              : "Recorded when the signature is revealed (phase 5)."}
          </span>
        ) : (
          <div
            className="max-h-56 overflow-auto rounded-sm border border-border"
            tabIndex={0}
            role="region"
            aria-label={`${name}'s elimination table`}
          >
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  {["#", "held", "eliminated", "revealed", ""].map((h) => (
                    <th key={h} scope="col" className="px-2 py-1.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.position}
                    className={`border-t border-border ${revealed && t.contradiction ? "bg-state-quarantined-bg" : ""}`}
                  >
                    <th scope="row" className="px-2 py-1 font-normal">
                      {String(t.position).padStart(2, "0")}
                    </th>
                    <td className="px-2 py-1" title={t.held_tokens.join("\n")}>
                      {t.held_tokens.length}
                    </td>
                    <td className="px-2 py-1">{t.eliminated_states.join(" ") || "—"}</td>
                    <td className="px-2 py-1">
                      {revealed ? revealedSymbol(t.revealed_bits) : "·"}
                    </td>
                    <td className="px-2 py-1">
                      {!revealed ? (
                        ""
                      ) : t.contradiction ? (
                        <span className="text-state-quarantined" aria-label="contradiction">
                          ✗
                        </span>
                      ) : (
                        <span className="text-state-open" aria-label="consistent">
                          ✓
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Row>
    </div>
  );
}

// The shared tabs' active style (bg-background) barely differs from the panel in dark mode.
const activeTab = "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

export function RolePanels(props: PanelProps) {
  return (
    <Tabs defaultValue="admin" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="admin" className={activeTab}>
          Alice / Admin
        </TabsTrigger>
        <TabsTrigger value="bob" className={activeTab}>
          Bob
        </TabsTrigger>
        <TabsTrigger value="charlie" className={activeTab}>
          Charlie
        </TabsTrigger>
      </TabsList>
      <TabsContent value="admin" className="mt-3">
        <AdminPanel {...props} />
      </TabsContent>
      <TabsContent value="bob" className="mt-3">
        <VerifierPanel {...props} role="bob" />
      </TabsContent>
      <TabsContent value="charlie" className="mt-3">
        <VerifierPanel {...props} role="charlie" />
      </TabsContent>
    </Tabs>
  );
}
