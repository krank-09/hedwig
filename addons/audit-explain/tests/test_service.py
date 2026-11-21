"""The audit-explain add-on service. Gemini is mocked; the record is a real HEDWIG audit record."""
import copy
import json
import pathlib
import re
import sys

import pytest
from fastapi.testclient import TestClient

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import explainer  # noqa: E402
import service  # noqa: E402

RECORD = json.loads((HERE / "fixtures" / "audit_route_abort.json").read_text())
ORIGIN = "http://127.0.0.1:8000"


@pytest.fixture(autouse=True)
def isolated(tmp_path, monkeypatch):
    monkeypatch.setenv("HEDWIG_EXPLANATIONS", str(tmp_path / "explanations.json"))
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    explainer._saved = None
    yield tmp_path / "explanations.json"
    explainer._saved = None


@pytest.fixture()
def gemini(monkeypatch):
    calls = []

    def fake(facts_text, model, api_key):
        calls.append(json.loads(facts_text))
        return "The run was stopped safely.\n- 3 of Bob's 17 test tokens were wrong.\nWhy it matters: the tap was caught."

    monkeypatch.setattr(explainer, "_call_gemini", fake)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    return calls


client = TestClient(service.app)


def test_serves_the_browser_script():
    r = client.get("/audit-explain.js")
    assert r.status_code == 200 and "javascript" in r.headers["content-type"]
    assert "signed audit record" in r.text.lower(), "finds HEDWIG's signed-record links"
    assert "renderAuditVisuals" in r.text and "/api/audit/" in r.text


def test_explains_an_admin_record_with_route_details(gemini, isolated):
    r = client.post("/explain", json=RECORD, headers={"Origin": ORIGIN})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["artifact_id"] == "TX-27B202F8" and body["cached"] is False
    assert body["explanation"].startswith("The run was stopped safely.")
    f = body["facts"]
    assert f["link_changes"]["link"] == "QR-1->bob"
    assert f["per_route_tests"]["bob"]["came_back_wrong"] == 3, "evidence present -> route details used"
    sent = json.dumps(gemini[0])
    assert not re.search(r"\b[0-9a-f]{64}\b", sent) and "bob_actions" not in sent
    assert json.loads(isolated.read_text()), "explanation saved"
    again = client.post("/explain", json=RECORD).json()
    assert again["cached"] is True and len(gemini) == 1


def test_a_verifier_record_without_evidence_gets_no_route_details(gemini):
    stripped = copy.deepcopy(RECORD)
    stripped.pop("evidence")
    f = client.post("/explain", json=stripped).json()["facts"]
    assert "per_route_tests" not in f and f["link_changes"]["link"] == "QR-1->bob"


def test_rejects_things_that_are_not_audit_records(gemini):
    assert client.post("/explain", content=b"not json").status_code == 400
    assert client.post("/explain", json={"hello": "world"}).status_code == 400
    assert client.post("/explain", json={"format": "hedwig-audit/3", "record": {}}).status_code == 400
    assert client.post("/explain", content=b"{" + b" " * 2_000_001 + b"}").status_code == 413
    assert gemini == []


def test_without_a_key_it_says_so(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    r = client.post("/explain", json=RECORD)
    assert r.status_code == 503 and "GEMINI_API_KEY" in r.json()["detail"]


def test_cors_allows_the_hedwig_page_only():
    ok = client.options("/explain", headers={"Origin": ORIGIN, "Access-Control-Request-Method": "POST",
                                             "Access-Control-Request-Headers": "content-type"})
    assert ok.headers.get("access-control-allow-origin") == ORIGIN
    other = client.options("/explain", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert other.headers.get("access-control-allow-origin") is None


def test_health_reports_configuration(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    assert client.get("/health").json() == {"ok": True, "gemini_configured": True, "model": "gemini-2.5-flash"}


def test_cut_off_answers_are_rejected(monkeypatch):
    import io

    class Resp(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    payload = {"candidates": [{"content": {"parts": [{"text": "The"}]}, "finishReason": "MAX_TOKENS"}]}
    monkeypatch.setattr(explainer.urllib.request, "urlopen", lambda req, timeout: Resp(json.dumps(payload).encode()))
    with pytest.raises(explainer.ExplainFailed, match="incomplete"):
        explainer._call_gemini("{}", "gemini-2.5-flash", "k")


def test_dotenv_supplies_the_key_without_overriding(tmp_path, monkeypatch):
    env = tmp_path / ".env"
    env.write_text('# comment\nexport GEMINI_API_KEY="from-file"\nGEMINI_MODEL=gemini-x\n\nnot a pair\n')
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_MODEL", "already-set")
    explainer._load_dotenv(str(env))
    import os
    assert os.environ["GEMINI_API_KEY"] == "from-file"
    assert os.environ["GEMINI_MODEL"] == "already-set", "the terminal's value wins"
    explainer._load_dotenv(str(tmp_path / "missing.env"))
