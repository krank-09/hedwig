export const reproduceCommands = [
  "python run_experiments.py --seed 2026",
  "python run_experiments.py --quick",
] as const;

export const charts = [
  {
    id: "roc",
    title: "ROC curve, L=16",
    caption: "True-positive rate versus false-positive rate across thresholds.",
    alt: "ROC curve for L=16, showing true-positive rate against false-positive rate across detection thresholds.",
    sourcePath: "experiments/results/roc/",
    svg: "/figures/roc_L16.svg",
  },
  {
    id: "ablation",
    title: "Tier 1 vs Tier 1+2",
    caption: "Comparison with individual detection tiers removed.",
    alt: "Detection tier ablation comparing Tier 1 alone with Tier 1 and Tier 2 together.",
    sourcePath: "experiments/results/ablate_tiers/",
    svg: "/figures/ablate_tiers.svg",
  },
  {
    id: "early-abort",
    title: "Early abort on vs off",
    caption: "Comparison of sequential early abort enabled and disabled.",
    alt: "Experiment comparison with sequential early abort enabled versus disabled.",
    sourcePath: "experiments/results/ablate_early_abort/",
    svg: "/figures/ablate_early_abort.svg",
  },
  {
    id: "tightness",
    title: "Threshold tightness",
    caption: "Comparison of acceptance thresholds and their bounds.",
    alt: "Threshold tightness chart comparing acceptance thresholds with their bounds.",
    sourcePath: "experiments/results/tightness/",
    svg: "/figures/tightness.svg",
  },
];

export const researchFiles = [
  { path: "README.md", label: "Project overview" },
  { path: "run_experiments.py", label: "Experiment runner" },
  { path: "manifest.json", label: "Run provenance: commit, versions, and timings" },
  { path: "SECURITY_ARGUMENT.md", label: "Security argument" },
  { path: "PROOF.md", label: "Proof" },
];

