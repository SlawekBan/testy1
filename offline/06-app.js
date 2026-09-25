/* =====================================================================
   Aplikacja: nawigacja, strona główna, rekomendacje, zegar, ustawienia
   ===================================================================== */
let view = "home", query = "", curMod = null;
const usedNow = new Set(), touched = new Set();
// czas liczy się dopiero, gdy użytkownik coś zrobi w narzędziu (samo otwarcie z przykładem się nie liczy)
["input","change","click"].forEach(ev => document.getElementById("main").addEventListener(ev, e => { if (curMod && e.isTrusted && e.target.closest("#ws")) touched.add(curMod.id); }, true));
function markUse(id){
  if (!touched.has(id) || usedNow.has(id)) return; usedNow.add(id);
  const s = M.stats[id] ||= {uses:0}; s.uses++; s.last = Date.now();
  const t0 = today().getTime();
  if (!M.log.some(x => x.id === id && x.t >= t0)) { M.log.push({t: Date.now(), id, min: (byId(id) || {}).min || 10}); M.log = M.log.slice(-1500); }
  persist(); renderClock();
}
function minutesOn(day){ const a = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime(), b = a + 864e5; return M.log.filter(x => x.t >= a && x.t < b).reduce((s, x) => s + x.min, 0); }
function renderClock(){ const m = minutesOn(new Date()), C = 113.1; $("#ring").setAttribute("stroke-dashoffset", (C - C * Math.min(m, 60) / 60).toFixed(1)); $("#savedToday").textContent = `${m} min`; $("#savedSub").textContent = m >= 60 ? "dziś, cel osiągnięty" : `dziś, do celu ${60 - m} min`; }

/* ——— rekomendacje: użycie + świeżość + kalendarz finansisty ——— */
function calendarHints(d = today()){
  const day = d.getDate(), m = d.getMonth() + 1, h = {};
  const add = (id, why) => (h[id] ||= []).push(why);
  if (day <= 8) ["ctl-gl","ap-recon","bud-var","fa-report"].forEach(id => add(id, "zamknięcie miesiąca"));
  if (day >= 15 && day <= 25) add("tax-filing", "JPK_V7 do 25. dnia");
  if (day >= 14 && day <= 20) add("bud-cash13", "ZUS i PIT do 20. dnia");
  if (m <= 3) { add("ctl-report", "sezon sprawozdań rocznych"); add("tax-filing", "sezon CIT-8"); }
  if (m >= 9 && m <= 11) { add("bud-create", "sezon budżetowy"); add("stk-guide", "sezon budżetowy"); }
  if (m === 12 || m === 1) add("aud-plan", "plan audytów na nowy rok");
  if (day >= 20) add("ap-remind", "windykacja przed końcem miesiąca");
  return h;
}
function score(id){ const s = M.stats[id]; if (!s) return 0; const days = (Date.now() - (s.last || 0)) / 864e5; return s.uses + (days < 7 ? 2 : days < 30 ? 1 : 0); }
function recommended(){
  const cal = calendarHints();
  const list = MODS.map(m => ({m, s: score(m.id) + (cal[m.id] ? 1.5 : 0), why: [...(M.stats[m.id]?.uses ? [`użyte ${M.stats[m.id].uses}×`] : []), ...(cal[m.id] || [])]})).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6);
  return list.length ? list : ["bud-var","tax-cal","ap-remind","ap-recon","day-calc","fa-trend"].map(id => ({m: byId(id), why: ["polecane na start"]}));
}

