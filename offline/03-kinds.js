/* =====================================================================
   Typy modułów wielokrotnego użytku: checklista, generator pism, rejestr
   ===================================================================== */

/* ——— CHECKLISTA: postęp per okres, własne punkty, nauka „nie dotyczy” ——— */
function periodKey(kind, v){ return kind === "none" ? "stała" : v; }
function defaultPeriod(kind){
  const d = today();
  if (kind === "month") { const p = new Date(d.getFullYear(), d.getMonth() - (d.getDate() <= 15 ? 1 : 0), 1); return `${MONTHS[p.getMonth()]} ${p.getFullYear()}`; }
  if (kind === "year") return String(d.getMonth() < 6 ? d.getFullYear() - 1 : d.getFullYear());
  return "";
}
function renderChecklist(m, root, s){
  s.per ||= {}; s.custom ||= []; s.naCount ||= {};
  const kind = m.period || "none";
  let per = s.lastPer || defaultPeriod(kind), showHidden = false;
  const items = () => m.groups.map((g, gi) => ({n: g.n, items: [...g.items.map(it => Array.isArray(it) ? {t: it[0], d: it[1]} : {t: it}), ...s.custom.filter(c => c.g === gi).map(c => ({t: c.t, own: true}))]}));
  root.innerHTML = `
    <div class="ck-top no-print">
      ${kind !== "none" ? `<div class="field" style="min-width:200px"><label for="ck_per">${kind === "month" ? "Okres (miesiąc)" : kind === "year" ? "Rok" : "Nazwa (np. projekt, kontrola)"}</label><input id="ck_per" list="ck_pers" value="${esc(per)}"><datalist id="ck_pers">${Object.keys(s.per).map(k => `<option value="${esc(k)}">`).join("")}</datalist></div>` : ""}
      <div style="flex:1;min-width:200px" class="stack"><span class="lbl-s" id="ck_lbl"></span><div class="progress"><i id="ck_bar" style="width:0"></i></div></div>
      <div class="actions"><button class="btn sm" data-a="md" type="button">Kopiuj jako listę</button><button class="btn sm" data-a="csv" type="button">Pobierz CSV</button><button class="btn sm" data-a="print" type="button">Drukuj</button></div>
    </div>
    <div class="note" id="ck_learn" hidden></div>
    <div class="stack" id="ck_groups"></div>
    <div class="row no-print">
      <div class="field" style="flex:0 1 240px"><label for="ck_g">Dodaj własny punkt do sekcji</label><select id="ck_g">${m.groups.map((g, i) => `<option value="${i}">${esc(g.n)}</option>`).join("")}</select></div>
      <div class="field" style="flex:1 1 260px"><label for="ck_t">Treść punktu</label><input id="ck_t" placeholder="np. Uzgodnić saldo z bankiem w EUR"></div>
      <button class="btn" type="button" data-a="add">Dodaj</button>
    </div>`;
  const st = () => (s.per[periodKey(kind, per)] ||= {done:{}, na:{}});
  const hiddenSet = () => new Set(Object.entries(s.naCount).filter(([, n]) => n >= 2).map(([k]) => k));
  function draw(){
    const S = st(), hid = hiddenSet(); let total = 0, done = 0, hiddenNow = 0;
    const auto = t => hid.has(t) && S.na[t] !== false && !S.done[t];   // nauczone „nie dotyczy”
    const isNA = t => !!S.na[t] || auto(t);
    $("#ck_groups", root).innerHTML = items().map(g => {
      const rows = g.items.filter(it => { if (auto(it.t) && !showHidden) { hiddenNow++; return false; } return true; });
      const cnt = g.items.filter(it => !isNA(it.t));
      const dn = cnt.filter(it => S.done[it.t]).length; total += cnt.length; done += dn;
      return `<section class="ck-grp"><h3>${esc(g.n)} <span class="num">${dn}/${cnt.length}</span></h3>${rows.map(it => {
        const na = isNA(it.t);
        return `<div class="ck ${S.done[it.t] ? "done" : ""} ${na ? "na" : ""}"><input type="checkbox" data-t="${esc(it.t)}" ${S.done[it.t] ? "checked" : ""} ${na ? "disabled" : ""} aria-label="${esc(it.t)}"><div class="tx">${esc(it.t)}${it.own ? ' <span class="own">własny</span>' : ""}${it.d ? `<small>${esc(it.d)}</small>` : ""}</div>
          <button type="button" class="na-btn no-print" data-na="${esc(it.t)}" aria-pressed="${na}">nie dotyczy</button>${it.own ? `<button type="button" class="na-btn no-print" data-del="${esc(it.t)}" aria-label="Usuń własny punkt">usuń</button>` : ""}</div>`; }).join("")}</section>`;
    }).join("");
    $("#ck_lbl", root).textContent = `Wykonano ${done} z ${total} (${total ? Math.round(done / total * 100) : 0}%)${kind !== "none" ? " · " + per : ""}`;
    $("#ck_bar", root).style.width = (total ? done / total * 100 : 0) + "%";
    const ln = $("#ck_learn", root);
    if (hid.size) { ln.hidden = false; ln.innerHTML = `<b>Nauczyłem się:</b> ${hiddenNow ? `ukryłem ${hiddenNow} ${hiddenNow === 1 ? "punkt" : "punkty"}, które zwykle oznaczasz jako „nie dotyczy”.` : "wszystkie zwykle pomijane punkty są widoczne."} <button type="button" class="btn sm" data-a="hid">${showHidden ? "Ukryj je" : "Pokaż je"}</button>`; }
    else ln.hidden = true;
    if (done && done === total && draw.prev !== total) toast("Checklista ukończona.");
    draw.prev = done === total ? total : -1;
  }
  root.addEventListener("change", e => {
    const c = e.target.closest("input[type=checkbox][data-t]"); if (c) { st().done[c.dataset.t] = c.checked; s.lastPer = per; persist(); markUse(m.id); draw(); }
    if (e.target.id === "ck_per") { per = e.target.value.trim() || defaultPeriod(kind); s.lastPer = per; persist(); draw(); }
  });
  root.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.na != null) { const t = b.dataset.na, S = st(), hid = hiddenSet(); const wasNa = !!S.na[t] || (hid.has(t) && S.na[t] !== false && !S.done[t]);
      if (wasNa) { if (hid.has(t)) S.na[t] = false; else delete S.na[t]; s.naCount[t] = Math.max(0, (s.naCount[t] || 0) - 1); }
      else { S.na[t] = true; delete S.done[t]; s.naCount[t] = (s.naCount[t] || 0) + 1; if (s.naCount[t] === 2) toast("Zapamiętam: ten punkt zwykle Cię nie dotyczy."); }
      persist(); draw(); }
    if (b.dataset.del != null) { s.custom = s.custom.filter(c => c.t !== b.dataset.del); persist(); draw(); }
    const a = b.dataset.a;
    if (a === "add") { const t = $("#ck_t", root).value.trim(); if (!t) return; s.custom.push({g: +$("#ck_g", root).value, t}); $("#ck_t", root).value = ""; persist(); draw(); toast("Dodano punkt. Pojawi się też w kolejnych okresach."); }
    if (a === "hid") { showHidden = !showHidden; draw(); }
    const S = st(), rows = [];
    if (a === "md" || a === "csv") items().forEach(g => g.items.forEach(it => rows.push([g.n, it.t, S.na[it.t] ? "nie dotyczy" : S.done[it.t] ? "wykonane" : "do zrobienia"])));
    if (a === "md") copyText(`${m.t}${kind !== "none" ? " – " + per : ""}\n\n` + items().map(g => `## ${g.n}\n` + g.items.map(it => `- [${S.done[it.t] ? "x" : S.na[it.t] ? "-" : " "}] ${it.t}`).join("\n")).join("\n\n"));
    if (a === "csv") download(`${m.id}-${per || "lista"}.csv`, toCSV([["Sekcja","Punkt","Status"], ...rows]), "text/csv");
    if (a === "print") window.print();
  });
  $("#ck_t", root).addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $('[data-a="add"]', root).click(); } });
  draw();
}

