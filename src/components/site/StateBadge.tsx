import { CheckCircle2, Eye, ShieldAlert, RotateCcw, HelpCircle } from "lucide-react";
import type { BreakerState } from "@/data/threats";

const map = {
  OPEN: { icon: CheckCircle2, cls: "text-state-open bg-state-open-bg border-state-open/40" },
  WATCH: { icon: Eye, cls: "text-state-watch bg-state-watch-bg border-state-watch/40" },
  QUARANTINED: {
    icon: ShieldAlert,
    cls: "text-state-quarantined bg-state-quarantined-bg border-state-quarantined/40",
  },
  RESET_PENDING: {
    icon: RotateCcw,
    cls: "text-state-reset bg-state-reset-bg border-state-reset/40",
  },
} as const;

const base = "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs";

export function StateBadge({ state }: { state: BreakerState | null }) {
  if (!state) {
    return (
      <span className={`${base} text-pending bg-pending-bg border-border`}>
        <HelpCircle className="size-3.5" aria-hidden /> outcome [pending]
      </span>
    );
  }
  const { icon: Icon, cls } = map[state];
  return (
    <span className={`${base} ${cls}`}>
      <Icon className="size-3.5" aria-hidden /> {state}
    </span>
  );
}

export function PendingBadge() {
  return (
    <span className={`${base} text-pending bg-pending-bg border-dashed border-pending/50`}>
      <HelpCircle className="size-3.5" aria-hidden /> pending verification
    </span>
  );
}
