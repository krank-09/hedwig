# HEDWIG audit-explain add-on

Plain-language explanations of HEDWIG's signed audit records, for people with no background in
cryptography or quantum physics. Each explanation comes with pictures of the record's data and
can be exported as HTML or PDF.

This is a **separate add-on**. It contains no HEDWIG code. It uses HEDWIG only through HEDWIG's
existing API (`GET /api/audit/{id}`), so it needs no changes to HEDWIG's files.

```
HEDWIG page (Bob / Charlie)                 this add-on (127.0.0.1:8010)            Google Gemini
  "Signed audit record (TX-…)"  [Explain]
        │ 1. GET /api/audit/TX-… (viewer's own session; HEDWIG's access rules apply)
        │ 2. POST the record ───────────────────► /explain: facts digest ─────────► plain-language text
        │ 3. explanation + facts ◄────────────── saved, reused across restarts
        ▼
  dialog: explanation · the record at a glance · Download HTML · Save as PDF
```

## What the viewer sees

- **The explanation:** one sentence on what happened, 3–6 bullets with the real numbers, and
  "Why it matters".
- **The record at a glance**, drawn from the record itself rather than the model's text:
  - outcome banner and summary tiles;
  - an evidence meter (normal / suspicious / decisive, with the odds in words);
  - tokens delivered, test tokens wrong against the alarm line (overall and per route);
  - the error rate with its likely range;
  - each verifier's contradictions plus a ✓/✗ checklist of its checks;
  - the circuit-breaker change (e.g. Open → Blocked);
  - a timeline;
  - record integrity, the rules used, and the fidelity estimate.
- **Download HTML** (one self-contained file) and **Save as PDF** (the browser's print dialog).

## Run it

```bash
cd addons/audit-explain
pip install -r requirements.txt
export GEMINI_API_KEY=your-key
python service.py
```

It listens on `127.0.0.1:8010`. Check it with:

```bash
curl -s http://127.0.0.1:8010/health
```

Then load the add-on on a HEDWIG verifier page in **one** of these two ways.

**A. No change to HEDWIG (demo):** create a bookmark with this as its URL, then click it while on
Bob's or Charlie's page:

```text
javascript:(()=>{const s=document.createElement('script');s.src='http://127.0.0.1:8010/audit-explain.js';document.body.appendChild(s)})()
```

**B. Permanent (one line, for whoever maintains HEDWIG):** add this before `</body>` in the
verifier templates:

```html
<script src="http://127.0.0.1:8010/audit-explain.js" defer></script>
```

An **Explain** button appears beside each "Signed audit record" link.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | unset | Google AI Studio key. Without it, saved explanations still show and new ones report "set GEMINI_API_KEY". |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model used for explanations. |
| `ALLOWED_ORIGINS` | `http://localhost:8000,http://127.0.0.1:8000,http://0.0.0.0:8000` | HEDWIG page origins allowed to call the service (CORS). |
| `HOST` / `PORT` | `127.0.0.1` / `8010` | Keep it local: anyone who can reach it can use your Gemini quota. |
| `HEDWIG_EXPLANATIONS` | `data/audit_explanations.json` | Where explanations are saved (gitignored). |

For a deployed HEDWIG over HTTPS, the service must also be served over HTTPS (browsers block
mixed content), and that HEDWIG origin must be added to `ALLOWED_ORIGINS`.

## Privacy and accuracy

- **The key** stays in the service and is sent to Google in a request header, never to the browser.
- **What reaches Gemini** is a short facts digest of the record, about 2 KB instead of 20 KB.
  Hashes, keys and signatures are removed, and hop ids become names like `QR-1->bob`.
  - Private evidence (elimination tables, keep/forward choices) is never sent.
  - Per-route test counts are added only when HEDWIG returned the record's evidence, i.e. to an
    admin.
- **Access rules:** the record is fetched with the viewer's own session, so HEDWIG decides what
  each person may see.
- **Free tier:** on AI Studio's free tier, Google may use inputs to improve its products.
- **Accuracy safeguards:**
  - the prompt tells the model to use only facts in the digest and never invent numbers;
  - the pictures and facts table come straight from the record;
  - cut-off answers are rejected, never shown or saved.

## Tests

```bash
cd addons/audit-explain
python -m pytest -q tests
```

The service tests run with Gemini mocked. They cover:
- a real route-abort record;
- with and without evidence;
- invalid and oversized input;
- no key;
- CORS (the HEDWIG page allowed, other sites refused);
- saving;
- rejecting cut-off answers.

The add-on was also checked end to end in a browser against an unmodified HEDWIG `main` (92026f0).
