import { describe, expect, it } from "vitest";
import {
  getPhaseStatus,
  getReplay,
  getReplayOutcome,
  replaySchema,
  scenarioOptions,
  scenarios,
} from "@/data/replays";

describe("bundled demo replay", () => {
  it("provides all twelve real seed 42 recordings", () => {
    expect(scenarios).toEqual([
      "authentic",
      "eve_intercept",
      "eve_cloning",
      "eve_partial_intercept",
      "repudiation",
      "dishonest_bob",
      "eve_forgery",
      "message_tampering",
      "impersonation",
      "unknown_forwarder",
      "eve_loss_exploit",
      "eve_collective",
    ]);
    const recordings = scenarios.flatMap((scenario) => getReplay(scenario) ?? []);
    expect(recordings).toHaveLength(12);
    for (const recording of recordings) {
      expect(recording).toMatchObject({ seed: 42, sample: false });
      expect(recording.certificate).toMatchObject({ seed: 42, sample: false });
      // Every recording comes from the same engine commit, so they are comparable.
      expect(recording.provenance.git_commit).toBe(getReplay("authentic")!.provenance.git_commit);
      // Every recording shows a readable name, never a raw scenario id.
      expect(recording.label).not.toBe(recording.scenario);
    }
  });

  it("makes only scenarios with a bundled replay available in the picker", () => {
    expect(
      scenarioOptions.filter(({ available }) => available).map(({ scenario }) => scenario),
    ).toEqual([...scenarios]);
    expect(scenarioOptions.filter(({ available }) => !available)).toEqual([]);
  });

  it("has exactly five ordered phases", () => {
    const replay = replaySchema.parse(getReplay("authentic"));
    expect(replay.frames.map(({ phase }) => phase)).toEqual([1, 2, 3, 4, 5]);
    expect(replaySchema.safeParse({ ...replay, frames: replay.frames.slice(0, 4) }).success).toBe(
      false,
    );
  });

  it("bundles measurements, detection and state changes with a linked audit chain", () => {
    const replay = replaySchema.parse(getReplay("authentic"));
    expect(replay.tokens).toHaveLength(32);
    expect(replay.frames.some(({ detection }) => detection.qber !== null)).toBe(true);
    expect(replay.frames.map(({ breakerState }) => breakerState)).toEqual([
      "OPEN",
      "OPEN",
      "OPEN",
      "OPEN",
      "OPEN",
    ]);
    const { hashChain, chainHead } = replay.certificate;
    expect(hashChain.map(({ phase }) => phase)).toEqual([1, 2, 3, 4, 5]);
    expect(hashChain[0]?.previousHash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashChain.slice(1).map(({ previousHash }) => previousHash)).toEqual(
      hashChain.slice(0, -1).map(({ hash }) => hash),
    );
    expect(chainHead).toBe(hashChain.at(-1)?.hash);
  });

  it.each(["eve_intercept", "eve_cloning", "eve_partial_intercept"] as const)(
    "%s stops before signature evidence and marks phases 4–5 unreached",
    (scenario) => {
      const replay = replaySchema.parse(getReplay(scenario));
      expect(replay.tokens).toEqual([]);
      expect(getReplayOutcome(replay)).toEqual({ earlyAbort: true, tokenCount: 0 });
      expect(replay.frames.map(({ phase }) => getPhaseStatus(replay, phase))).toEqual([
        "complete",
        "complete",
        "complete",
        "not_reached",
        "not_reached",
      ]);
      expect(replay.frames[3].detection.qber?.tested).toBe(34);
    },
  );

  it("distinguishes the authentic run from early-aborted runs", () => {
    const replay = replaySchema.parse(getReplay("authentic"));
    expect(getReplayOutcome(replay)).toEqual({ earlyAbort: false, tokenCount: 32 });
    expect(replay.frames.map(({ phase }) => getPhaseStatus(replay, phase))).toEqual([
      "complete",
      "complete",
      "complete",
      "complete",
      "complete",
    ]);
    expect(replay.frames[4].tokenTableAvailable).toBe(true);
  });
});
