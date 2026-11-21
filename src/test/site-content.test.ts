import { describe, expect, it } from "vitest";

import { claims, groupClaims } from "@/data/claims";
import { charts, reproduceCommands } from "@/data/research";
import { REPO_URL } from "@/data/site";
import { steps } from "@/data/steps";
import { threats } from "@/data/threats";

describe("HEDWIG content", () => {
  it("keeps an interval and source alongside every verified result", () => {
    for (const claim of claims.filter(({ verified }) => verified)) {
      expect(claim.interval).toMatch(/^\[\d+\.\d+, \d+\.\d+\]$/);
      expect(claim.source?.path).toBe("experiments/results/trials/results.json");
    }
  });

  it("has no public repository URL while the repository is private", () => {
    expect(REPO_URL).toBeNull();
  });

  it("groups existing claims without losing or changing rows", () => {
    const groups = groupClaims(claims);
    expect(groups.map(({ category }) => category)).toEqual([
      "False alarms",
      "Detection",
      "Flagged as threat",
      "Link quarantined",
    ]);
    expect(groups.flatMap(({ rows }) => rows)).toEqual(claims);
  });

  it("uses the four supplied experiment figures and source paths", () => {
    expect(charts.map(({ id, svg, sourcePath }) => [id, svg, sourcePath])).toEqual([
      ["roc", "/figures/roc_L16.svg", "experiments/results/roc/"],
      ["ablation", "/figures/ablate_tiers.svg", "experiments/results/ablate_tiers/"],
      ["early-abort", "/figures/ablate_early_abort.svg", "experiments/results/ablate_early_abort/"],
      ["tightness", "/figures/tightness.svg", "experiments/results/tightness/"],
    ]);
  });

  it("preserves the requested experiment arguments", () => {
    expect(reproduceCommands).toEqual([
      "python run_experiments.py --seed 2026",
      "python run_experiments.py --quick",
    ]);
  });

  it("includes the five supplied protocol steps", () => {
    expect(steps.map(({ title }) => title)).toEqual([
      "Token generation & symmetrisation",
      "Teleportation & elimination",
      "Commitment binding",
      "Channel testing & sequential early abort",
      "Independent verification & response",
    ]);
  });

  it("has twelve circuit-breaker scenarios before the five classical outcomes", () => {
    expect(threats.slice(0, 12).filter(({ outcome }) => outcome.kind === "breaker")).toHaveLength(
      12,
    );
    expect(threats.slice(12).map(({ outcome }) => outcome)).toEqual([
      { kind: "classical", result: "rejected", code: "DISHONEST_VERIFIER_FORGERY" },
      { kind: "classical", result: "incomplete" },
      { kind: "classical", result: "rejected", code: "INVALID_TRANSFER" },
      { kind: "classical", result: "rejected", code: "REPLAY_ATTACK" },
      { kind: "classical", result: "rejected", code: "INVALID_TRANSFER" },
    ]);
  });

  it("keeps the link open for tampering, replay and impersonation", () => {
    expect(
      threats
        .filter(({ name }) => ["message_tampering", "replay", "impersonation"].includes(name))
        .map(({ outcome }) => outcome),
    ).toMatchObject([
      { kind: "breaker", state: "OPEN" },
      { kind: "breaker", state: "OPEN" },
      { kind: "breaker", state: "OPEN" },
    ]);
  });

  it("distinguishes alternate states from escalation", () => {
    expect(threats.find(({ name }) => name === "eve_loss_exploit")?.outcome).toMatchObject({
      state: "WATCH",
      relation: "or",
      next: "QUARANTINED",
    });
    expect(threats.find(({ name }) => name === "eve_partial_intercept")?.outcome).toMatchObject({
      state: "WATCH",
      relation: "escalating to",
      next: "QUARANTINED",
    });
    expect(threats.find(({ name }) => name === "eve_collective")?.outcome).toMatchObject({
      state: "WATCH",
      relation: "or",
      next: "QUARANTINED",
      note: "When detected.",
    });
  });
});
