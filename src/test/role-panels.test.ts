import { describe, expect, it } from "vitest";

import { getReplay, scenarios } from "@/data/replays";

describe("role panels: per-role data in every recorded run", () => {
  it.each(scenarios)("%s: keep/forward actions cover every signature position", (scenario) => {
    const replay = getReplay(scenario)!;
    const { bob_actions, charlie_actions } = replay.phases[0].data;
    expect(bob_actions.length).toBe(charlie_actions.length);
    expect(bob_actions.length).toBeGreaterThan(0);
  });

  it.each(scenarios)("%s: each verifier's table has one row per position", (scenario) => {
    const replay = getReplay(scenario)!;
    const n = replay.phases[0].data.bob_actions.length;
    for (const role of ["bob", "charlie"] as const) {
      const rows = replay.richTokens.filter((t) => t.verifier === role);
      if (rows.length === 0) continue; // signature not revealed to this verifier
      expect(rows.map((t) => t.position)).toEqual(Array.from({ length: n }, (_, i) => i));
    }
  });

  it.each(scenarios)("%s: a verifier with a table has a real verdict", (scenario) => {
    const replay = getReplay(scenario)!;
    for (const role of ["bob", "charlie"] as const) {
      const hasTable = replay.richTokens.some((t) => t.verifier === role);
      const verdict = replay.certificate.receiverVerdicts[role];
      if (hasTable) expect(["accepted", "rejected"]).toContain(verdict);
    }
  });

  it("authentic: both verifiers accept with zero contradictions", () => {
    const replay = getReplay("authentic")!;
    expect(replay.certificate.receiverVerdicts).toEqual({ bob: "accepted", charlie: "accepted" });
    expect(replay.richTokens.filter((t) => t.contradiction)).toHaveLength(0);
  });

  it("dishonest_bob: only Charlie verifies Bob's forwarded signature", () => {
    const replay = getReplay("dishonest_bob")!;
    expect(replay.richTokens.every((t) => t.verifier === "charlie")).toBe(true);
    expect(replay.certificate.receiverVerdicts.charlie).toBe("rejected");
  });
});