/* ——— widoki ——— */
function renderAreas(){
  const n = a => MODS.filter(m => m.a === a).length;
  let x = `<button data-v="home" class="learned" aria-pressed="${view === "home"}"><span>Dla Ciebie</span><span class="c">${recommended().length}</span></button><button data-v="all" aria-pressed="${view === "all"}"><span>Wszystkie narzędzia</span><span class="c">${MODS.length}</span></button><button data-v="new" aria-pressed="${view === "new"}"><span>Nowości 2026</span><span class="c">${MODS.filter(m => m.nw).length}</span></button>`;
  let g = ""; AREAS.forEach(a => { if (a.grp !== g) { g = a.grp; x += `<div class="grp">${esc(g)}</div>`; } x += `<button data-v="${a.id}" aria-pressed="${view === a.id || (curMod && curMod.a === a.id && view === "mod")}"><span>${esc(a.name)}</span><span class="c">${n(a.id)}</span></button>`; });
  $("#areas").innerHTML = x;
}
function card(m, why){
  const s = M.stats[m.id], pills = [`<span class="pill time num">~${m.min} min</span>`, `<span class="pill kind">${KIND[m.kind]}</span>`];
  if (m.nw) pills.push(`<span class="pill new">nowość</span>`);
  (why || (s?.uses ? [`użyte ${s.uses}×`] : [])).slice(0, 2).forEach(w => pills.push(`<span class="pill learn">${esc(w)}</span>`));
  return `<a class="card" href="#${m.id}" data-id="${m.id}"><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p><div class="meta">${pills.join("")}</div></a>`;
}
function renderList(){
  curMod = null; const main = $("#main"); const q = query.trim().toLowerCase();
  if (q) { const L = MODS.filter(m => (m.t + " " + m.d + " " + areaName(m.a) + " " + KIND[m.kind]).toLowerCase().includes(q));
    main.innerHTML = `<div class="sec-h"><h2>Wyniki: „${esc(query)}”</h2><p class="num">${L.length} narzędzi</p></div>` + (L.length ? `<div class="grid">${L.map(m => card(m)).join("")}</div>` : `<div class="empty">Nic nie znalazłem. Spróbuj innego słowa, np. „VAT”, „termin”, „Excel”.</div>`); return; }
  if (view === "home") {
    const up = upcoming(21);
    let x = `<div class="sec-h"><h2>Dla Ciebie</h2><p>Kolejność uczy się z tego, czego używasz, i z kalendarza finansisty (dziś ${fmtDate(today())}).</p></div><div class="grid">${recommended().map(r => card(r.m, r.why)).join("")}</div>`;
    x += `<div class="sec-h"><h2>Najbliższe terminy</h2><p><a href="#tax-cal">Pełny kalendarz podatkowy</a></p></div>` + (up.length ? `<div class="deadlines">${up.slice(0, 8).map(d => { const dd = dayDiff(today(), d.date); return `<div class="dl ${dd <= 3 ? "soon" : ""}"><div class="d num">${d.date.getDate()}<small>${MONTHS_GEN[d.date.getMonth()].slice(0, 3)}</small></div><div><p>${esc(d.t)}</p><span class="in">${dd === 0 ? "dziś" : dd === 1 ? "jutro" : `za ${dd} dni`} · ${DOW[d.date.getDay()]}</span></div></div>`; }).join("")}</div>` : `<div class="empty">Brak terminów w ciągu 3 tygodni.</div>`);
    AREAS.forEach(a => { x += `<div class="sec-h"><h2>${esc(a.name)}</h2></div><div class="grid">${MODS.filter(m => m.a === a.id).map(m => card(m)).join("")}</div>`; });
    main.innerHTML = x; return;
  }
  const L = view === "all" ? MODS : view === "new" ? MODS.filter(m => m.nw) : MODS.filter(m => m.a === view);
  main.innerHTML = `<div class="sec-h"><h2>${view === "all" ? "Wszystkie narzędzia" : view === "new" ? "Nowości 2026" : esc(areaName(view))}</h2><p class="num">${L.length} narzędzi</p></div><div class="grid">${L.map(m => card(m)).join("")}</div>`;
}
function openMod(id){
  const m = byId(id); if (!m) return;
  curMod = m; view = "mod"; usedNow.delete(id); touched.delete(id);
  const main = $("#main");
  main.innerHTML = `<section class="ws"><div class="ws-h"><div><span class="eyebrow">${esc(areaName(m.a))} · ${KIND[m.kind]}</span><h2>${esc(m.t)}</h2><p>${esc(m.d)}</p></div><div class="actions no-print"><a class="btn" href="#">← Wszystkie narzędzia</a></div></div><div class="ws-b" id="ws"></div></section>`;
  try { m.render($("#ws"), ms(id)); } catch (e) { $("#ws").innerHTML = `<div class="empty">Nie udało się otworzyć narzędzia: ${esc(e.message)}. Spróbuj „Wyczyść pamięć” tego narzędzia w ustawieniach.</div>`; console.error(e); }
  renderAreas(); window.scrollTo({top: 0});
}
function route(){
  const h0 = decodeURIComponent((location.hash || "").slice(1));
  if (h0 && byId(h0)) openMod(h0);
  else { if (view === "mod") view = "home"; renderAreas(); renderList(); }
}