/* ——— GENERATOR PISM: pola + szablon z {{zmiennymi}}, edytowalny i zapamiętywany ——— */
function fillTpl(tpl, v){
  return tpl
    .replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k, body) => String(v[k] ?? "").trim() ? body : "")
    .replace(/\{\{(\w+)\}\}/g, (_, k) => { const x = v[k]; return x == null || String(x).trim() === "" ? `[${k.toUpperCase()}]` : String(x); })
    .replace(/\n{3,}/g, "\n\n").trim();
}
function renderTemplate(m, root, s){
  s.tpl ||= {};
  const variants = m.variants || {"Szablon": m.tpl};
  const names = Object.keys(variants);
  let variant = names.includes(s.variant) ? s.variant : names[0];
  const fields = m.fields;
  const vals = initialVals(fields, s.vals);
  root.innerHTML = `<div class="cols">
    <form class="stack" id="tp_form" autocomplete="off">
      ${names.length > 1 ? `<div class="field"><label for="tp_var">Rodzaj pisma</label><select id="tp_var">${names.map(n => `<option${n === variant ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></div>` : ""}
      ${fields.map(f => fieldHTML(f, vals[f.k], "t_")).join("")}
      <div class="actions"><button class="btn sm ghost" type="button" data-a="edit">Edytuj szablon</button><span class="hint" id="tp_own"></span></div>
    </form>
    <div class="stack">
      <div class="info" id="tp_calc" hidden></div>
      <label class="lbl-s" for="tp_out">Gotowy tekst (możesz go jeszcze poprawić)</label>
      <textarea class="out" id="tp_out" spellcheck="true"></textarea>
      <div class="actions no-print"><button class="btn primary" type="button" data-a="copy">Kopiuj</button><button class="btn" type="button" data-a="mail">Otwórz w poczcie</button><button class="btn" type="button" data-a="dl">Pobierz .txt</button><button class="btn" type="button" data-a="print">Drukuj</button></div>
      <div class="stack" id="tp_editor" hidden>
        <div class="note"><b>Twój szablon.</b> Zmienne w nawiasach klamrowych zostaną podstawione: ${fields.map(f => `<code>{{${f.k}}}</code>`).join(" ")}${m.extraVars ? " " + m.extraVars.map(k => `<code>{{${k}}}</code>`).join(" ") : ""}. Fragment <code>{{#pole}}…{{/pole}}</code> pojawi się tylko, gdy pole jest wypełnione.</div>
        <textarea class="out" id="tp_src" spellcheck="false"></textarea>
        <div class="actions"><button class="btn primary" type="button" data-a="save">Zapisz mój szablon</button><button class="btn" type="button" data-a="reset">Przywróć domyślny</button><button class="btn ghost" type="button" data-a="close">Zamknij edytor</button></div>
      </div>
    </div></div>`;
  const out = $("#tp_out", root);
  const tplOf = n => s.tpl[n] || variants[n];
  function gen(){
    const v = readForm(root, fields, "t_");
    const extra = m.compute ? m.compute(v) : {};
    const calc = $("#tp_calc", root);
    if (extra && extra._info) { calc.hidden = false; calc.innerHTML = extra._info; } else calc.hidden = true;
    const shown = Object.assign({}, v); fields.forEach(f => { if (f.type === "date") { const d = parseDate(v[f.k]); shown[f.k] = d ? fmtDate(d) : f.k === "zaplata" ? fmtDate(today()) : v[f.k]; } });
    out.value = fillTpl(tplOf(variant), Object.assign({}, P(), shown, extra, {dzis: fmtDate(today())}));
    $("#tp_own", root).textContent = s.tpl[variant] ? "Używasz własnej wersji szablonu." : "";
    s.vals = v; s.variant = variant; persist();
  }
  root.addEventListener("input", e => { if (e.target.closest("#tp_form")) gen(); });
  root.addEventListener("change", e => { if (e.target.id === "tp_var") { variant = e.target.value; gen(); if (!$("#tp_editor", root).hidden) $("#tp_src", root).value = tplOf(variant); } else if (e.target.closest("#tp_form")) gen(); });
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, txt = out.value;
    const use = () => { rememberHist(fields, readForm(root, fields, "t_")); markUse(m.id); persist(); };
    if (a === "copy") { copyText(txt); use(); }
    if (a === "dl") { download(`${m.id}.txt`, txt); use(); }
    if (a === "print") { use(); window.print(); }
    if (a === "mail") { const mt = txt.match(/^Temat:\s*(.+)$/m); const body = txt.replace(/^Temat:.*\n+/m, ""); use();
      location.href = "mailto:?subject=" + encodeURIComponent(mt ? mt[1] : m.t) + "&body=" + encodeURIComponent(body); }
    if (a === "edit") { $("#tp_editor", root).hidden = false; $("#tp_src", root).value = tplOf(variant); $("#tp_src", root).focus(); }
    if (a === "close") $("#tp_editor", root).hidden = true;
    if (a === "save") { s.tpl[variant] = $("#tp_src", root).value; persist(); gen(); toast("Zapisano Twój szablon. Będzie używany od teraz."); }
    if (a === "reset") { delete s.tpl[variant]; $("#tp_src", root).value = variants[variant]; persist(); gen(); toast("Przywrócono szablon domyślny."); }
  });
  gen();
}

/* ——— REJESTR: edytowalna tabela z oceną i mapą ciepła ——— */
function renderRegister(m, root, s){
  if (!s.rows) s.rows = m.seed.map(r => Object.assign({}, r));
  const C = m.cols;
  root.innerHTML = `<div class="stack">
    <div class="info">${m.help}</div>
    <div class="tbl" id="rg_tbl"></div>
    <div class="actions no-print"><button class="btn" type="button" data-a="add">Dodaj wiersz</button><button class="btn sm" type="button" data-a="tsv">Kopiuj do Excela</button><button class="btn sm" type="button" data-a="csv">Pobierz CSV</button><button class="btn sm" type="button" data-a="print">Drukuj</button><button class="btn sm ghost" type="button" data-a="seed">Wczytaj przykłady</button></div>
    <div id="rg_extra"></div></div>`;
  const score = r => m.score ? m.score(r) : null;
  function draw(){
    const rows = s.rows.map((r, i) => ({r, i, sc: score(r)}));
    if (m.sort) rows.sort((a, b) => (b.sc ?? 0) - (a.sc ?? 0));
    $("#rg_tbl", root).innerHTML = `<table><thead><tr>${C.map(c => `<th class="${c.type === "num" || c.type === "score" ? "n" : ""}">${esc(c.l)}</th>`).join("")}${m.score ? `<th class="n">${esc(m.scoreLabel)}</th>` : ""}<th class="no-print"></th></tr></thead><tbody>${rows.map(({r, i, sc}) => `<tr>${C.map(c => {
      const v = r[c.k] ?? "";
      if (c.type === "sel" || c.type === "score") return `<td class="${c.type === "score" ? "n" : ""}"><select data-i="${i}" data-k="${c.k}" aria-label="${esc(c.l)}">${(c.o || ["1","2","3","4","5"]).map(o => `<option${String(o) === String(v) ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></td>`;
      return `<td><input data-i="${i}" data-k="${c.k}" value="${esc(v)}" class="${c.type === "num" ? "n" : ""}" aria-label="${esc(c.l)}"></td>`;
    }).join("")}${m.score ? `<td class="n">${m.badge ? m.badge(sc) : fmt(sc)}</td>` : ""}<td class="no-print"><button class="btn sm ghost" type="button" data-del="${i}" aria-label="Usuń wiersz">✕</button></td></tr>`).join("")}</tbody></table>`;
    $("#rg_extra", root).innerHTML = m.extra ? m.extra(s.rows) : "";
  }
  root.addEventListener("change", e => { const t = e.target; if (t.dataset.i == null) return; s.rows[+t.dataset.i][t.dataset.k] = t.value; persist(); markUse(m.id); draw(); });
  root.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.del != null) { s.rows.splice(+b.dataset.del, 1); persist(); draw(); return; }
    const a = b.dataset.a; const flat = () => [[...C.map(c => c.l), ...(m.score ? [m.scoreLabel] : [])], ...s.rows.map(r => [...C.map(c => r[c.k] ?? ""), ...(m.score ? [score(r)] : [])])];
    if (a === "add") { const r = {}; C.forEach(c => r[c.k] = c.type === "score" ? "3" : c.type === "sel" ? c.o[0] : ""); s.rows.push(r); persist(); draw(); const ins = $$("#rg_tbl tbody tr", root); const last = ins.find(tr => $("input", tr) && !$("input", tr).value); (last ? $("input", last) : null)?.focus(); }
    if (a === "tsv") copyText(toTSV(flat()));
    if (a === "csv") download(m.id + ".csv", toCSV(flat()), "text/csv");
    if (a === "print") window.print();
    if (a === "seed") { s.rows = [...s.rows, ...m.seed.map(r => Object.assign({}, r))]; persist(); draw(); }
  });
  draw();
}
function heatmap(rows, pk, ik, label = "prawdopodobieństwo"){
  const cnt = {}; rows.forEach(r => { const k = (+r[pk] || 0) + "-" + (+r[ik] || 0); cnt[k] = (cnt[k] || 0) + 1; });
  const col = sc => sc >= 15 ? "var(--bad)" : sc >= 8 ? "var(--warn)" : "var(--good)";
  const bg = sc => sc >= 15 ? "var(--bad-soft)" : sc >= 8 ? "var(--warn-soft)" : "var(--good-soft)";
  let g = "";
  for (let p = 5; p >= 1; p--) { g += `<div class="ax">${p}</div>`; for (let i = 1; i <= 5; i++) { const n = cnt[p + "-" + i] || 0; g += `<div style="background:${bg(p * i)};color:${col(p * i)};${n ? "outline:2px solid " + col(p * i) : ""}" title="${label} ${p} × wpływ ${i}">${n || ""}</div>`; } }
  g += `<div class="ax"></div>` + [1,2,3,4,5].map(i => `<div class="ax">${i}</div>`).join("");
  return `<div class="stack"><span class="lbl-s">Mapa ciepła (pionowo: ${label}, poziomo: wpływ). Liczba w polu to liczba pozycji.</span><div class="heat">${g}</div></div>`;
}
const scoreBadge = sc => `<span class="pill ${sc >= 15 ? "bad" : sc >= 8 ? "warn" : "good"} num">${sc} · ${sc >= 15 ? "wysokie" : sc >= 8 ? "średnie" : "niskie"}</span>`;
