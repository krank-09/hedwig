export interface TeamMember {
  /** Name as it should appear. */
  name: string;
  /** Their lead role, short. */
  role: string;
  /** What they own. Keep each item short and concrete. */
  areas: string[];
}

/**
 * Team ATHENA, QHack-2026.
 *
 * Source: the team's work allocation (HEDWIG_team_work_allocation.xlsx, "Read Me" and
 * "Task Allocation" tabs). Edit here; the page renders this array in order.
 * An empty array shows a "names pending" note instead of empty cards.
 */
export const team: TeamMember[] = [
  {
    name: "Miki",
    role: "Integration lead · quantum protocol and backend",
    areas: [
      "Protocol core: teleportation, channel, transcripts, verifiers",
      "FastAPI routes, authentication and persistence",
      "Merge coordination and the integration build",
    ],
  },
  {
    name: "Ankit",
    role: "UI lead",
    areas: [
      "Role dashboards: Alice/admin, Bob and Charlie",
      "Client-side API calls and live WebSocket updates",
      "Loading, error and connection states",
      "This project website",
    ],
  },
  {
    name: "Jashan",
    role: "Threat detection and circuit breaker",
    areas: [
      "Statistical channel detection and disturbance attribution",
      "Circuit-breaker policy and enforcement",
      "Experiment scenario validation",
    ],
  },
  {
    name: "Dhairya",
    role: "Audit, signing and testing",
    areas: [
      "Q-Cert audit trail and cryptographic signing",
      "Replay protection and audit persistence",
      "Regression test lead",
    ],
  },
];

export const TEAM_NAME = "Team ATHENA";
export const TEAM_EVENT = "QHack-2026";
