export interface Claim {
  id: string;
  label: string;
  value: string;
  interval: string;
  category: string | null;
  source: { path: string; href: string } | null;
  verified: boolean;
}

// Every statistic shown on the site must come from this file. Do not hardcode numbers in components.
// Every statistic shown on the site must come from this file. Do not hardcode numbers in components.
//
// Source: experiments/results/trials/results.json in the QDS engine repository.
// Seed 2026, 1000 trials per cell, L=16, depolarising channel, 95% Wilson intervals.
// Generated 2026-11-19. Never show a rate without its interval.
export const claims: Claim[] = [
  // Landing-page claim cards.
  {
    id: "honest-false-quarantine",
    label: "Honest transmissions that quarantined the link",
    value: "0.000",
    interval: "[0.000, 0.004]",
    category: "False alarms",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "forgery-detected",
    label: "Forged packages flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Detection",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "intercept-detected",
    label: "Intercept-resend flagged as a threat",
    value: "0.999",
    interval: "[0.994, 1.000]",
    category: "Detection",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "partial-intercept-detected",
    label: "Partial intercept-resend flagged at L=16",
    value: "0.048",
    interval: "[0.036, 0.063]",
    category: "Detection",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },

  // Full scenario table for /results. Flagged-as-threat rate.
  {
    id: "flagged-authentic",
    label: "authentic — flagged as a threat",
    value: "0.008",
    interval: "[0.004, 0.016]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_forgery",
    label: "eve_forgery — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-dishonest_bob",
    label: "dishonest_bob — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_intercept",
    label: "eve_intercept — flagged as a threat",
    value: "0.999",
    interval: "[0.994, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-message_tampering",
    label: "message_tampering — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-repudiation",
    label: "repudiation — flagged as a threat",
    value: "0.994",
    interval: "[0.987, 0.997]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-replay",
    label: "replay — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-impersonation",
    label: "impersonation — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_loss_exploit",
    label: "eve_loss_exploit — flagged as a threat",
    value: "0.684",
    interval: "[0.655, 0.712]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_cloning",
    label: "eve_cloning — flagged as a threat",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_partial_intercept",
    label: "eve_partial_intercept — flagged as a threat",
    value: "0.048",
    interval: "[0.036, 0.063]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "flagged-eve_collective",
    label: "eve_collective — flagged as a threat",
    value: "0.101",
    interval: "[0.084, 0.121]",
    category: "Flagged as threat",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },

  // Link quarantined. A zero is often deliberate: see the threat catalogue.
  {
    id: "quarantined-authentic",
    label: "authentic — link quarantined",
    value: "0.000",
    interval: "[0.000, 0.004]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_forgery",
    label: "eve_forgery — link quarantined",
    value: "0.946",
    interval: "[0.930, 0.958]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-dishonest_bob",
    label: "dishonest_bob — link quarantined",
    value: "1.000",
    interval: "[0.996, 1.000]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_intercept",
    label: "eve_intercept — link quarantined",
    value: "0.962",
    interval: "[0.948, 0.972]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-message_tampering",
    label: "message_tampering — link quarantined",
    value: "0.000",
    interval: "[0.000, 0.004]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-repudiation",
    label: "repudiation — link quarantined",
    value: "0.675",
    interval: "[0.645, 0.703]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-replay",
    label: "replay — link quarantined",
    value: "0.000",
    interval: "[0.000, 0.004]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-impersonation",
    label: "impersonation — link quarantined",
    value: "0.000",
    interval: "[0.000, 0.004]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_loss_exploit",
    label: "eve_loss_exploit — link quarantined",
    value: "0.422",
    interval: "[0.392, 0.453]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_cloning",
    label: "eve_cloning — link quarantined",
    value: "0.819",
    interval: "[0.794, 0.842]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_partial_intercept",
    label: "eve_partial_intercept — link quarantined",
    value: "0.002",
    interval: "[0.001, 0.007]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
  {
    id: "quarantined-eve_collective",
    label: "eve_collective — link quarantined",
    value: "0.003",
    interval: "[0.001, 0.009]",
    category: "Link quarantined",
    source: {
      path: "experiments/results/trials/results.json",
      href: "https://github.com/miki-dev-5618/QDS/blob/main/experiments/results/trials/results.json",
    },
    verified: true,
  },
];

/** The four cards shown on the landing page, including the weak result. */
export const landingClaims = claims.slice(0, 4);

export function groupClaims(items: readonly Claim[]) {
  const groups = new Map<Claim["category"], Claim[]>();
  for (const claim of items) {
    const group = groups.get(claim.category);
    if (group) group.push(claim);
    else groups.set(claim.category, [claim]);
  }
  return Array.from(groups, ([category, rows]) => ({ category, rows }));
}
