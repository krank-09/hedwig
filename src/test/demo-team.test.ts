import { describe, expect, it } from "vitest";

import { getReplay, scenarios } from "@/data/replays";
import { team } from "@/data/team";

describe("demo replays: structured detection data", () => {
  it.each(scenarios)("%s has a verdict and an explanation", (scenario) => {
    const replay = getReplay(scenario);
    expect(replay).toBeDefined();
    expect(replay!.outcome.verdict.length).toBeGreaterThan(0);
    expect(replay!.detectionDetail.details.length).toBeGreaterThan(0);
  });

  it.each(scenarios)("%s: tier 1 counts agree with the phase-4 QBER frame", (scenario) => {
    const replay = getReplay(scenario)!;
    const { tier1 } = replay.detectionDetail;
    const qber = replay.frames[3].detection.qber;
    if (!tier1) return; // decided by route tests; no tier 1 result to compare
    expect(qber).not.toBeNull();
    expect({ errors: tier1.error_count, tested: tier1.test_count }).toEqual(qber);
  });

  it.each(scenarios)("%s: QBER interval brackets the estimate", (scenario) => {
    const {
      qber_ci: [low, high],
    } = getReplay(scenario)!.detectionDetail;
    if (low === null || high === null) {
      // No test tokens were exchanged (impersonated sender): both ends are absent together.
      expect([low, high]).toEqual([null, null]);
      expect(getReplay(scenario)!.frames.every((f) => f.detection.qber === null)).toBe(true);
      return;
    }
    expect(low).toBeLessThanOrEqual(high);
    expect(low).toBeGreaterThanOrEqual(0);
    expect(high).toBeLessThanOrEqual(1);
  });
});

describe("team", () => {
  it("lists every member with a role and at least one area", () => {
    expect(team.length).toBeGreaterThan(0);
    for (const member of team) {
      expect(member.name.trim()).not.toBe("");
      expect(member.role.trim()).not.toBe("");
      expect(member.areas.length).toBeGreaterThan(0);
    }
    expect(new Set(team.map((m) => m.name)).size).toBe(team.length);
  });
});
