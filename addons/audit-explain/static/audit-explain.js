/*
 * HEDWIG audit-explain add-on: browser script.
 *
 * Load it on a HEDWIG verifier page (Bob or Charlie) with one tag:
 *   <script src="http://127.0.0.1:8010/audit-explain.js" defer></script>
 * or, without changing HEDWIG at all, from the bookmarklet in README.md.
 *
 * It adds an "Explain" button beside each "Signed audit record" link. On click it fetches the
 * record from HEDWIG's own GET /api/audit/{id} using the viewer's session (HEDWIG's access rules
 * apply), sends it to this add-on's service, and shows a plain-language explanation with pictures
 * of the record's data and HTML / PDF export. Self-contained: no HEDWIG code, no globals.
 */
(function () {
  'use strict';
  if (window.__hedwigAuditExplain) return;
  window.__hedwigAuditExplain = true;

  const SCRIPT = document.currentScript || [...document.scripts].find(s => /audit-explain\.js/.test(s.src));
  const SERVICE = SCRIPT && SCRIPT.src ? new URL(SCRIPT.src).origin : 'http://127.0.0.1:8010';

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  // Model text -> safe HTML: paragraphs, "- " bullets, a highlighted "Why it matters:" line.
  function renderExplanation(text) {
    const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let html = '', list = [];
    const flush = () => { if (list.length) { html += `<ul>${list.join('')}</ul>`; list = []; } };
    const clean = (s) => escapeHtml(s.replace(/\*\*(.+?)\*\*/g, '$1'));
    for (const line of lines) {
      const bullet = line.match(/^[-*•]\s+(.*)$/);
      if (bullet) { list.push(`<li>${clean(bullet[1])}</li>`); continue; }
      flush();
      html += /^why it matters:/i.test(line) ? `<p class="explain-why">${clean(line)}</p>` : `<p>${clean(line)}</p>`;
    }
    flush();
    return html;
  }

  // ---------------------------------------------------------------- pictures + export
  // Visual summary + export for plain-language audit explanations.
  // Everything here is drawn from the server's facts digest (exact numbers from the signed record's
  // JSON), never from the model's prose. Exports reuse the same markup with fixed colours.

  const AV_COLORS = {
    ok: '#176342', okBg: '#e3f3e9', bad: '#a72649', badBg: '#fbe5ed', warn: '#795300', warnBg: '#fff0c2',
    info: '#20568e', infoBg: '#e7effb', ink: '#172b2a', muted: '#536663', line: '#d4dfdb', soft: '#edf3f1',
    primary: '#0c777c',
  };
  const AV_STATE = {
    quarantined: { c: AV_COLORS.bad, bg: AV_COLORS.badBg, label: 'Blocked (quarantined)' },
    watch: { c: AV_COLORS.warn, bg: AV_COLORS.warnBg, label: 'On watch' },
    reset_pending: { c: AV_COLORS.info, bg: AV_COLORS.infoBg, label: 'On probation' },
    open: { c: AV_COLORS.ok, bg: AV_COLORS.okBg, label: 'Open' },
  };
  const AV_CHECK_LABELS = {
    distribution_record_found: 'Has a record of the tokens it received',
    sender_matches_record: 'Sender is who they claim to be',
    addressed_to_verifier: 'Addressed to this verifier',
    session_not_aborted: 'Channel test passed before reveal',
    fresh: 'Fresh, not a replay',
    elimination_pass: "Signature matches the verifier's own measurements",
    message_digest_matches: 'Message unchanged since signing',
    commitment_matches: "Matches Alice's earlier commitment",
  };
  const avEsc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const avCap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  const avHuman = (s) => avCap(String(s || '').toLowerCase().replace(/_/g, ' '));
  const avPct = (x, d) => `${(100 * x).toFixed(d ?? (x < 0.1 ? 1 : 0))}%`;

  // Readable size for big odds: 4,300 / 2.5 million / 15.7 quadrillion (never a long digit run).
  function avBig(n) {
    const names = [[1e18, 'quintillion'], [1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
    if (n >= 1e21) return 'more than a sextillion';
    for (const [v, name] of names) if (n >= v) return `${(n / v).toFixed(n / v < 10 ? 1 : 0).replace(/\.0$/, '')} ${name}`;
    const r = n >= 1000 ? Math.round(n / 100) * 100 : n >= 100 ? Math.round(n / 10) * 10 : Math.round(n);
    return r.toLocaleString("en-US");
  }

  function avOdds(p) {
    if (p === null || p === undefined || Number.isNaN(p)) return null;
    if (p <= 0) return 'effectively impossible by chance';
    if (p >= 0.5) return 'quite likely by chance';
    const n = 1 / p;
    return `about 1 in ${avBig(n)} by chance`;
  }
  const avEvidenceP = (f) => (f.final_outcome || {}).evidence_p ?? (f.policy_response || {}).evidence_p;
  const avCard = (title, body, note) => body
    ? `<figure class="av-card"><figcaption>${avEsc(title)}</figcaption>${body}${note ? `<p class="av-note">${note}</p>` : ''}</figure>` : '';

  // ---------------------------------------------------------------- outcome banner + tiles
  function avOutcome(f) {
    const o = f.final_outcome || {};
    const aborted = o.session_outcome === 'distribution_aborted';
    const kind = o.accepted ? 'ok' : aborted ? 'warn' : 'bad';
    const title = o.accepted ? 'Accepted: the signature checked out'
      : aborted ? 'Stopped safely before the signature was revealed' : 'Rejected';
    const sub = [o.classification && avHuman(o.classification), o.decided_by && `decided by ${String(o.decided_by).replace(/_/g, ' ')}`]
      .filter(Boolean).join(' · ');
    return `<div class="av-banner av-${kind}"><strong>${avEsc(title)}</strong>${sub ? `<span>${avEsc(sub)}</span>` : ''}</div>`;
  }

  function avTiles(f) {
    const o = f.final_outcome || {}, t = f.overall_channel_test, l = f.link_changes || {};
    const p = avEvidenceP(f);
    const st = AV_STATE[l.link_state_now];
    const tile = (label, value, color) => `<div class="av-tile"><span>${avEsc(label)}</span><b style="color:${color}">${avEsc(value)}</b></div>`;
    const tiles = [
      tile('Verdict', o.accepted ? 'Accepted' : o.session_outcome === 'distribution_aborted' ? 'Stopped safely' : o.verdict ? avHuman(o.verdict) : '—',
        o.accepted ? AV_COLORS.ok : o.session_outcome === 'distribution_aborted' ? AV_COLORS.warn : AV_COLORS.bad),
      p !== undefined && p !== null ? tile('Chance it is an accident', p <= 0 ? '≈ 0' : avOdds(p).replace(' by chance', '').replace('about ', ''),
        p <= 0.001 ? AV_COLORS.bad : p <= 0.01 ? AV_COLORS.warn : AV_COLORS.ok) : '',
      t ? tile('Test tokens wrong', `${t.came_back_wrong} of ${t.test_tokens}`, t.alarm ? AV_COLORS.bad : t.came_back_wrong ? AV_COLORS.warn : AV_COLORS.ok) : '',
      tile('Link after this', st ? st.label : 'No change', st ? st.c : AV_COLORS.ok),
    ].filter(Boolean);
    return `<div class="av-tiles">${tiles.join('')}</div>`;
  }

  // ---------------------------------------------------------------- evidence strength
  function avEvidence(f) {
    const p = avEvidenceP(f);
    if (p === undefined || p === null) return '';
    const pos = p <= 0 ? 100 : Math.min(100, Math.max(0, (-Math.log10(p) / 6) * 100));
    const zone = p <= 0.001 ? ['Decisive', AV_COLORS.bad] : p <= 0.01 ? ['Suspicious', AV_COLORS.warn] : ['Normal', AV_COLORS.ok];
    return avCard('How unlikely this is to be an accident', `
      <div class="av-scale" role="img" aria-label="${avEsc(`Evidence: ${zone[0]}, ${avOdds(p)}`)}">
        <span class="av-zone" style="width:33.3%;background:${AV_COLORS.okBg}">normal</span>
        <span class="av-zone" style="width:16.7%;background:${AV_COLORS.warnBg}">suspicious</span>
        <span class="av-zone" style="width:50%;background:${AV_COLORS.badBg}">decisive</span>
        <span class="av-pin" style="left:${pos}%"></span></div>`,
      `<b style="color:${zone[1]}">${zone[0]}</b>: ${avEsc(avOdds(p))} (p = ${p === 0 ? '0' : p < 0.001 ? p.toExponential(1) : p.toFixed(3)}). ` +
      'Decisive evidence blocks the link at once; suspicious evidence puts it on watch.');
  }

  // ---------------------------------------------------------------- tokens and error rate
  function avBar(label, right, frac, color, markerFrac, aria) {
    const marker = markerFrac !== undefined && markerFrac !== null
      ? `<span class="av-mark" style="left:${Math.min(100, markerFrac * 100)}%"></span>` : '';
    return `<div class="av-row"><div class="av-row-head"><span>${avEsc(label)}</span><span>${right}</span></div>
      <div class="av-track" role="img" aria-label="${avEsc(aria)}"><span class="av-fill" style="width:${Math.max(frac * 100, frac > 0 ? 2 : 0)}%;background:${color}"></span>${marker}</div></div>`;
  }

  function avDelivery(t) {
    const [sent, received, lost] = t.tokens_sent_received_lost || [];
    if (!sent) return '';
    return `<div class="av-row"><div class="av-row-head"><span>Quantum tokens delivered</span>
        <span><b>${received}</b> of ${sent} arrived${lost ? ` · <b style="color:${AV_COLORS.bad}">${lost} lost</b>` : ' · none lost'}</span></div>
      <div class="av-track av-split" role="img" aria-label="${avEsc(`${received} of ${sent} tokens arrived, ${lost} lost`)}">
        <span style="width:${(received / sent) * 100}%;background:${AV_COLORS.ok}"></span><span style="width:${(lost / sent) * 100}%;background:${AV_COLORS.bad}"></span></div></div>`;
  }

  function avTestRow(label, t) {
    const n = t.test_tokens, k = t.came_back_wrong || 0, thr = t.alarm_if_more_than;
    const col = t.alarm ? AV_COLORS.bad : k > 0 ? AV_COLORS.warn : AV_COLORS.ok;
    return avBar(label, `<b>${k}</b> of ${n} wrong (${avPct(k / n)})${t.alarm ? ` · <b style="color:${AV_COLORS.bad}">alarm</b>` : ''}`,
      k / n, col, thr !== undefined ? (thr + 0.5) / n : null, `${label}: ${k} of ${n} test tokens wrong; alarm if more than ${thr}`);
  }

  // Error rate with its uncertainty, on a 0-30% axis, against the assumed honest rate.
  function avRate(t, honest) {
    if (t.wrong_share === undefined) return '';
    const max = 0.3, X = (v) => `${Math.min(100, (v / max) * 100)}%`;
    const [lo, hi] = t.wrong_share_interval || [t.wrong_share, t.wrong_share];
    const col = t.alarm ? AV_COLORS.bad : t.wrong_share > (honest ?? 0.02) ? AV_COLORS.warn : AV_COLORS.ok;
    return `<div class="av-row"><div class="av-row-head"><span>Error rate, with its likely range</span>
        <span><b>${avPct(t.wrong_share)}</b>${t.wrong_share_interval ? ` (likely ${avPct(lo)}–${avPct(hi)})` : ''}</span></div>
      <div class="av-axis" role="img" aria-label="${avEsc(`Error rate ${avPct(t.wrong_share)}, likely between ${avPct(lo)} and ${avPct(hi)}; honest links about ${avPct(honest ?? 0.02)}; full eavesdropping about 25%`)}">
        <span class="av-band" style="left:${X(lo)};width:calc(${X(hi)} - ${X(lo)});background:${col}33;border-color:${col}"></span>
        <span class="av-dot2" style="left:${X(t.wrong_share)};background:${col}"></span>
        <span class="av-ref" style="left:${X(honest ?? 0.02)}" title="honest"></span><span class="av-ref av-ref-bad" style="left:${X(0.25)}" title="eavesdropper"></span></div>
      <div class="av-axis-labels"><span>0%</span><span style="left:${X(honest ?? 0.02)}">honest ≈${avPct(honest ?? 0.02, 0)}</span><span style="left:${X(0.25)}">eavesdropper ≈25%</span><span style="right:0">30%</span></div></div>`;
  }

  function avTokens(f) {
    const t = f.overall_channel_test;
    if (!t) return '';
    const honest = (f.rules_used || {}).honest_wrong_share_assumed;
    const rows = [avDelivery(t), avTestRow('Secret test tokens (all)', t),
      ...Object.entries(f.per_route_tests || {}).map(([v, rt]) => avTestRow(`${avCap(v)}'s route`, rt)),
      avRate(t, honest)];
    return avCard('Quantum tokens and the channel test', rows.join(''),
      'Some tokens are secret tests: if too many come back wrong, someone may be listening. The black line on each bar is the alarm level.');
  }

  // ---------------------------------------------------------------- each verifier's check + checklist
  function avVerifiers(f) {
    const entries = Object.entries(f.verifier_checks || {});
    if (!entries.length) return '';
    const blocks = entries.map(([label, c]) => {
      const n = c.copies_checked, k = c.mismatches || 0, lim = c.accept_if_at_most;
      const head = `${avCap(label)}${c.forwarded_by ? ` · forwarded by ${avCap(c.forwarded_by)}` : ''}`;
      const verdict = c.accepted ? `<b style="color:${AV_COLORS.ok}">accepted</b>` : `<b style="color:${AV_COLORS.bad}">rejected</b>`;
      // The record keeps the first-stage limit. Accepting above it is only possible through the
      // two-stage rule: a borderline count opens pre-committed reserve copies, and the total passed.
      const viaReserve = c.accepted && lim !== undefined && k > lim;
      const bar = n ? avBar('Contradictions found', `<b>${k}</b> of ${n} copies (first-look limit ≤ ${lim ?? '—'})`, k / n,
        c.accepted ? (viaReserve ? AV_COLORS.warn : AV_COLORS.ok) : AV_COLORS.bad, lim !== undefined ? (lim + 0.5) / n : null,
        `${label}: ${k} of ${n} copies contradicted; first-look limit ${lim}`) +
        (viaReserve ? `<p class="av-note">Borderline at first look, so extra reserve copies were checked; the combined result passed.</p>` : '') : '';
      const list = Object.entries(c.checks_passed || {}).map(([key, ok]) =>
        `<li class="${ok ? 'av-pass' : 'av-fail'}"><span aria-hidden="true">${ok ? '✓' : '✗'}</span>${avEsc(AV_CHECK_LABELS[key] || avHuman(key))}<span class="av-sr">${ok ? ' passed' : ' failed'}</span></li>`).join('');
      return `<div class="av-verifier"><div class="av-row-head"><span><b>${avEsc(head)}</b></span><span>${verdict}</span></div>${bar}
        ${list ? `<ul class="av-checklist">${list}</ul>` : ''}</div>`;
    }).join('');
    return avCard("Each verifier's checks", blocks, 'Every check must pass for a verifier to accept. Honest signatures contradict very rarely.');
  }

  // ---------------------------------------------------------------- circuit breaker
  function avBreaker(f) {
    const l = f.link_changes;
    if (!l || !l.link) return avCard('Circuit breaker', `<p class="av-chipline"><span class="av-chip" style="background:${AV_COLORS.okBg};color:${AV_COLORS.ok}">No link changed state</span></p>`, '');
    const chip = (s) => { const x = AV_STATE[s] || { c: AV_COLORS.muted, bg: AV_COLORS.soft, label: avHuman(s) }; return `<span class="av-chip" style="background:${x.bg};color:${x.c}">${avEsc(x.label)}</span>`; };
    const line = `<p class="av-chipline"><b>${avEsc(l.link)}</b> ${l.link_state_before ? `${chip(l.link_state_before)} <span class="av-arrow">→</span> ` : ''}${chip(l.link_state_now)}</p>`;
    const meta = [l.triggered_by && `found by ${String(l.triggered_by).replace(/_/g, ' ')}`, l.incident && `incident ${l.incident}`]
      .filter(Boolean).map(avEsc).join(' · ');
    return avCard('Circuit breaker', line + (l.reason ? `<p class="av-note">${avEsc(l.reason)}</p>` : ''), meta);
  }

  // ---------------------------------------------------------------- timeline
  function avTimeline(f) {
    const t = f.timing;
    if (!t) return '';
    const step = (title, sub) => `<li><b>${avEsc(title)}</b><span>${avEsc(sub)}</span></li>`;
    const issued = t.record_issued_after_ms >= 1000 ? `${(t.record_issued_after_ms / 1000).toFixed(1)} s later` : `${t.record_issued_after_ms} ms later`;
    return avCard('Timeline', `<ol class="av-timeline">
      ${step('Session started', t.started || '')}
      ${step('Signed record issued', issued)}
      ${t.freshness_window_s ? step('Freshness window', `a signature older than ${t.freshness_window_s} s is refused as a replay`) : ''}</ol>`, '');
  }

  // ---------------------------------------------------------------- integrity + rules
  function avIntegrity(f) {
    const r = f.rules_used || {}, fid = f.fidelity_estimate;
    const items = [];
    if (f.record_number_in_chain !== undefined) items.push(['Audit chain', `record #${f.record_number_in_chain}, linked to the one before`]);
    if ((f.digitally_signed_with || []).length) items.push(['Signed with', f.digitally_signed_with.join(', ')]);
    if (f.post_quantum_signature !== undefined) items.push(['Post-quantum signature', f.post_quantum_signature ? 'yes' : 'no (classical only)']);
    if (f.assurance) items.push(['Assurance', avHuman(f.assurance)]);
    if (r.honest_wrong_share_assumed !== undefined) items.push(['Honest error rate assumed', avPct(r.honest_wrong_share_assumed, 0)]);
    if (r.false_alarm_rate !== undefined) items.push(['False-alarm rate allowed', avPct(r.false_alarm_rate, 0)]);
    if (r.decisive_evidence_level !== undefined) items.push(['Decisive below', `p = ${r.decisive_evidence_level}`]);
    let fidBar = '';
    if (fid) {
      const [lo, hi] = fid.interval || [fid.estimate, fid.estimate];
      fidBar = `<div class="av-row"><div class="av-row-head"><span>Teleportation fidelity (estimate)</span><span><b>${avPct(fid.estimate, 1)}</b> (likely ${avPct(lo, 0)}–${avPct(hi, 0)})</span></div>
        <div class="av-axis" role="img" aria-label="${avEsc(`Fidelity ${avPct(fid.estimate, 1)}`)}"><span class="av-band" style="left:${lo * 100}%;width:${(hi - lo) * 100}%;background:${AV_COLORS.primary}33;border-color:${AV_COLORS.primary}"></span>
        <span class="av-dot2" style="left:${fid.estimate * 100}%;background:${AV_COLORS.primary}"></span></div></div>`;
    }
    if (!items.length && !fidBar) return '';
    return avCard('Record integrity and the rules used',
      `<dl class="av-dl">${items.map(([k, v]) => `<dt>${avEsc(k)}</dt><dd>${avEsc(v)}</dd>`).join('')}</dl>${fidBar}`,
      fid ? 'Fidelity is a model-based estimate from the test tokens, not a direct measurement.' : '');
  }

  function renderAuditVisuals(facts) {
    if (!facts || !facts.final_outcome) return '';
    return `<section class="av" aria-label="Visual summary">${avOutcome(facts)}${avTiles(facts)}
      <div class="av-grid">${avEvidence(facts)}${avTokens(facts)}${avVerifiers(facts)}${avBreaker(facts)}${avTimeline(facts)}${avIntegrity(facts)}</div></section>`;
  }

  // ---------------------------------------------------------------- styles (in-app and export)
  const AV_EXPORT_CSS = `
    *{box-sizing:border-box} body{margin:0;padding:32px;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:${AV_COLORS.ink};background:#fff}
    main{max-width:820px;margin:0 auto} h1{font-size:22px;margin:0 0 4px} .meta{color:${AV_COLORS.muted};font-size:13px;margin:0 0 20px}
    h2{font-size:16px;margin:24px 0 8px} .explain-body p{margin:0 0 8px} .explain-body ul{margin:0 0 12px;padding-left:22px}
    .explain-why{font-weight:600;color:${AV_COLORS.primary}} table{border-collapse:collapse;width:100%;font-size:13px}
    td{border-top:1px solid ${AV_COLORS.line};padding:5px 8px;vertical-align:top} td:first-child{color:${AV_COLORS.muted};width:34%}
    footer{margin-top:24px;padding-top:12px;border-top:1px solid ${AV_COLORS.line};color:${AV_COLORS.muted};font-size:12px}
    @media print{body{padding:0} .av-card,.av-tiles{break-inside:avoid}}`;

  const AV_CSS = `
    .av{margin:4px 0 16px}.av-banner{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;padding:10px 14px;border-radius:8px;margin-bottom:10px;border:1px solid}
    .av-banner span{font-size:13px;opacity:.85}.av-ok{background:${AV_COLORS.okBg};color:${AV_COLORS.ok};border-color:#9fcfb1}
    .av-warn{background:${AV_COLORS.warnBg};color:${AV_COLORS.warn};border-color:#e2c265}.av-bad{background:${AV_COLORS.badBg};color:${AV_COLORS.bad};border-color:#e7a3b8}
    .av-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:12px}
    .av-tile{border:1px solid ${AV_COLORS.line};border-radius:8px;padding:8px 10px;background:#fff}.av-tile span{display:block;font-size:11px;color:${AV_COLORS.muted}}.av-tile b{font-size:17px;display:block;overflow-wrap:anywhere;line-height:1.3}
    .av-grid{display:grid;gap:12px;grid-template-columns:1fr}.av-card{margin:0;padding:12px 14px;border:1px solid ${AV_COLORS.line};border-radius:8px;background:#fff}
    .av-card figcaption{font-weight:600;font-size:13px;margin-bottom:6px;color:${AV_COLORS.ink}}
    .av-row{margin:10px 0}.av-row-head{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:${AV_COLORS.ink};flex-wrap:wrap}
    .av-track{position:relative;height:12px;background:${AV_COLORS.soft};border-radius:6px;margin-top:4px}.av-split{display:flex;overflow:hidden}
    .av-fill{display:block;height:12px;border-radius:6px}.av-mark{position:absolute;top:-4px;width:2px;height:20px;background:${AV_COLORS.ink}}
    .av-axis{position:relative;height:16px;margin-top:6px;border-bottom:2px solid ${AV_COLORS.line}}
    .av-band{position:absolute;top:2px;height:12px;border:1px solid;border-radius:6px}.av-dot2{position:absolute;top:1px;width:14px;height:14px;margin-left:-7px;border-radius:50%;border:2px solid #fff}
    .av-ref{position:absolute;top:-2px;width:2px;height:20px;background:${AV_COLORS.ok}}.av-ref-bad{background:${AV_COLORS.bad}}
    .av-axis-labels{position:relative;height:16px;font-size:11px;color:${AV_COLORS.muted}}.av-axis-labels span{position:absolute;transform:translateX(-50%);white-space:nowrap}
    .av-axis-labels span:first-child{transform:none;left:0}.av-axis-labels span:last-child{transform:none}
    .av-scale{position:relative;display:flex;height:22px;border-radius:6px;font-size:11px;color:${AV_COLORS.muted}}
    .av-zone{display:flex;align-items:center;justify-content:center}.av-pin{position:absolute;top:-5px;width:4px;height:32px;margin-left:-2px;background:${AV_COLORS.ink};border-radius:2px}
    .av-verifier{padding:8px 0;border-top:1px solid ${AV_COLORS.line}}.av-verifier:first-of-type{border-top:0;padding-top:0}
    .av-checklist{list-style:none;margin:6px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2px 12px;font-size:13px}
    .av-checklist li{display:flex;gap:6px}.av-pass span:first-child{color:${AV_COLORS.ok};font-weight:700}.av-fail{color:${AV_COLORS.bad}}.av-fail span:first-child{font-weight:700}
    .av-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
    .av-chipline{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:2px 0;font-size:14px}.av-chip{padding:2px 10px;border-radius:999px;font-size:13px;font-weight:600}.av-arrow{color:${AV_COLORS.muted}}
    .av-timeline{list-style:none;margin:4px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}
    .av-timeline li{border-left:3px solid ${AV_COLORS.primary};padding:2px 0 2px 10px;font-size:13px}.av-timeline li span{display:block;color:${AV_COLORS.muted};font-size:12px}
    .av-dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0;font-size:13px}.av-dl dt{color:${AV_COLORS.muted}}.av-dl dd{margin:0}
    .av-note{font-size:12px;color:${AV_COLORS.muted};margin:8px 0 0}`;



  // ---------------------------------------------------------------- export (HTML file, PDF via print)
  function avFactsTable(f) {
    const rows = [];
    const add = (k, v) => { if (v !== undefined && v !== null && v !== '') rows.push(`<tr><td>${avEsc(k)}</td><td>${avEsc(v)}</td></tr>`); };
    const o = f.final_outcome || {}, r = f.policy_response || {}, l = f.link_changes || {}, t = f.overall_channel_test || {};
    add('Record', `${f.record_type || ''} ${f.id || ''}`.trim());
    add('Time', f.time);
    add('Outcome', [o.verdict, o.classification, o.session_outcome].filter(Boolean).join(' · '));
    add('Decided by', o.decided_by && String(o.decided_by).replace(/_/g, ' '));
    add('Evidence', avEvidenceP(f) !== undefined ? `p = ${avEvidenceP(f)} (${avOdds(avEvidenceP(f))})` : '');
    add('Policy response', [r.response_action, r.severity].filter(Boolean).join(' · '));
    add('Link changed', l.link && `${l.link}: ${l.link_state_before ? `${l.link_state_before} → ` : ''}${l.link_state_now}${l.incident ? ` (incident ${l.incident})` : ''}`);
    if (t.test_tokens) add('Test tokens', `${t.came_back_wrong} of ${t.test_tokens} wrong; alarm if more than ${t.alarm_if_more_than}`);
    for (const [label, c] of Object.entries(f.verifier_checks || {})) {
      const failed = Object.entries(c.checks_passed || {}).filter(([, ok]) => !ok).map(([k]) => AV_CHECK_LABELS[k] || k);
      add(`Verifier: ${label}`, `${c.accepted ? 'accepted' : 'rejected'}; ${c.mismatches ?? '—'} of ${c.copies_checked ?? '—'} copies contradicted` +
        (failed.length ? `; failed: ${failed.join(', ')}` : ''));
    }
    add('Assurance', f.assurance);
    add('Digitally signed with', (f.digitally_signed_with || []).join(', '));
    add('Position in audit chain', f.record_number_in_chain);
    return rows.length ? `<table>${rows.join('')}</table>` : '<p>No details available.</p>';
  }

  function avExportDocument(artifactId, data) {
    const f = data.facts || {};
    const when = data.saved_at ? new Date(data.saved_at * 1000).toLocaleString() : new Date().toLocaleString();
    const visuals = renderAuditVisuals(f);
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>HEDWIG audit ${avEsc(artifactId)}, in plain language</title><style>${AV_EXPORT_CSS}${AV_CSS}</style></head>
  <body><main>
  <h1>Audit record ${avEsc(artifactId)}, in plain language</h1>
  <p class="meta">HEDWIG simulated quantum digital signature system · explanation ${data.cached ? 'saved' : 'generated'} ${avEsc(when)} · model ${avEsc(data.model)}</p>
  <h2>What happened</h2><div class="explain-body">${renderExplanation(data.explanation)}</div>
  ${visuals ? `<h2>The record at a glance</h2>${visuals}` : ''}
  <h2>Key facts from the signed record</h2>${avFactsTable(f)}
  <footer>${avEsc(data.notice || '')} The explanation was written by Google Gemini; the pictures and facts come directly from the signed record.
  This is a record of a simulated system, not of physical quantum hardware.</footer>
  </main></body></html>`;
  }

  function avDownloadHtml(artifactId, data) {
    const blob = new Blob([avExportDocument(artifactId, data)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedwig-audit-${artifactId}-explained.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // PDF: print the same document from a hidden frame; the browser's print dialog offers "Save as PDF".
  function avSavePdf(artifactId, data) {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    frame.srcdoc = avExportDocument(artifactId, data);
    const returnTo = document.activeElement;
    frame.onload = () => {
      const w = frame.contentWindow;
      w.focus();
      w.print();  // blocks until the print dialog closes in most browsers
      // Give keyboard focus back to the page so Escape closes the explanation dialog again.
      if (returnTo && typeof returnTo.focus === 'function') returnTo.focus();
      setTimeout(() => frame.remove(), 60_000);
    };
    document.body.appendChild(frame);
  }

  // ---------------------------------------------------------------- dialog
  const UI_CSS = `
    .hx-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;margin-left:8px;border:1px solid #82958f;border-radius:6px;background:#fff;color:#172b2a;font:inherit;font-size:14px;cursor:pointer}
    .hx-btn:hover{background:#edf3f1}.hx-btn:focus-visible{outline:3px solid rgba(12,119,124,.35);outline-offset:1px}
    .hx-dialog{width:min(760px,calc(100vw - 32px));max-height:min(88vh,900px);margin:auto;padding:0;border:1px solid #d4dfdb;border-radius:8px;background:#fff;color:#172b2a;box-shadow:0 4px 16px rgba(23,43,42,.12)}
    .hx-dialog::backdrop{background:rgba(23,43,42,.35)}
    .hx-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #d4dfdb}
    .hx-head h2{font-size:16px;font-weight:600;margin:0}.hx-close{background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:#536663;padding:0 4px}
    .hx-body{padding:16px;overflow:auto;font-size:15px;line-height:1.55}.hx-body p{margin:0 0 8px}.hx-body ul{margin:0 0 12px;padding-left:22px}
    .hx-body .explain-why{font-weight:600;color:#0c777c}.hx-sub{font-size:14px;font-weight:600;margin:16px 0 8px}
    .hx-loading{color:#536663}.hx-error{color:#a72649}
    .hx-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 16px;border-top:1px solid #d4dfdb;background:#edf3f1;font-size:12px;color:#536663}
    .hx-foot .hx-btn{margin-left:0}`;

  (function injectStyles() {
    const s = document.createElement('style');
    s.id = 'hxStyles';
    s.textContent = UI_CSS + AV_CSS;
    document.head.appendChild(s);
  })();

  function dialog() {
    let dlg = document.getElementById('hxExplainDialog');
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.id = 'hxExplainDialog';
    dlg.className = 'hx-dialog';
    dlg.setAttribute('aria-labelledby', 'hxTitle');
    dlg.innerHTML = `<div class="hx-head"><h2 id="hxTitle">Audit record, in plain language</h2>
      <button type="button" class="hx-close" data-close aria-label="Close">×</button></div>
      <div class="hx-body" id="hxBody" aria-live="polite"></div><div class="hx-foot" id="hxFoot"></div>`;
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    document.body.appendChild(dlg);
    return dlg;
  }

  async function readJson(res) {
    try { return await res.json(); } catch (e) { return null; }
  }

  async function explain(recordUrl, artifactId) {
    const dlg = dialog();
    const body = dlg.querySelector('#hxBody'), foot = dlg.querySelector('#hxFoot');
    const raw = `<a class="hx-btn" href="${escapeHtml(recordUrl)}" target="_blank">Signed record (${escapeHtml(artifactId)})</a>`;
    body.setAttribute('aria-busy', 'true');
    body.innerHTML = `<p class="hx-loading">Explaining ${escapeHtml(artifactId)}…</p>`;
    foot.innerHTML = raw;
    if (!dlg.open) dlg.showModal();
    try {
      // 1. The record, from HEDWIG itself, with this viewer's session and access rules.
      const recRes = await fetch(recordUrl, { credentials: 'same-origin' });
      if (!recRes.ok) {
        const d = await readJson(recRes);
        throw new Error(recRes.status === 401 ? 'Your HEDWIG session has expired; log in again.'
          : `HEDWIG would not provide this record (${recRes.status}${d && d.detail ? `: ${d.detail}` : ''}).`);
      }
      const cert = await recRes.json();
      // 2. The explanation, from the add-on service.
      let res;
      try {
        res = await fetch(`${SERVICE}/explain`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cert) });
      } catch (e) {
        throw new Error(`The explain service is not reachable at ${SERVICE}. Start it with: python service.py`);
      }
      const data = await readJson(res);
      if (!res.ok) throw new Error((data && data.detail) || `Explain service error ${res.status}`);
      const visuals = renderAuditVisuals(data.facts);
      body.innerHTML = renderExplanation(data.explanation) + (visuals ? `<h3 class="hx-sub">The record at a glance</h3>${visuals}` : '');
      const when = data.saved_at ? new Date(data.saved_at * 1000).toLocaleString() : '';
      foot.innerHTML = `${raw}<button type="button" class="hx-btn" data-export="html">Download HTML</button>` +
        `<button type="button" class="hx-btn" data-export="pdf">Save as PDF</button>` +
        `<span>${escapeHtml(data.notice)} Model: ${escapeHtml(data.model)}.${when ? ` ${data.cached ? 'Saved explanation from' : 'Generated and saved'} ${escapeHtml(when)}.` : ''}</span>`;
      foot.querySelector('[data-export="html"]').addEventListener('click', () => avDownloadHtml(artifactId, data));
      foot.querySelector('[data-export="pdf"]').addEventListener('click', () => avSavePdf(artifactId, data));
    } catch (err) {
      body.innerHTML = `<p class="hx-error">${escapeHtml(err.message)}</p><p>The signed record is still available as JSON below.</p>`;
    } finally {
      body.removeAttribute('aria-busy');
    }
  }

  // ---------------------------------------------------------------- buttons beside the signed record
  // HEDWIG's verifier pages render the link "Signed audit record (<id>)" to /api/audit/<id>.
  const LINK = 'a[href^="/api/audit/"]';
  function addButtons(root) {
    for (const a of root.querySelectorAll(LINK)) {
      if (a.dataset.hxDone || !/signed audit record/i.test(a.textContent)) continue;
      a.dataset.hxDone = '1';
      const id = decodeURIComponent(a.getAttribute('href').split('/').pop().split('?')[0]);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hx-btn';
      btn.textContent = 'Explain';
      btn.title = 'Explain this record in plain language';
      btn.dataset.hxExplain = id;
      btn.addEventListener('click', (e) => { e.preventDefault(); explain(a.href, id); });
      a.insertAdjacentElement('afterend', btn);
    }
  }
  addButtons(document);
  new MutationObserver(() => addButtons(document)).observe(document.body, { childList: true, subtree: true });
})();
