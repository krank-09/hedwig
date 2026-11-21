# v1 UI: role dashboards, audit explanations and report

Work by Ankit (T06, UI dashboards and client interactions) for the HEDWIG v1 consoles, which live
in the engine repo (QDS), not in this website. It is stored here as patches. It is **not** used by
the website and does not affect its build.

## Apply to QDS

Base: QDS `main` at `92026f0`. All seven patches apply cleanly in order (checked: 20 files,
+1,358 / −54).

```bash
cd QDS
git switch -c feat/v1-ui-audit-explain 92026f0
git am /path/to/hedwig/contributions/v1-ui/*.patch
```

## What the patches contain

| # | Patch | What it does |
|---|---|---|
| 1 | build role-based dashboards | T06: visible loading, error and offline states for Admin, Bob and Charlie. Non-blocking toasts instead of `alert()`; a "live updates paused" bar with reconnect backoff; a failed threat arm rolls back; clearer login errors. |
| 2 | plain-language explanations via Gemini | **Explain** button for audit records. New `GET /api/audit/{id}/explain` with the same access rules as the record itself. The key comes from `GEMINI_API_KEY` (server side, sent in a header); the model from `GEMINI_MODEL`. No new dependencies. |
| 3 | complete, saved explanations | Fixes cut-off answers (thinking is off for flash models; incomplete answers are rejected). Explanations are saved to `data/audit_explanations.json` and survive restarts. The button now sits only beside "Signed audit record" on the verifier terminals. |
| 4 | explain from a facts digest | Gemini gets a short facts digest (about 2 KB instead of 20 KB) with hop names instead of hashes, plus a field-guide prompt. Private evidence is never sent. |
| 5 | refused-send crash fix | A 423 "no eligible route" crashed the admin console ("Cannot set properties of null"). Also, the routing page's reset message was being overwritten by an old refusal. |
| 6 | visual summary and HTML/PDF export | "At a glance" pictures under the explanation, plus **Download HTML** (a self-contained page) and **Save as PDF** (the browser's print dialog). |
| 7 | the record's data, visually | Summary tiles, evidence meter, token delivery, test-token bars per route, error rate with its range, each verifier's checks (✓/✗), the circuit-breaker change, a timeline, record integrity and the rules used. |

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | unset (feature off) | Google AI Studio key. Server side only. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model for explanations. |
| `HEDWIG_EXPLANATIONS` | `data/audit_explanations.json` | Where explanations are saved (gitignored). |

Privacy: each explained record is sent to Google once, as a facts digest without evidence. On
AI Studio's free tier, Google may use inputs to improve its products.

## Verification (2026-11-22)

- `tests/test_explainer.py`: 15 tests pass, with Gemini mocked. They cover the facts digest on a real
  route-abort record, saving and restart, cut-off answers, access rules, and no hashes or private
  evidence in what is sent.
- The existing API tests are unchanged. The 2 known failures on QDS `main`
  (`test_quarantine_blocks_until_reset`, `test_state_and_records_survive_restart`) come from the
  forgery-policy difference described in `v1.5/HANDOFF.md`, not from these patches.
- Browser checks with Playwright:
  - dashboards: 10/10;
  - refusal and reset flow: 6/6;
  - explanation pictures and HTML/PDF export on two real cases (an eavesdropping abort and a
    dishonest-verifier forgery): 37/37;
  - no page errors in any run.
