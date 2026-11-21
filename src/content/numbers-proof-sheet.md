# Numbers & Proof Sheet

**Scope:** this sheet summarizes figures that are backed by files currently linked in this repository. Items
that were not included in the empirical result set are identified as pending rather than reported as measured.

## Executive summary

- HEDWIG distinguishes honest transmissions from several coded threats and records the resulting circuit-breaker
  or classical outcome.
- The empirical result set is seeded and reproducible. The website uses Wilson confidence intervals for reported
  proportions.
- The paper currently states the scale and protocol caveats; the full security proof is not complete.

## Reproducibility

| Item | Repository status |
|---|---|
| Seed | `2026` in the reproduction command |
| Reproduce command | `python run_experiments.py --seed 2026` |
| Reproduce quick command | `python run_experiments.py --quick` |
| Current result source | `experiments/results/trials/results.json` |
| Full proof manuscript | Not present in this repository |
| Manifest / commit / timings | Not currently linked |

## Empirical detection and link outcomes

| Threat scenario | Flagged as threat | 95% Wilson interval | Link quarantine | 95% Wilson interval |
|---|---|---|---|---|
| authentic | 0.008 | [0.004, 0.016] | 0.000 | [0.000, 0.004] |
| eve_forgery | 1.000 | [0.996, 1.000] | 0.946 | [0.930, 0.958] |
| dishonest_bob | 1.000 | [0.996, 1.000] | 1.000 | [0.996, 1.000] |
| eve_intercept | 0.999 | [0.994, 1.000] | 0.962 | [0.948, 0.972] |
| message_tampering | 1.000 | [0.996, 1.000] | 0.000 | [0.000, 0.004] |
| repudiation | 0.994 | [0.987, 0.997] | 0.675 | [0.645, 0.703] |
| replay | 1.000 | [0.996, 1.000] | 0.000 | [0.000, 0.004] |
| impersonation | 1.000 | [0.996, 1.000] | 0.000 | [0.000, 0.004] |
| eve_loss_exploit | 0.684 | [0.655, 0.712] | 0.422 | [0.392, 0.453] |
| eve_cloning | 1.000 | [0.996, 1.000] | 0.819 | [0.794, 0.842] |
| eve_partial_intercept | 0.048 | [0.036, 0.063] | 0.002 | [0.001, 0.007] |

## Pending or theoretical entries

The following entries in the supplied summary do not have a verified, linked empirical source in this repository:

- `eve_loss_exploit` surviving-token threshold and 100% theoretical detection
- Quantum-cloner fidelity cap and a theoretical 100% detection rate
- Partial-intercept 85% detection estimate and its confidence interval
- Noise-versus-eavesdropping ROC-AUC around 0.96
- Early-abort bandwidth savings of approximately 45%
- Total test-module count
- Trial count for every attack configuration

They are not shown as measured findings until their source files and values are available in the
frontend claim or research data modules.