/* ——— ustawienia i pamięć ——— */
const PROFILE = [
  {k:"firma",l:"Nazwa firmy",ex:""},{k:"nip",l:"NIP",ex:""},{k:"rachunek",l:"Rachunek bankowy (do pism)",ex:""},{k:"podpis",l:"Podpis w pismach",ex:""},
  {k:"erp",l:"System ERP / FK",ex:""},{k:"vat",l:"Rozliczenie VAT",type:"select",o:["miesięcznie","kwartalnie"]},{k:"zus",l:"Termin ZUS (dzień)",type:"select",o:["20","15"]},{k:"cit",l:"Zaliczki CIT",type:"select",o:["miesięcznie","kwartalnie","uproszczone lub brak"]},
  {k:"fy",l:"Koniec roku obrotowego (miesiąc)",type:"select",o:["12","1","2","3","4","5","6","7","8","9","10","11"]},{k:"large",l:"Przychody powyżej 50 mln EUR",type:"select",o:["nie","tak"]},
  {k:"ref",l:"Stopa referencyjna NBP %",ex:"4,00",hint:"Do odsetek. Sprawdź aktualną na nbp.pl."},{k:"eur",l:"Kurs EUR/PLN",ex:"4,25"},{k:"prog",l:"Próg istotności",ex:"5% lub 50 000 zł"}];
