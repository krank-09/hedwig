import { z } from "zod";
import type { BreakerState } from "@/data/threats";
import authentic from "./authentic.json";
import eveIntercept from "./eve_intercept.json";
import eveCloning from "./eve_cloning.json";
import evePartialIntercept from "./eve_partial_intercept.json";
import repudiation from "./repudiation.json";
import dishonestBob from "./dishonest_bob.json";

export const scenarios = [
  "authentic",
  "eve_intercept",
  "eve_cloning",
  "eve_partial_intercept",
  "repudiation",
  "dishonest_bob",
] as const;

const scenario = z.enum(scenarios);
const breakerState = z.enum(["OPEN", "WATCH", "QUARANTINED", "RESET_PENDING"] satisfies [
  BreakerState,
  ...BreakerState[],
]);
const token = z.object({
  position: z.number().int().positive(),
  basis: z.enum(["X", "Z"]),
  measuredValue: z.union([z.literal(0), z.literal(1)]),
  eliminatedCandidate: z.string(),
});
const frame = <T extends number>(phase: T) =>
  z.object({
    phase: z.literal(phase),
    note: z.string(),
    breakerState,
    transition: z.string().nullable(),
    tokenTableAvailable: z.boolean(),
    detection: z.object({
      qber: z
        .object({
          errors: z.number().int().nonnegative(),
          tested: z.number().int().positive(),
        })
        .refine(({ errors, tested }) => errors <= tested)
        .nullable(),
      tier1: z.string(),
      tier2: z.string(),
    }),
  });
const digest = z.string().regex(/^[0-9a-f]{64}$/);
const certificate = z.object({
  schemaVersion: z.literal(1),
  sample: z.boolean(),
  runId: z.string(),
  scenario,
  seed: z.number().int(),
  receiverVerdicts: z.object({ bob: z.string(), charlie: z.string() }),
  hashAlgorithm: z.literal("SHA-256"),
  chainHead: digest,
  hashChain: z.array(
    z.object({
      phase: z.number().int().min(1).max(5),
      event: z.string(),
      breakerState,
      previousHash: digest.nullable(),
      hash: digest,
    }),
  ),
});

// Structured detector output for the run. The per-frame tier1/tier2 strings are a
// compatibility field (a printed dict); display code reads these typed fields instead.
const detectionDetail = z.object({
  qber_ci: z.tuple([z.number(), z.number()]),
  tier1: z
    .object({
      test_count: z.number().int().nonnegative(),
      error_count: z.number().int().nonnegative(),
      qber_estimate: z.number(),
      alarm_threshold_errors: z.number().int(),
      false_alarm_alpha: z.number(),
      alarm: z.boolean(),
      p_value: z.number(),
      early_abort: z.boolean(),
      tokens_sent: z.number().int(),
      tokens_planned: z.number().int(),
    })
    .nullable(),
  tier2: z
    .object({
      applicable: z.boolean(),
      attribution: z.string(),
      copies: z.number().int().nonnegative(),
      contradictions: z.number().int().nonnegative(),
      p_excess: z.number(),
      p_channel: z.number(),
      alpha2: z.number(),
      beta: z.number(),
    })
    .nullable(),
  evidence_p: z.number(),
  decided_by: z.string(),
  details: z.string(),
});

const outcome = z.object({
  classification: z.string(),
  verdict: z.string(),
  is_threat_detected: z.boolean(),
  enforcement_action: z.string(),
  link: z.string(),
  link_state: z.string(),
  incident_id: z.string().nullable(),
});

// Per-verifier view of the elimination table. Present only when the signature was revealed.
const richToken = z.object({
  verifier: z.enum(["bob", "charlie"]),
  position: z.number().int().nonnegative(),
  prepared_symbol: z.string(),
  revealed_bits: z.tuple([z.number().int(), z.number().int()]),
  held_tokens: z.array(z.string()),
  eliminated_states: z.array(z.string()),
  contradiction: z.boolean(),
});

// Phase data as exported by the engine. Only the fields the role panels read are typed.
const keepForward = z.array(z.enum(["K", "F"]));
const phases = z.tuple([
  z.object({ data: z.object({ bob_actions: keepForward, charlie_actions: keepForward }) }),
  z.object({ data: z.object({ tokens_planned: z.number().int() }) }),
  z.object({
    data: z.object({
      session_id: z.string(),
      message_digest: z.string(),
      nonce: z.string(),
      verifiers: z.array(z.string()),
    }),
  }),
  z.object({ status: z.string() }),
  z.object({ status: z.string(), data: z.object({ session_outcome: z.string() }) }),
]);

// What the attack injector set. Admin-only: never shown to verifiers or the detector.
const groundTruth = z.object({
  injected_scenario: z.string(),
  dishonest_verifier: z.string().nullable(),
  note: z.string(),
});

const auditCertificate = z.object({
  artifact_id: z.string(),
  chain_seq: z.number().int(),
  post_quantum: z.boolean(),
  assurance: z.string(),
});

export const replaySchema = z.object({
  schemaVersion: z.literal(1),
  scenario,
  seed: z.number().int(),
  sample: z.boolean(),
  tokens: z.array(token),
  frames: z.tuple([frame(1), frame(2), frame(3), frame(4), frame(5)]),
  certificate,
  detectionDetail,
  outcome,
  richTokens: z.array(richToken),
  phases,
  ground_truth: groundTruth,
  auditCertificate,
});

export type Replay = z.infer<typeof replaySchema>;
export type Scenario = z.infer<typeof scenario>;

// Exported compatibility frames can contain a terminal readout even when no
// signature was revealed. Preserve the recording; classify its display separately.
export function getReplayOutcome(replay: Replay) {
  const earlyAbort = replay.tokens.length === 0 && replay.frames[4].note.endsWith("not_reached");
  return { earlyAbort, tokenCount: replay.tokens.length };
}

export function getPhaseStatus(replay: Replay, phase: number): "complete" | "not_reached" {
  return getReplayOutcome(replay).earlyAbort && phase >= 4 ? "not_reached" : "complete";
}

// Real recorded sessions exported from the engine by experiments/export_replays.py
// (seed 42, L=16). Attacked runs often abort before the reveal, so their token tables are
// empty and later frames are not reached - that is a measured outcome, not missing data.
const bundledReplays = [
  authentic,
  eveIntercept,
  eveCloning,
  evePartialIntercept,
  repudiation,
  dishonestBob,
].map((replay) => replaySchema.parse(replay));

export function getReplay(scenario: Scenario): Replay | undefined {
  return bundledReplays.find((replay) => replay.scenario === scenario);
}

export const scenarioOptions = scenarios.map((scenario) => ({
  scenario,
  available: getReplay(scenario) !== undefined,
}));
