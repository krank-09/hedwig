export type BreakerState = "OPEN" | "WATCH" | "QUARANTINED" | "RESET_PENDING";

export type ThreatOutcome =
  | { kind: "breaker"; state: BreakerState; note?: string }
  | {
      kind: "breaker";
      state: BreakerState;
      next: BreakerState;
      relation: "or" | "escalating to";
      note?: string;
    }
  | { kind: "classical"; result: "rejected"; code: string }
  | { kind: "classical"; result: "incomplete" };

export interface Threat {
  name: string;
  description: string;
  outcome: ThreatOutcome;
  caveat?: string;
}

export const threats: Threat[] = [
  {
    name: "authentic",
    description: "Normal transmission over a noisy channel. Detected by: acceptance.",
    outcome: { kind: "breaker", state: "OPEN" },
  },
  {
    name: "eve_forgery",
    description:
      "Eve manufactures random tokens without Alice’s keys. Detected by: elimination table (~25% contradictions).",
    outcome: { kind: "breaker", state: "QUARANTINED" },
  },
  {
    name: "dishonest_bob",
    description:
      "Bob alters signature bits and forwards them to Charlie. Detected by: forward elimination check.",
    outcome: { kind: "breaker", state: "QUARANTINED" },
  },
  {
    name: "eve_intercept",
    description:
      "Intercept-resend, measuring in random Pauli bases. Detected by: Tier 1 channel test QBER.",
    outcome: { kind: "breaker", state: "QUARANTINED" },
  },
  {
    name: "message_tampering",
    description:
      "Eve modifies the plaintext in flight. Detected by: classical commitment and SHA-256 digest mismatch.",
    outcome: {
      kind: "breaker",
      state: "OPEN",
      note: "Link stays open to prevent denial of service.",
    },
  },
  {
    name: "repudiation",
    description:
      "Alice signs, then selectively flips revealed tokens. Detected by: Tier 2 attribution, disturbance vs signature mismatch.",
    outcome: { kind: "breaker", state: "QUARANTINED" },
  },
  {
    name: "replay",
    description:
      "A previously captured valid transmission is replayed. Detected by: context nonce and timestamp verification.",
    outcome: {
      kind: "breaker",
      state: "OPEN",
      note: "Link stays open to prevent denial of service.",
    },
  },
  {
    name: "impersonation",
    description:
      "Claiming Alice’s identity without a valid distribution. Detected by: sender identity and distribution record check.",
    outcome: {
      kind: "breaker",
      state: "OPEN",
      note: "Link stays open to prevent denial of service.",
    },
  },
  {
    name: "eve_loss_exploit",
    description:
      "Eve blocks disturbed tokens, simulating photon loss. Detected by: readout and channel loss anomaly detector.",
    outcome: { kind: "breaker", state: "WATCH", relation: "or", next: "QUARANTINED" },
  },
  {
    name: "eve_cloning",
    description:
      "Eve uses an optimal quantum cloner (universal or phase-covariant). Detected by: cloner fidelity bound violation.",
    outcome: { kind: "breaker", state: "QUARANTINED" },
  },
  {
    name: "eve_partial_intercept",
    description:
      "Eve intercepts only a fraction of tokens. Detected by: sequential early abort and Fisher’s escalation.",
    outcome: { kind: "breaker", state: "WATCH", relation: "escalating to", next: "QUARANTINED" },
  },
  {
    name: "eve_collective",
    description:
      "Eve couples an ancilla to every token with the same controlled-Ry and measures the ancillas after basis announcement. Detected by: dephasing of X-basis tokens raising test-token QBER (Tier 1).",
    outcome: {
      kind: "breaker",
      state: "WATCH",
      relation: "or",
      next: "QUARANTINED",
      note: "When detected.",
    },
    caveat: "One concrete collective attack, not a proof against collective attacks in general.",
  },
  {
    name: "dishonest_forwarder",
    description:
      "Receives the genuine package, alters the message or signature, forwards it. The next honest recipient rejects on digest or commitment mismatch.",
    outcome: { kind: "classical", result: "rejected", code: "DISHONEST_VERIFIER_FORGERY" },
  },
  {
    name: "forward_withheld",
    description:
      'Accepts but never forwards. Downstream members are "not reached"; the session is incomplete and no forgery is alleged.',
    outcome: { kind: "classical", result: "incomplete" },
  },
  {
    name: "route_manipulation",
    description: "Forwards the genuine package while claiming a deeper level. Refused at depth 0.",
    outcome: { kind: "classical", result: "rejected", code: "INVALID_TRANSFER" },
  },
  {
    name: "forward_replay",
    description:
      "The same package reaches a recipient twice. Refused as a duplicate without opening the reserve.",
    outcome: { kind: "classical", result: "rejected", code: "REPLAY_ATTACK" },
  },
  {
    name: "unknown_forwarder",
    description: "An identity that is not enrolled forwards the genuine package.",
    outcome: { kind: "classical", result: "rejected", code: "INVALID_TRANSFER" },
  },
];