function renderSettings(tab = "profile"){
  $$(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab)); $$("[data-panel]").forEach(p => p.hidden = p.dataset.panel !== tab);
  if (tab === "profile") { const v = initialVals(PROFILE, M.profile); $('[data-panel="profile"]').innerHTML = `<p class="hint" style="margin:0">Profil wypełnia pisma i ustawia kalendarz podatkowy oraz domyślne wartości w kalkulatorach.</p><form class="row" id="pf">${PROFILE.map(f => fieldHTML(f, v[f.k], "p_")).join("")}</form>`; $$("#pf .field").forEach(f => f.style.flex = "1 1 200px"); }
  if (tab === "memory") {
    const L = M.learn, sec = [];
    const hidden = []; Object.entries(M.mods).forEach(([id, s]) => { Object.entries(s.naCount || {}).filter(([, n]) => n >= 2).forEach(([t]) => hidden.push({id, t})); });
    const customs = []; Object.entries(M.mods).forEach(([id, s]) => (s.custom || []).forEach(c => customs.push({id, t: c.t})));
    const tpls = []; Object.entries(M.mods).forEach(([id, s]) => Object.keys(s.tpl || {}).forEach(v => tpls.push({id, v})));
    const targets = Object.keys(M.mods["cfo-kpi"]?.tg || {}).length;
    const item = (txt, sub, del) => `<div class="li"><p>${esc(txt)}<small>${esc(sub)}</small></p><button class="btn sm" type="button" data-forget="${esc(del)}">Zapomnij</button></div>`;
    if (L.words.length) sec.push(`<h3 style="font-size:14px">Twoje reguły językowe</h3>` + L.words.map((w, i) => item(`„${w.from}” → „${w.to}”`, "Korekta sformułowań", "w|" + i)).join(""));
    if (Object.keys(L.varType).length) sec.push(`<h3 style="font-size:14px">Typy pozycji w analizie odchyleń</h3>` + Object.entries(L.varType).map(([k, v]) => item(`${k}: ${v === "rev" ? "przychód" : "koszt"}`, "Analiza odchyleń", "vt|" + k)).join(""));
    if (Object.keys(L.varCause).length) sec.push(`<h3 style="font-size:14px">Zapamiętane przyczyny odchyleń</h3>` + Object.entries(L.varCause).map(([k, v]) => item(`${k}: ${v}`, "Analiza odchyleń", "vc|" + k)).join(""));
    if (Object.keys(L.anomOk).length) sec.push(`<h3 style="font-size:14px">Znane wyjątki w anomaliach</h3>` + Object.keys(L.anomOk).map(k => item(k.replace("|", ": "), "Wykrywanie anomalii", "an|" + k)).join(""));
    if (hidden.length) sec.push(`<h3 style="font-size:14px">Punkty checklist, które zwykle Cię nie dotyczą</h3>` + hidden.map(x => item(x.t, byId(x.id)?.t || x.id, "na|" + x.id + "|" + x.t)).join(""));
    if (customs.length) sec.push(`<h3 style="font-size:14px">Twoje punkty checklist</h3>` + customs.map(x => item(x.t, byId(x.id)?.t || x.id, "cu|" + x.id + "|" + x.t)).join(""));
    if (tpls.length) sec.push(`<h3 style="font-size:14px">Twoje szablony pism</h3>` + tpls.map(x => item(x.v, byId(x.id)?.t || x.id, "tp|" + x.id + "|" + x.v)).join(""));
    if (targets) sec.push(`<h3 style="font-size:14px">Cele KPI</h3>` + item(`${targets} własnych celów`, "Wskaźniki efektywności", "tg|cfo-kpi"));
    const hist = Object.keys(L.hist).length;
    if (hist) sec.push(`<h3 style="font-size:14px">Podpowiedzi pól</h3>` + item(`${hist} pól z historią wartości`, "Generatory pism", "hi|"));
    $('[data-panel="memory"]').innerHTML = `<p class="hint" style="margin:0">Narzędzie uczy się z Twoich działań: poprawek typów pozycji, przyczyn odchyleń, wyjątków w anomaliach, punktów „nie dotyczy”, własnych reguł i szablonów. Wszystko zostaje w tej przeglądarce.</p>` + (sec.length ? sec.join("") : `<div class="empty">Jeszcze nic. Zacznij korzystać z narzędzi, a lista się zapełni.</div>`);
  }
  if (tab === "stats") {
    const total = M.log.reduce((a, x) => a + x.min, 0), uses = Object.values(M.stats).reduce((a, x) => a + x.uses, 0);
    const days = [...Array(7)].map((_, i) => addDays(today(), i - 6)), vals = days.map(minutesOn), max = Math.max(60, ...vals);
    const top = Object.entries(M.stats).sort((a, b) => b[1].uses - a[1].uses).slice(0, 6);
    $('[data-panel="stats"]').innerHTML = `<div class="kpis">${kpi("Zaoszczędzone łącznie", fmt(total / 60, 1) + " h")}${kpi("Użyć narzędzi", uses)}${kpi("Dni z celem 60 min", new Set(M.log.map(x => new Date(x.t).toDateString())).size ? [...new Set(M.log.map(x => new Date(x.t).toDateString()))].filter(d => minutesOn(new Date(d)) >= 60).length : 0)}</div>
      <h3 style="font-size:14px">Minuty w ostatnich 7 dniach</h3><div class="bars">${days.map((d, i) => `<div style="height:${Math.max(2, vals[i] / max * 100)}%;${vals[i] ? "" : "background:var(--rule)"}"><em>${vals[i] || ""}</em><span>${DOW[d.getDay()]}</span></div>`).join("")}</div>
      <h3 style="font-size:14px">Najczęściej używane</h3>${top.length ? top.map(([id, s]) => `<div class="li"><p>${esc(byId(id)?.t || id)}<small class="num">użyte ${s.uses}×, ostatnio ${new Date(s.last).toLocaleDateString("pl-PL")}</small></p></div>`).join("") : `<div class="empty">Brak danych.</div>`}`;
  }
}
function forget(key){
  const [t, a, b] = key.split("|"); const L = M.learn;
  if (t === "w") L.words.splice(+a, 1);
  if (t === "vt") delete L.varType[key.slice(3)];
  if (t === "vc") delete L.varCause[key.slice(3)];
  if (t === "an") delete L.anomOk[key.slice(3)];
  if (t === "na") delete ms(a).naCount[key.split("|").slice(2).join("|")];
  if (t === "cu") ms(a).custom = ms(a).custom.filter(c => c.t !== key.split("|").slice(2).join("|"));
  if (t === "tp") delete ms(a).tpl[b];
  if (t === "tg") delete ms(a).tg;
  if (t === "hi") L.hist = {};
  persist(); renderSettings("memory"); toast("Zapomniano.");
}

