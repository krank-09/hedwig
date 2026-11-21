import type { Replay } from "./index";

export type Verifier = "bob" | "charlie";
export const VERIFIERS: Verifier[] = ["bob", "charlie"];

const SYMBOL: Record<string, string> = { "00": "|0⟩", "10": "|1⟩", "01": "|+⟩", "11": "|−⟩" };
/** revealed_bits is [bit, basis]: basis 0 = Z (|0⟩, |1⟩), basis 1 = X (|+⟩, |−⟩). */
export const revealedSymbol = ([bit, basis]: readonly [number, number]) =>
  SYMBOL[`${bit}${basis}`] ?? "?";

export interface VerifierCheck {
  held: string[];
  eliminated: string[];
  /** Held copies whose eliminated state equals the revealed state. */
  mismatches: number;
}

export interface TokenStep {
  position: number;
  prepared: string | null;
  revealed: string;
  checks: Partial<Record<Verifier, VerifierCheck>>;
}

export interface Running {
  mismatches: number;
  checked: number;
}

/**
 * One step per signature position, as each verifier checked it. Copies checked and mismatches
 * are counted per held copy, which reproduces the engine's totals (e.g. "bob 4/22").
 */
export function tokenSteps(replay: Replay): TokenStep[] {
  const byPosition = new Map<number, TokenStep>();
  for (const t of replay.richTokens) {
    const revealed = revealedSymbol(t.revealed_bits);
    const step = byPosition.get(t.position) ?? {
      position: t.position,
      prepared: t.prepared_symbol,
      revealed,
      checks: {},
    };
    step.checks[t.verifier] = {
      held: t.held_tokens,
      eliminated: t.eliminated_states,
      mismatches: t.eliminated_states.filter((s) => s === revealed).length,
    };
    byPosition.set(t.position, step);
  }
  return [...byPosition.values()].sort((a, b) => a.position - b.position);
}

/** Cumulative copies checked and mismatches per verifier after each step (index = step). */
export function runningTotals(steps: TokenStep[]): Record<Verifier, Running[]> {
  const out: Record<Verifier, Running[]> = { bob: [], charlie: [] };
  for (const v of VERIFIERS) {
    let mismatches = 0;
    let checked = 0;
    for (const step of steps) {
      const c = step.checks[v];
      if (c) {
        mismatches += c.mismatches;
        checked += c.eliminated.length;
      }
      out[v].push({ mismatches, checked });
    }
  }
  return out;
}

/**
 * Acceptance limits, only where the recording states them: the detector's explanation names
 * them for rejected runs ("bob 4/22 (limit 0)", "7/19 copies contradict charlie's own
 * eliminations (limit 0)"). Accepted runs don't record a limit, so none is returned.
 */
export function statedLimits(details: string): Partial<Record<Verifier, number>> {
  const out: Partial<Record<Verifier, number>> = {};
  for (const m of details.matchAll(/\b(bob|charlie) \d+\/\d+ \(limit (\d+)\)/g)) {
    out[m[1] as Verifier] = Number(m[2]);
  }
  for (const m of details.matchAll(
    /\d+\/\d+ copies contradict (bob|charlie)'s own eliminations \(limit (\d+)\)/g,
  )) {
    out[m[1] as Verifier] = Number(m[2]);
  }
  return out;
}

/** Shorten an engine label like "Charlie Forwarded -> Bob (Copy 2)" for tight layouts. */
export function shortHeld(label: string): string {
  const copy = label.match(/\(Copy (\d+)\)/)?.[1];
  const from = label.match(/^(\w+) Forwarded/)?.[1];
  if (from) return `from ${from}${copy ? ` · copy ${copy}` : ""}`;
  return `kept${copy ? ` · copy ${copy}` : ""}`;
}
