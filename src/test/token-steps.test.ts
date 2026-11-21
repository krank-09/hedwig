import { describe, expect, it } from "vitest";

import { getRawReplay, getReplay, scenarios } from "@/data/replays";
import {
  revealedSymbol,
  runningTotals,
  shortHeld,
  statedLimits,
  tokenSteps,
} from "@/data/replays/tokenSteps";

const final = (scenario: (typeof scenarios)[number]) => {
  const t = runningTotals(tokenSteps(getReplay(scenario)!));
  return { bob: t.bob.at(-1), charlie: t.charlie.at(-1) };
};

describe("token-by-token replay data", () => {
  it("reproduces the engine's per-copy totals stated in the detector text", () => {
    // repudiation: "bob 4/22 (limit 0); charlie 1/10 (limit 0)"
    expect(final("repudiation")).toEqual({
      bob: { mismatches: 4, checked: 22 },
      charlie: { mismatches: 1, checked: 10 },
    });
    // dishonest_bob: "7/19 copies contradict charlie's own eliminations"
    expect(final("dishonest_bob").charlie).toEqual({ mismatches: 7, checked: 19 });
  });

  it("authentic run: every copy is consistent", () => {
    const { bob, charlie } = final("authentic");
    expect(bob?.mismatches).toBe(0);
    expect(charlie?.mismatches).toBe(0);
    expect((bob?.checked ?? 0) + (charlie?.checked ?? 0)).toBeGreaterThan(0);
  });

  it.each(scenarios)("%s: one step per revealed position, in order", (scenario) => {
    const replay = getReplay(scenario)!;
    const steps = tokenSteps(replay);
    if (replay.richTokens.length === 0) {
      expect(steps).toHaveLength(0); // stopped before the reveal
      return;
    }
    expect(steps.map((s) => s.position)).toEqual(steps.map((_, k) => k));
  });

  it("reads limits only where the recording states them", () => {
    expect(statedLimits(getReplay("repudiation")!.detectionDetail.details)).toEqual({
      bob: 0,
      charlie: 0,
    });
    expect(statedLimits(getReplay("dishonest_bob")!.detectionDetail.details)).toEqual({
      charlie: 0,
    });
    expect(statedLimits(getReplay("authentic")!.detectionDetail.details)).toEqual({});
  });

  it("maps revealed bits to states and shortens held-copy labels", () => {
    expect([
      revealedSymbol([0, 0]),
      revealedSymbol([1, 0]),
      revealedSymbol([0, 1]),
      revealedSymbol([1, 1]),
    ]).toEqual(["|0⟩", "|1⟩", "|+⟩", "|−⟩"]);
    expect(shortHeld("Bob Kept (Copy 1)")).toBe("kept · copy 1");
    expect(shortHeld("Charlie Forwarded -> Bob (Copy 2)")).toBe("from Charlie · copy 2");
  });

  it("offers the exact exported recording for download", () => {
    const raw = getRawReplay("authentic") as { scenario: string; provenance: unknown };
    expect(raw.scenario).toBe("authentic");
    expect(raw.provenance).toBeDefined();
  });
});