/* ——— zdarzenia ——— */
$("#areas").addEventListener("click", e => { const b = e.target.closest("button[data-v]"); if (!b) return; view = b.dataset.v; query = ""; $("#q").value = ""; if (location.hash) history.pushState(null, "", location.pathname + location.search); renderAreas(); renderList(); window.scrollTo({top: 0}); });
$("#q").addEventListener("input", e => { query = e.target.value; if (view === "mod") { view = "home"; history.pushState(null, "", location.pathname + location.search); } renderAreas(); renderList(); });
$("#q").addEventListener("keydown", e => { if (e.key === "Enter") { const c = $("#main .card"); if (c) { query = ""; e.target.value = ""; location.hash = c.dataset.id; } } });
document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#q").focus(); $("#q").select(); } });
window.addEventListener("hashchange", route);
$("#openSettings").addEventListener("click", () => { renderSettings("profile"); const d = $("#settings"); d.showModal ? d.showModal() : d.setAttribute("open", ""); });
$("#closeSettings").addEventListener("click", () => $("#settings").close());
$("#settings").addEventListener("click", e => { if (e.target === $("#settings")) $("#settings").close(); const f = e.target.closest("[data-forget]"); if (f) forget(f.dataset.forget); });
$("#settings").addEventListener("close", () => { if (curMod) openMod(curMod.id); else { renderAreas(); renderList(); } });
$(".tabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) renderSettings(b.dataset.tab); });
["input","change"].forEach(ev => $("#settings").addEventListener(ev, e => { const el = e.target; if (el.closest("#pf") && el.name) { M.profile[el.name] = el.value; persist(); } }));
$("#exportBtn").addEventListener("click", () => download(`godzina-finansisty-pamiec-${isoDate(today())}.json`, JSON.stringify(M, null, 2), "application/json"));
$("#importFile").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  try { const d = JSON.parse(await f.text()); if (!d || typeof d !== "object" || !d.learn) throw 0;
    M.profile = Object.assign({}, d.profile, M.profile);
    Object.entries(d.stats || {}).forEach(([k, v]) => { const s = M.stats[k] ||= {uses:0}; s.uses += v.uses || 0; s.last = Math.max(s.last || 0, v.last || 0); });
    M.log = [...M.log, ...(d.log || [])].sort((a, b) => a.t - b.t).slice(-1500);
    Object.entries(d.mods || {}).forEach(([k, v]) => { const s = ms(k); Object.entries(v).forEach(([kk, vv]) => { if (s[kk] == null) s[kk] = vv; else if (kk === "custom") vv.forEach(c => { if (!s.custom.some(x => x.t === c.t)) s.custom.push(c); }); else if (kk === "naCount" || kk === "tpl") s[kk] = Object.assign({}, vv, s[kk]); }); });
    const L = M.learn, D = d.learn; Object.assign(L.varType, D.varType, {...L.varType}); Object.assign(L.varCause, D.varCause, {...L.varCause}); Object.assign(L.anomOk, D.anomOk); (D.words || []).forEach(w => { if (!L.words.some(x => x.from === w.from)) L.words.push(w); }); L.hist = Object.assign({}, D.hist, L.hist);
    persist(); renderClock(); toast("Zaimportowano i scalono pamięć.");
  } catch { toast("To nie jest plik eksportu Godziny Finansisty."); }
  e.target.value = "";
});
$("#resetBtn").addEventListener("click", () => $("#resetConfirm").hidden = false);
$("#resetNo").addEventListener("click", () => $("#resetConfirm").hidden = true);
$("#resetYes").addEventListener("click", () => { M = blank(); persist(); $("#resetConfirm").hidden = true; renderClock(); toast("Pamięć wyczyszczona."); });

/* ——— start ——— */
renderClock(); route();
if (!memoryOk) toast("Pamięć przeglądarki jest wyłączona: nauka działa tylko do zamknięcia karty.");
window.__GF = {MODS, M: () => M, parseNum, parseTable, deadlinesFor, nipOk, ibanOk, regonOk, npv, irr, holidays, calendarHints, fcMethods, readXlsx};
</script>
</body>
</html>
