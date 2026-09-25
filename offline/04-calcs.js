/* =====================================================================
   Kalkulatory i analizy danych (wszystko liczone lokalnie)
   ===================================================================== */
const stat = {
  mean: a => a.reduce((s, x) => s + x, 0) / a.length,
  sd: a => { const m = stat.mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); },
  linreg(y){ const n = y.length, xs = y.map((_, i) => i), mx = (n - 1) / 2, my = stat.mean(y);
    let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (y[i] - my); sxx += (x - mx) ** 2; });
    const b = sxx ? sxy / sxx : 0, a = my - b * mx; const ssr = y.reduce((s, v, i) => s + (v - (a + b * i)) ** 2, 0), sst = y.reduce((s, v) => s + (v - my) ** 2, 0);
    return {a, b, r2: sst ? 1 - ssr / sst : 1}; },
  quantile(a, q){ const s = [...a].sort((x, y) => x - y); const p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo); }
};
/* ogólny szkielet: formularz po lewej, wynik po prawej, przeliczanie na żywo */
function calcShell(root, leftHTML){
  root.innerHTML = `<div class="cols"><form class="stack" autocomplete="off" onsubmit="return false">${leftHTML}</form><div class="stack" id="res"></div></div>`;
  return {form: $("form", root), res: $("#res", root)};
}
const val = (root, id) => { const el = $("#" + id, root); return el ? el.value : ""; };
const num = (root, id, d = 0) => { const n = parseNum(val(root, id)); return isFinite(n) ? n : d; };
function liveForm(root, s, ids, fn){
  ids.forEach(id => { const el = $("#" + id, root); if (el && s.v && s.v[id] != null) el.value = s.v[id]; });
  const run = () => { s.v ||= {}; ids.forEach(id => { const el = $("#" + id, root); if (el) s.v[id] = el.value; }); persist(); fn(); };
  root.addEventListener("input", e => { if (!e.target.closest("#res")) run(); });
  root.addEventListener("change", e => { if (!e.target.closest("#res")) run(); });
  fn();
}
const kpi = (label, value, sub = "", cls = "") => `<div class="kpi ${cls}"><span>${esc(label)}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;
const inp = (id, label, value = "", hint = "", attrs = "") => `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" value="${esc(value)}" ${attrs}>${hint ? `<span class="hint">${hint}</span>` : ""}</div>`;
const sel = (id, label, opts, value) => `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${opts.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(value) ? " selected" : ""}>${esc(t)}</option>`; }).join("")}</select></div>`;

/* ——————————————— ANALIZA TRENDÓW ——————————————— */
const EX_TREND = "Miesiąc;Przychody\n01.2025;3 120 000\n02.2025;3 050 000\n03.2025;3 410 000\n04.2025;3 380 000\n05.2025;3 560 000\n06.2025;3 610 000\n07.2025;3 290 000\n08.2025;3 240 000\n09.2025;3 700 000\n10.2025;3 820 000\n11.2025;3 900 000\n12.2025;4 350 000\n01.2026;3 360 000\n02.2026;3 280 000\n03.2026;3 690 000\n04.2026;3 650 000\n05.2026;3 080 000\n06.2026;3 890 000\n07.2026;3 540 000\n08.2026;3 520 000";
reg({id:"fa-trend", a:"fa", kind:"data", t:"Analiza trendów", min:25, d:"Dynamika m/m i r/r, CAGR, trend liniowy, średnia krocząca i automatyczne wykrywanie anomalii.",
  render(root, s){
    const {form, res} = calcShell(root, "");
    const df = dataField({id:"tr_data", label:"Szereg czasowy: okres i wartość (kolejne kolumny to dodatkowe serie)", ex:EX_TREND, value:s.data, onChange:v => { s.data = v; persist(); run(); }});
    form.append(df, h(`<div class="row">${inp("tr_z", "Próg anomalii (odchylenia standardowe)", "2")}${sel("tr_f", "Częstotliwość", [["12","miesięczna"],["4","kwartalna"],["1","roczna"]], "12")}</div>`));
    function run(){
      const {head, rows} = parseTable(df.get());
      const data = rows.filter(r => r.length >= 2 && isNum(r[1]));
      if (data.length < 3) { res.innerHTML = `<div class="empty">Wklej co najmniej 3 okresy: w pierwszej kolumnie okres, w drugiej wartość.</div>`; return; }
      const labels = data.map(r => r[0]), y = data.map(r => parseNum(r[1])), n = y.length, f = +val(root, "tr_f") || 12, zT = num(root, "tr_z", 2);
      const lr = stat.linreg(y), trend = y.map((_, i) => lr.a + lr.b * i), resid = y.map((v, i) => v - trend[i]), sdr = stat.sd(resid) || 1;
      const ma = y.map((_, i) => i >= 2 ? (y[i] + y[i-1] + y[i-2]) / 3 : null);
      const anomalies = resid.map((r, i) => Math.abs(r / sdr) >= zT ? i : -1).filter(i => i >= 0);
      const periods = n - 1, cagrP = y[0] > 0 && y[n-1] > 0 ? Math.pow(y[n-1] / y[0], 1 / periods) - 1 : NaN, cagrY = isFinite(cagrP) ? Math.pow(1 + cagrP, f) - 1 : NaN;
      const yoy = y.map((v, i) => i >= f && y[i - f] ? v / y[i - f] - 1 : null), mom = y.map((v, i) => i && y[i-1] ? v / y[i-1] - 1 : null);
      const imax = y.indexOf(Math.max(...y)), imin = y.indexOf(Math.min(...y));
      const lastYoy = yoy[n-1], ytd = f === 12 && n > 12 ? (() => { const k = n % 12 || 12, cur = y.slice(n - k).reduce((a, b) => a + b, 0), prev = y.slice(n - k - 12, n - 12).reduce((a, b) => a + b, 0); return prev ? cur / prev - 1 : NaN; })() : NaN;
      const second = head && head.length > 2 ? data.map(r => parseNum(r[2])) : null;
      const series = [{name: head ? head[1] : "Wartość", values:y, marks:anomalies, area:true}, {name:"Trend liniowy", values:trend, dash:true, color:"var(--muted)", w:1.5}, {name:"Średnia 3-okresowa", values:ma, color:"var(--learn)", w:1.6}];
      if (second && second.every(isFinite)) series.push({name: head[2], values: second, color:"var(--bad)", w:1.6});
      const cm = [];
      cm.push(`W okresie ${labels[0]}–${labels[n-1]} wartość zmieniła się z ${fmt(y[0])} do ${fmt(y[n-1])} (${fmtPct(y[n-1] / y[0] - 1)}). ${isFinite(cagrY) && f > 1 ? `Średnie roczne tempo (CAGR) wynosi ${fmtPct(cagrY)}.` : ""}`);
      cm.push(`Trend liniowy to ${lr.b >= 0 ? "wzrost" : "spadek"} o ${fmt(Math.abs(lr.b))} na okres; dopasowanie R² = ${fmt(lr.r2, 2)} (${lr.r2 > 0.7 ? "trend wyraźny" : lr.r2 > 0.3 ? "trend umiarkowany, duża zmienność" : "brak wyraźnego trendu, dominują wahania"}).`);
      if (isFinite(lastYoy)) cm.push(`Ostatni okres r/r: ${fmtPct(lastYoy)}${isFinite(ytd) ? `, narastająco od początku roku: ${fmtPct(ytd)}` : ""}.`);
      cm.push(`Najwyższa wartość: ${labels[imax]} (${fmt(y[imax])}), najniższa: ${labels[imin]} (${fmt(y[imin])}).`);
      if (anomalies.length) cm.push(`<b>Anomalie</b> (odchylenie od trendu powyżej ${fmt(zT, 1)} σ): ${anomalies.map(i => `${labels[i]} (${resid[i] > 0 ? "+" : ""}${fmt(resid[i])})`).join(", ")}. Sprawdź, czy to zdarzenia jednorazowe, przesunięcia fakturowania lub błędy danych.`);
      else cm.push("Nie wykryto anomalii przy zadanym progu.");
      if (f === 12 && n >= 24) { const idx = Array.from({length:12}, (_, m) => stat.mean(resid.filter((_, i) => i % 12 === m))); const hi = idx.indexOf(Math.max(...idx)), lo = idx.indexOf(Math.min(...idx)); cm.push(`Sezonowość: najsilniejsza pozycja ${hi + 1}. w roku, najsłabsza ${lo + 1}. w roku (względem trendu).`); }
      const tRows = labels.map((l, i) => [esc(l), fmt(y[i]), mom[i] == null ? "–" : fmtPct(mom[i]), yoy[i] == null ? "–" : fmtPct(yoy[i]), ma[i] == null ? "–" : fmt(ma[i]), fmt(resid[i] / sdr, 1), anomalies.includes(i) ? '<span class="pill warn">anomalia</span>' : ""]);
      res.innerHTML = `<div class="kpis">${kpi("Zmiana w okresie", fmtPct(y[n-1] / y[0] - 1), `${fmt(y[0])} → ${fmt(y[n-1])}`)}${kpi("CAGR roczny", f > 1 ? fmtPct(cagrY) : fmtPct(cagrP))}${kpi("Ostatni okres r/r", lastYoy == null ? "–" : fmtPct(lastYoy), "", lastYoy < 0 ? "bad" : lastYoy > 0 ? "good" : "")}${kpi("Trend na okres", (lr.b >= 0 ? "+" : "") + shortNum(lr.b), "R² " + fmt(lr.r2, 2))}${kpi("Anomalie", anomalies.length, "", anomalies.length ? "warn" : "")}</div>
        ${lineChart({labels, series})}<div class="comment">${cm.map(c => `<p>${c}</p>`).join("")}</div>
        ${tableHTML([{l:"Okres"},{l:"Wartość",n:1},{l:"m/m",n:1},{l:"r/r",n:1},{l:"Średnia 3",n:1},{l:"Odchylenie (σ)",n:1},{l:""}], tRows, {rowCls: (r, i) => anomalies.includes(i) ? "flag" : ""})}`;
      res.append(exportBar("analiza-trendow", () => [["Okres","Wartość","m/m","r/r","Średnia 3","Odchylenie σ","Anomalia"], ...labels.map((l, i) => [l, y[i], mom[i] ?? "", yoy[i] ?? "", ma[i] ?? "", resid[i] / sdr, anomalies.includes(i) ? "tak" : ""])]));
      markUse("fa-trend");
    }
    $("#tr_z", root).addEventListener("input", run); $("#tr_f", root).addEventListener("change", run);
    run();
  }});

/* ——————————————— ANALIZA ODCHYLEŃ (uczy się typów pozycji i przyczyn) ——————————————— */
const EX_VAR = "Pozycja;Budżet;Wykonanie\nPrzychody ze sprzedaży;4 200 000;3 950 000\nPozostałe przychody operacyjne;60 000;84 000\nKoszt materiałów;1 700 000;1 810 000\nWynagrodzenia;1 150 000;1 142 000\nMarketing;180 000;236 000\nEnergia;95 000;121 000\nUsługi obce;310 000;288 000\nAmortyzacja;140 000;140 000";
const REV_RE = /przych|sprzeda|revenue|wpływ|dotacj|zysk|odsetki otrzym|dywidend/i;
reg({id:"bud-var", a:"bud", kind:"data", t:"Analiza odchyleń", min:30, d:"Wykonanie vs budżet: odchylenia zł i %, istotność, efekt ceny i ilości, komentarz dla zarządu. Pamięta przyczyny.",
  render(root, s){
    const {form, res} = calcShell(root, "");
    const pr = P().prog.match(/(\d+[.,]?\d*)\s*%/), pa = P().prog.match(/([\d\s.,]{4,})\s*zł/);
    const df = dataField({id:"va_data", label:"Pozycja; Budżet; Wykonanie (opcjonalnie: Ilość budżet; Ilość wykonanie)", ex:EX_VAR, value:s.data, hint:"Dodaj kolumny z ilościami, aby rozbić odchylenie na efekt ilości i ceny.", onChange:v => { s.data = v; persist(); run(); }});
    form.append(df, h(`<div class="row">${inp("va_pp", "Próg istotności %", s.pp ?? (pr ? pr[1] : "5"))}${inp("va_pa", "Próg istotności zł", s.pa ?? (pa ? pa[1].trim() : "50 000"))}</div>`), h(`<div class="info">Typ pozycji (przychód lub koszt) rozpoznaję automatycznie. Jeśli się pomylę, zmień go w tabeli: zapamiętam to. Przyczyny wpisane w tabeli podpowiem przy kolejnej analizie.</div>`));
    function run(){
      s.pp = val(root, "va_pp"); s.pa = val(root, "va_pa"); persist();
      const {rows} = parseTable(df.get());
      const data = rows.filter(r => r.length >= 3 && isNum(r[1]) && isNum(r[2]));
      if (!data.length) { res.innerHTML = `<div class="empty">Wklej tabelę: pozycja, budżet, wykonanie.</div>`; return; }
      const tp = num(root, "va_pp", 5) / 100, ta = num(root, "va_pa", 50000);
      const hasQ = data.every(r => r.length >= 5 && isNum(r[3]) && isNum(r[4]));
      const L = M.learn;
      const items = data.map(r => { const name = r[0], b = parseNum(r[1]), a = parseNum(r[2]);
        const type = L.varType[name] || (REV_RE.test(name) ? "rev" : "cost");
        const diff = a - b, p = b ? diff / Math.abs(b) : NaN, impact = type === "rev" ? diff : -diff;
        const material = Math.abs(diff) >= ta || (isFinite(p) && Math.abs(p) >= tp);
        let qe = null, pe = null;
        if (hasQ) { const qb = parseNum(r[3]), qa = parseNum(r[4]); if (qb && qa) { const pb = b / qb, pa2 = a / qa; qe = (qa - qb) * pb; pe = (pa2 - pb) * qa; } }
        return {name, b, a, diff, p, impact, type, material, qe, pe, cause: s.causes?.[name] ?? L.varCause[name] ?? "", learned: !s.causes?.[name] && !!L.varCause[name]}; });
      const sum = (t, k) => items.filter(i => i.type === t).reduce((x, i) => x + i[k], 0);
      const revB = sum("rev","b"), revA = sum("rev","a"), costB = sum("cost","b"), costA = sum("cost","a"), resB = revB - costB, resA = revA - costA;
      const neg = items.filter(i => i.impact < 0).sort((x, y) => x.impact - y.impact), pos = items.filter(i => i.impact > 0).sort((x, y) => y.impact - x.impact);
      const mat = items.filter(i => i.material);
      const cm = [`Wynik wyniósł ${fmtZl(resA, 0)} wobec ${fmtZl(resB, 0)} w budżecie, czyli ${resA >= resB ? "powyżej" : "poniżej"} planu o ${fmtZl(Math.abs(resA - resB), 0)} (${fmtPct(resB ? (resA - resB) / Math.abs(resB) : NaN)}).`];
      if (revB) cm.push(`Przychody: ${fmtZl(revA, 0)} (${fmtPct((revA - revB) / revB)} vs budżet). Koszty: ${fmtZl(costA, 0)} (${fmtPct(costB ? (costA - costB) / costB : NaN)}).`);
      if (neg.length) cm.push(`Największy negatywny wpływ: ${neg.slice(0, 3).map(i => `${i.name} (${fmtZl(i.impact, 0)}${i.cause ? `, ${i.cause}` : ""})`).join("; ")}.`);
      if (pos.length) cm.push(`Pozytywnie zadziałały: ${pos.slice(0, 2).map(i => `${i.name} (+${fmtZl(i.impact, 0)})`).join("; ")}.`);
      cm.push(mat.length ? `Istotnych odchyleń: ${mat.length} (próg ${fmt(tp * 100, 1)}% lub ${fmtZl(ta, 0)}). ${mat.filter(i => !i.cause).length ? `Brakuje wyjaśnień dla: ${mat.filter(i => !i.cause).map(i => i.name).join(", ")}.` : "Wszystkie mają przypisane przyczyny."}` : "Brak odchyleń przekraczających próg istotności.");
      const head = [{l:"Pozycja"},{l:"Typ"},{l:"Budżet",n:1},{l:"Wykonanie",n:1},{l:"Odchylenie zł",n:1},{l:"%",n:1},{l:"Wpływ na wynik"},...(hasQ ? [{l:"Efekt ilości",n:1},{l:"Efekt ceny",n:1}] : []),{l:"Przyczyna / działanie"}];
      const tRows = items.map((i, k) => [esc(i.name), `<select data-type="${k}" aria-label="Typ pozycji"><option value="rev"${i.type === "rev" ? " selected" : ""}>przychód</option><option value="cost"${i.type === "cost" ? " selected" : ""}>koszt</option></select>`, fmt(i.b), fmt(i.a), fmt(i.diff), fmtPct(i.p),
        `<span class="pill ${i.impact >= 0 ? "good" : "bad"}">${i.impact >= 0 ? "korzystne" : "niekorzystne"}</span>${i.material ? ' <span class="pill warn">istotne</span>' : ""}`,
        ...(hasQ ? [fmt(i.qe), fmt(i.pe)] : []), `<input data-cause="${k}" value="${esc(i.cause)}" placeholder="${i.material ? "Wpisz przyczynę…" : ""}" aria-label="Przyczyna">${i.learned ? '<span class="hint">podpowiedź z pamięci</span>' : ""}`]);
      tRows.push(["Wynik (przychody − koszty)", "", fmt(resB), fmt(resA), fmt(resA - resB), fmtPct(resB ? (resA - resB) / Math.abs(resB) : NaN), "", ...(hasQ ? ["", ""] : []), ""]);
      res.innerHTML = `<div class="kpis">${kpi("Wynik vs budżet", fmtZl(resA - resB, 0), fmtPct(resB ? (resA - resB) / Math.abs(resB) : NaN), resA >= resB ? "good" : "bad")}${kpi("Przychody", fmtPct(revB ? (revA - revB) / revB : NaN), fmtZl(revA - revB, 0), revA >= revB ? "good" : "bad")}${kpi("Koszty", fmtPct(costB ? (costA - costB) / costB : NaN), fmtZl(costA - costB, 0), costA <= costB ? "good" : "bad")}${kpi("Istotne odchylenia", mat.length, "", mat.length ? "warn" : "")}</div>
        <div class="comment">${cm.map(c => `<p>${esc(c)}</p>`).join("")}</div>
        ${tableHTML(head, tRows, {rowCls: (r, i) => i === items.length ? "tot" : items[i].material ? "flag" : ""})}
        <h3 style="font-size:15px">Wpływ odchyleń na wynik</h3>${hBars(items.filter(i => i.impact).sort((a, b) => a.impact - b.impact).map(i => ({l: i.name, v: i.impact})), {fmtV: v => (v > 0 ? "+" : "") + shortNum(v)})}`;
      res.append(exportBar("analiza-odchylen", () => [["Pozycja","Typ","Budżet","Wykonanie","Odchylenie zł","Odchylenie %","Wpływ","Istotne","Przyczyna"], ...items.map(i => [i.name, i.type === "rev" ? "przychód" : "koszt", i.b, i.a, i.diff, isFinite(i.p) ? (i.p * 100).toFixed(1).replace(".", ",") + "%" : "", i.impact >= 0 ? "korzystne" : "niekorzystne", i.material ? "tak" : "", i.cause]), [], ["Komentarz", cm.join(" ")]]));
      res.querySelectorAll("[data-type]").forEach(el => el.addEventListener("change", () => { const it = items[+el.dataset.type]; L.varType[it.name] = el.value; persist(); toast(`Zapamiętano: „${it.name}” to ${el.value === "rev" ? "przychód" : "koszt"}.`); run(); }));
      res.querySelectorAll("[data-cause]").forEach(el => el.addEventListener("change", () => { const it = items[+el.dataset.cause]; s.causes ||= {}; s.causes[it.name] = el.value; if (el.value.trim()) L.varCause[it.name] = el.value.trim(); persist(); run(); }));
      markUse("bud-var");
    }
    $("#va_pp", root).addEventListener("input", run); $("#va_pa", root).addEventListener("input", run);
    run();
  }});

/* ——————————————— PROGNOZA: wybór najlepszej metody na backteście ——————————————— */
function fcMethods(y, season = 12){
  const holt = (a, b) => (hist, H) => { let l = hist[0], t = hist[1] - hist[0]; for (let i = 1; i < hist.length; i++) { const pl = l; l = a * hist[i] + (1 - a) * (l + t); t = b * (l - pl) + (1 - b) * t; } return Array.from({length:H}, (_, k) => l + (k + 1) * t); };
  const m = {
    "Naiwna (ostatnia wartość)": (hist, H) => Array(H).fill(hist[hist.length - 1]),
    "Średnia krocząca (3)": (hist, H) => Array(H).fill(stat.mean(hist.slice(-3))),
    "Trend liniowy": (hist, H) => { const r = stat.linreg(hist); return Array.from({length:H}, (_, k) => r.a + r.b * (hist.length + k)); },
    "Wygładzanie Holta": (hist, H) => { let best = null; for (const a of [.2,.4,.6,.8]) for (const b of [.05,.1,.2,.4]) { const f = holt(a, b); let e = 0; for (let i = Math.max(3, hist.length - 6); i < hist.length; i++) e += Math.abs(f(hist.slice(0, i), 1)[0] - hist[i]); if (!best || e < best.e) best = {e, f}; } return best.f(hist, H); }
  };
  if (y.length >= 2 * season) {
    m["Sezonowa naiwna"] = (hist, H) => Array.from({length:H}, (_, k) => hist[hist.length - season + (k % season)]);
    m["Trend + sezonowość"] = (hist, H) => { const r = stat.linreg(hist); const idx = Array.from({length:season}, (_, j) => stat.mean(hist.map((v, i) => [i, v - (r.a + r.b * i)]).filter(([i]) => i % season === j).map(x => x[1]))); return Array.from({length:H}, (_, k) => { const i = hist.length + k; return r.a + r.b * i + idx[i % season]; }); };
  }
  return m;
}
reg({id:"bud-forecast", a:"bud", kind:"data", t:"Modelowanie prognoz", min:40, d:"Sześć metod prognozy sprawdzonych na danych historycznych (MAPE). Wybiera najlepszą i podaje przedział.",
  render(root, s){
    const {form, res} = calcShell(root, "");
    const df = dataField({id:"fc_data", label:"Historia: okres i wartość", ex:EX_TREND, value:s.data, onChange:v => { s.data = v; persist(); run(); }});
    form.append(df, h(`<div class="row">${inp("fc_h", "Horyzont (okresy)", s.hz ?? "6")}${inp("fc_t", "Okresy testowe", s.ht ?? "6", "Ostatnie okresy użyte do sprawdzenia trafności.")}</div>`));
    function run(){
      s.hz = val(root, "fc_h"); s.ht = val(root, "fc_t"); persist();
      const {rows} = parseTable(df.get()); const data = rows.filter(r => r.length >= 2 && isNum(r[1]));
      if (data.length < 8) { res.innerHTML = `<div class="empty">Potrzebuję co najmniej 8 okresów historii.</div>`; return; }
      const y = data.map(r => parseNum(r[1])), labels = data.map(r => r[0]);
      const H = Math.min(36, Math.max(1, Math.round(num(root, "fc_h", 6)))), T = Math.min(Math.floor(y.length / 3), Math.max(2, Math.round(num(root, "fc_t", 6))));
      const meth = fcMethods(y), train = y.slice(0, -T), test = y.slice(-T);
      const scores = Object.entries(meth).map(([name, f]) => { const fc = f(train, T); const mape = stat.mean(test.map((v, i) => Math.abs((v - fc[i]) / v))); const rmse = Math.sqrt(stat.mean(test.map((v, i) => (v - fc[i]) ** 2))); return {name, mape, rmse, f}; }).filter(x => isFinite(x.mape)).sort((a, b) => a.mape - b.mape);
      const best = scores[0], fc = best.f(y, H);
      const nextLabel = k => { const m = labels[labels.length - 1].match(/^(\d{1,2})[./-](\d{4})$/); if (m) { const d = new Date(+m[2], +m[1] - 1 + k + 1, 1); return `${pad(d.getMonth() + 1)}.${d.getFullYear()}`; } return "+" + (k + 1); };
      const fl = fc.map((_, k) => nextLabel(k)), lo = fc.map((v, k) => v - 1.28 * best.rmse * Math.sqrt(k + 1)), hi = fc.map((v, k) => v + 1.28 * best.rmse * Math.sqrt(k + 1));
      const all = [...labels, ...fl], pad0 = Array(y.length - 1).fill(null);
      const quality = best.mape < .05 ? "bardzo dobra" : best.mape < .1 ? "dobra" : best.mape < .2 ? "umiarkowana" : "słaba";
      res.innerHTML = `<div class="kpis">${kpi("Najlepsza metoda", `<span style="font-size:15px">${esc(best.name)}</span>`)}${kpi("Błąd MAPE", pct(best.mape), "trafność " + quality, best.mape < .1 ? "good" : best.mape < .2 ? "warn" : "bad")}${kpi("Suma prognozy", shortNum(fc.reduce((a, b) => a + b, 0)), H + " okresów")}${kpi("Zmiana vs ostatnie " + H, fmtPct(fc.reduce((a, b) => a + b, 0) / y.slice(-H).reduce((a, b) => a + b, 0) - 1))}</div>
        ${lineChart({labels: all, series:[{name:"Historia", values:[...y, ...Array(H).fill(null)], area:true}, {name:"Prognoza", values:[...pad0, y[y.length - 1], ...fc], color:"var(--learn)", dash:true}, {name:"Przedział 80%", values:[...pad0, null, ...hi], color:"var(--muted)", w:1, dash:true}, {name:"", values:[...pad0, null, ...lo], color:"var(--muted)", w:1, dash:true}].slice(0, 4)})}
        <div class="comment"><p>Sprawdziłem ${scores.length} metod na ostatnich ${T} okresach. Najmniejszy błąd dała metoda „${esc(best.name)}” (MAPE ${pct(best.mape)}), więc jej używam do prognozy. Przedział pokazuje zakres, w którym z około 80% pewnością znajdzie się wynik; rośnie z długością horyzontu.</p><p>Prognoza statystyczna nie zna Twoich planów (nowi klienci, zmiany cen). Użyj jej jako punktu odniesienia i skoryguj o znane zdarzenia.</p></div>
        <h3 style="font-size:15px">Porównanie metod</h3>${tableHTML([{l:"Metoda"},{l:"MAPE",n:1},{l:"RMSE",n:1},{l:""}], scores.map((x, i) => [esc(x.name), pct(x.mape), fmt(x.rmse), i === 0 ? '<span class="pill good">najlepsza</span>' : ""]))}
        <h3 style="font-size:15px">Prognoza</h3>${tableHTML([{l:"Okres"},{l:"Prognoza",n:1},{l:"Dolna granica",n:1},{l:"Górna granica",n:1}], fc.map((v, k) => [fl[k], fmt(v), fmt(lo[k]), fmt(hi[k])]))}`;
      res.append(exportBar("prognoza", () => [["Okres","Prognoza","Dolna","Górna"], ...fc.map((v, k) => [fl[k], Math.round(v), Math.round(lo[k]), Math.round(hi[k])])]));
      markUse("bud-forecast");
    }
    ["fc_h","fc_t"].forEach(id => $("#" + id, root).addEventListener("input", run));
    run();
  }});

/* ——————————————— PŁYNNOŚĆ 13 TYGODNI ——————————————— */
reg({id:"bud-cash13", a:"bud", kind:"calc", nw:true, t:"Płynność na 13 tygodni", min:40, d:"Kroczący cash flow tydzień po tygodniu. Automatycznie układa wynagrodzenia, ZUS, PIT i VAT według terminów.",
  render(root, s){
    const mon = (() => { const d = today(); return addDays(d, (8 - d.getDay()) % 7 || 0); })();
    const {form, res} = calcShell(root, `
      <div class="row">${inp("c_start", "Pierwszy tydzień od", isoDate(mon), "", 'type="date"')}${inp("c_open", "Saldo początkowe (zł)", "1 850 000")}</div>
      <div class="row">${inp("c_min", "Minimalne bezpieczne saldo", "500 000")}${inp("c_in", "Wpływy od klientów tygodniowo", "880 000")}</div>
      <div class="row">${inp("c_sup", "Płatności dla dostawców tygodniowo", "520 000")}${inp("c_oth", "Inne wydatki tygodniowo", "35 000")}</div>
      <div class="row">${inp("c_pay", "Wynagrodzenia netto miesięcznie", "610 000")}${inp("c_payd", "Dzień wypłaty", "10")}</div>
      <div class="row">${inp("c_zus", "ZUS i PIT miesięcznie", "420 000", "Płatne do " + P().zus + ". dnia.")}${inp("c_vat", "VAT do zapłaty miesięcznie", "260 000", "Płatny do 25. dnia.")}</div>
      <div class="row">${inp("c_loan", "Raty kredytów miesięcznie", "150 000")}${inp("c_loand", "Dzień raty", "15")}</div>
      <div class="info">Kwoty w tabeli możesz nadpisać ręcznie (np. duża płatność od klienta). Nadpisania są zapamiętywane i oznaczone kolorem.</div>
      <button class="btn sm" type="button" id="c_reset">Usuń ręczne nadpisania</button>`);
    s.ov ||= {};
    const ROWS = [["in","Wpływy od klientów",1],["oin","Inne wpływy",1],["sup","Dostawcy",-1],["pay","Wynagrodzenia",-1],["zus","ZUS i PIT",-1],["vat","VAT",-1],["loan","Kredyty",-1],["oth","Inne wydatki",-1]];
    function run(){
      const st = parseDate(val(root, "c_start")) || mon, weeks = Array.from({length:13}, (_, i) => addDays(st, i * 7));
      const inWeek = (day, w) => { const res = []; for (let k = 0; k < 7; k++) { const d = addDays(w, k); if (d.getDate() === day) res.push(d); } return res.length > 0; };
      const monthlyIn = (amt, day) => weeks.map(w => { let hit = false; for (let k = 0; k < 7; k++) { const d = addDays(w, k); const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); if (d.getDate() === Math.min(day, dim)) hit = true; } return hit ? amt : 0; });
      const base = {in: weeks.map(() => num(root, "c_in")), oin: weeks.map(() => 0), sup: weeks.map(() => num(root, "c_sup")), oth: weeks.map(() => num(root, "c_oth")),
        pay: monthlyIn(num(root, "c_pay"), num(root, "c_payd", 10)), zus: monthlyIn(num(root, "c_zus"), +P().zus || 20), vat: monthlyIn(num(root, "c_vat"), 25), loan: monthlyIn(num(root, "c_loan"), num(root, "c_loand", 15))};
      const g = {}; ROWS.forEach(([k]) => g[k] = base[k].map((v, i) => s.ov[k + "|" + i] != null ? s.ov[k + "|" + i] : v));
      let bal = num(root, "c_open"); const minB = num(root, "c_min"); const net = [], close = [];
      weeks.forEach((_, i) => { const n = ROWS.reduce((a, [k, , sg]) => a + sg * g[k][i], 0); bal += n; net.push(n); close.push(bal); });
      const low = close.map((b, i) => b < minB ? i : -1).filter(i => i >= 0), minIdx = close.indexOf(Math.min(...close));
      const wl = weeks.map((w, i) => `T${i + 1} ${pad(w.getDate())}.${pad(w.getMonth() + 1)}`);
      const cell = (k, i, v) => `<input class="n" data-k="${k}" data-i="${i}" value="${fmt(v)}" style="${s.ov[k + "|" + i] != null ? "background:var(--learn-soft)" : ""}" aria-label="${k} tydzień ${i + 1}">`;
      const body = ROWS.map(([k, l]) => `<tr><td>${l}</td>${weeks.map((_, i) => `<td class="n">${cell(k, i, g[k][i])}</td>`).join("")}</tr>`).join("");
      res.innerHTML = `<div class="kpis">${kpi("Saldo po 13 tygodniach", shortNum(close[12]), "", close[12] < minB ? "bad" : "good")}${kpi("Najniższe saldo", shortNum(close[minIdx]), wl[minIdx], close[minIdx] < minB ? "bad" : close[minIdx] < minB * 1.3 ? "warn" : "good")}${kpi("Tygodnie poniżej minimum", low.length, "", low.length ? "bad" : "good")}${kpi("Przepływ netto", shortNum(net.reduce((a, b) => a + b, 0)))}</div>
        ${lineChart({labels: wl.map(x => x.split(" ")[1]), series:[{name:"Saldo na koniec tygodnia", values:close, area:true, marks:low}, {name:"Minimum", values:close.map(() => minB), color:"var(--bad)", dash:true, w:1.4}], bars: net})}
        <div class="comment">${low.length ? `<p><b>Uwaga:</b> saldo spada poniżej minimum w tygodniach ${low.map(i => wl[i]).join(", ")}. Największy niedobór to ${fmtZl(minB - close[minIdx], 0)} w tygodniu ${wl[minIdx]}.</p><p>Możliwe działania: przyspieszenie windykacji największych należności, faktoring, przesunięcie płatności do dostawców o 1–2 tygodnie, uruchomienie linii kredytowej, przesunięcie wydatków inwestycyjnych.</p>` : `<p>Saldo w całym okresie pozostaje powyżej minimum. Najniższy punkt to ${wl[minIdx]} (${fmtZl(close[minIdx], 0)}).</p>`}</div>
        <div class="tbl"><table><thead><tr><th>Pozycja</th>${wl.map(w => `<th class="n">${w}</th>`).join("")}</tr></thead><tbody>${body}
        <tr class="tot"><td>Przepływ netto</td>${net.map(v => `<td class="n ${v < 0 ? "unf" : ""}">${fmt(v)}</td>`).join("")}</tr>
        <tr class="tot"><td>Saldo końcowe</td>${close.map(v => `<td class="n ${v < minB ? "unf" : ""}">${fmt(v)}</td>`).join("")}</tr></tbody></table></div>`;
      res.append(exportBar("plynnosc-13-tygodni", () => [["Pozycja", ...wl], ...ROWS.map(([k, l, sg]) => [l, ...g[k].map(v => sg * v)]), ["Przepływ netto", ...net], ["Saldo końcowe", ...close]]));
      res.querySelectorAll("input[data-k]").forEach(el => el.addEventListener("change", () => { const v = parseNum(el.value); const key = el.dataset.k + "|" + el.dataset.i; if (isFinite(v)) s.ov[key] = v; else delete s.ov[key]; persist(); run(); }));
      markUse("bud-cash13");
    }
    $("#c_reset", root).addEventListener("click", () => { s.ov = {}; persist(); run(); toast("Usunięto nadpisania."); });
    liveForm(root, s, ["c_start","c_open","c_min","c_in","c_sup","c_oth","c_pay","c_payd","c_zus","c_vat","c_loan","c_loand"], run);
  }});

/* ——————————————— BUDŻET ROCZNY ——————————————— */
const SEASON = {"równomierny":[1,1,1,1,1,1,1,1,1,1,1,1], "handel (silny IV kwartał)":[.8,.75,.9,.95,.95,.9,.9,.95,1,1.1,1.3,1.5], "budownictwo (sezon letni)":[.55,.6,.85,1.05,1.15,1.2,1.25,1.25,1.15,1.05,.8,.55], "turystyka i gastronomia (lato)":[.6,.65,.75,.9,1.05,1.3,1.55,1.55,1.05,.8,.65,.8], "usługi B2B (spadek w wakacje)":[1,1,1.05,1.05,1.05,1,.85,.8,1.05,1.1,1.05,1]};
reg({id:"bud-create", a:"bud", kind:"calc", t:"Tworzenie budżetu", min:45, d:"Budżet miesięczny z czynników: sezonowość, marża, wynagrodzenia z podwyżką, marketing, CAPEX, podatek.",
  render(root, s){
    const {form, res} = calcShell(root, `
      <div class="row">${inp("b_y", "Rok budżetu", String(today().getFullYear() + 1))}${inp("b_rev", "Przychody roczne (zł)", "46 000 000")}</div>
      ${sel("b_sea", "Profil sezonowości", Object.keys(SEASON), "równomierny")}
      <div class="row">${inp("b_cogs", "Koszt własny sprzedaży (% przychodów)", "58")}${inp("b_mkt", "Marketing (% przychodów)", "4")}</div>
      <div class="row">${inp("b_pay", "Wynagrodzenia z narzutami miesięcznie", "1 150 000")}${inp("b_raise", "Podwyżka %", "6")}</div>
      <div class="row">${sel("b_rm", "Podwyżka od miesiąca", MONTHS.map((m, i) => [String(i), m]), "3")}${inp("b_fix", "Inne koszty stałe miesięcznie", "420 000")}</div>
      <div class="row">${inp("b_dep", "Amortyzacja miesięcznie", "140 000")}${sel("b_cit", "Stawka CIT", [["19","19%"],["9","9% (mały podatnik)"]], "19")}</div>
      <div class="field"><label for="b_capex">CAPEX (miesiąc; kwota), każda pozycja w osobnym wierszu</label><textarea id="b_capex" class="data" style="min-height:70px">3;450 000\n9;1 200 000</textarea></div>`);
    function run(){
      const rev = num(root, "b_rev"), w = SEASON[val(root, "b_sea")] || SEASON["równomierny"], ws = w.reduce((a, b) => a + b, 0);
      const cogs = num(root, "b_cogs") / 100, mkt = num(root, "b_mkt") / 100, pay = num(root, "b_pay"), raise = num(root, "b_raise") / 100, rm = +val(root, "b_rm"), fix = num(root, "b_fix"), dep = num(root, "b_dep"), cit = num(root, "b_cit", 19) / 100;
      const capex = Array(12).fill(0); parseTable(val(root, "b_capex")).rows.forEach(r => { const m = Math.round(parseNum(r[0])) - 1; if (m >= 0 && m < 12) capex[m] += parseNum(r[1]) || 0; });
      const L = {};
      L.rev = w.map(x => rev * x / ws); L.cogs = L.rev.map(v => v * cogs); L.gp = L.rev.map((v, i) => v - L.cogs[i]);
      L.pay = w.map((_, i) => pay * (i >= rm ? 1 + raise : 1)); L.mkt = L.rev.map(v => v * mkt); L.fix = w.map(() => fix);
      L.ebitda = L.gp.map((v, i) => v - L.pay[i] - L.mkt[i] - L.fix[i]); L.dep = w.map(() => dep); L.ebit = L.ebitda.map((v, i) => v - dep);
      let cum = 0, paid = 0; L.tax = L.ebit.map(v => { cum += v; const due = Math.max(0, cum * cit) - paid; paid += due; return due; }); L.net = L.ebit.map((v, i) => v - L.tax[i]); L.capex = capex;
      const T = k => L[k].reduce((a, b) => a + b, 0);
      const R = [["rev","Przychody"],["cogs","Koszt własny sprzedaży"],["gp","Marża brutto"],["pay","Wynagrodzenia"],["mkt","Marketing"],["fix","Inne koszty stałe"],["ebitda","EBITDA"],["dep","Amortyzacja"],["ebit","EBIT"],["tax","CIT (zaliczki narastająco)"],["net","Zysk netto"],["capex","CAPEX"]];
      const bold = new Set(["gp","ebitda","ebit","net"]);
      const minE = L.ebitda.indexOf(Math.min(...L.ebitda));
      res.innerHTML = `<div class="kpis">${kpi("Przychody", shortNum(T("rev")))}${kpi("Marża brutto", pct(T("gp") / T("rev")))}${kpi("EBITDA", shortNum(T("ebitda")), "marża " + pct(T("ebitda") / T("rev")), T("ebitda") < 0 ? "bad" : "good")}${kpi("Zysk netto", shortNum(T("net")), "", T("net") < 0 ? "bad" : "")}${kpi("CAPEX", shortNum(T("capex")))}</div>
        ${lineChart({labels: MONTHS.map(m => m.slice(0, 3)), series:[{name:"Przychody", values:L.rev, area:true}, {name:"EBITDA", values:L.ebitda, color:"var(--learn)"}]})}
        <div class="comment"><p>Budżet zakłada przychody ${fmtZl(T("rev"), 0)} i EBITDA ${fmtZl(T("ebitda"), 0)} (marża ${pct(T("ebitda") / T("rev"))}). Najsłabszy miesiąc to ${MONTHS[minE]} (EBITDA ${fmtZl(L.ebitda[minE], 0)}).${L.ebitda.some(v => v < 0) ? " W miesiącach ze stratą zaplanuj finansowanie kapitału obrotowego." : ""} Podwyżka ${fmt(raise * 100, 1)}% od ${MONTHS_GEN[rm]} kosztuje ${fmtZl(pay * raise * (12 - rm), 0)} w tym roku.</p></div>
        <div class="tbl"><table><thead><tr><th>Pozycja</th>${MONTHS.map(m => `<th class="n">${m.slice(0, 3)}</th>`).join("")}<th class="n">Razem</th></tr></thead><tbody>${R.map(([k, l]) => `<tr class="${bold.has(k) ? "tot" : ""}"><td>${l}</td>${L[k].map(v => `<td class="n ${v < 0 ? "unf" : ""}">${fmt(v)}</td>`).join("")}<td class="n">${fmt(T(k))}</td></tr>`).join("")}</tbody></table></div>`;
      res.append(exportBar("budzet-" + val(root, "b_y"), () => [["Pozycja", ...MONTHS, "Razem"], ...R.map(([k, l]) => [l, ...L[k].map(v => Math.round(v)), Math.round(T(k))])]));
      markUse("bud-create");
    }
    liveForm(root, s, ["b_y","b_rev","b_sea","b_cogs","b_mkt","b_pay","b_raise","b_rm","b_fix","b_dep","b_cit","b_capex"], run);
  }});

/* ——————————————— SCENARIUSZE I WRAŻLIWOŚĆ ——————————————— */
reg({id:"fa-scen", a:"fa", kind:"calc", t:"Analiza scenariuszowa", min:35, d:"Scenariusz bazowy, optymistyczny, pesymistyczny i stresowy oraz wykres tornado wrażliwości EBITDA.",
  render(root, s){
    const DRV = [["v","Wolumen %"],["p","Cena %"],["c","Koszt jednostkowy %"],["f","Koszty stałe %"],["fx","Kurs EUR/PLN %"]];
    const DEF = {bazowy:{v:0,p:0,c:0,f:0,fx:0}, optymistyczny:{v:6,p:3,c:2,f:3,fx:3}, pesymistyczny:{v:-8,p:-2,c:6,f:5,fx:-5}, stresowy:{v:-20,p:-5,c:10,f:5,fx:-10}};
    s.sc ||= JSON.parse(JSON.stringify(DEF));
    const {form, res} = calcShell(root, `
      <div class="row">${inp("s_rev", "Przychody bazowe (zł)", "46 000 000")}${inp("s_gm", "Marża brutto %", "42")}</div>
      <div class="row">${inp("s_fix", "Koszty stałe (zł)", "14 500 000")}${inp("s_eur", "Udział przychodów w EUR %", "35")}</div>
      ${inp("s_eurc", "Udział kosztów zmiennych w EUR %", "20")}
      <span class="lbl-s">Założenia scenariuszy (zmiana względem bazy)</span><div class="tbl" id="s_tab"></div>`);
    const tab = $("#s_tab", root);
    const drawTab = () => { tab.innerHTML = `<table><thead><tr><th>Czynnik</th>${Object.keys(s.sc).map(k => `<th class="n">${k}</th>`).join("")}</tr></thead><tbody>${DRV.map(([d, l]) => `<tr><td>${l}</td>${Object.keys(s.sc).map(k => `<td><input class="n" data-s="${k}" data-d="${d}" value="${fmt(s.sc[k][d], 1)}" aria-label="${l} ${k}"></td>`).join("")}</tr>`).join("")}</tbody></table>`; };
    drawTab();
    tab.addEventListener("change", e => { const t = e.target; if (!t.dataset.s) return; s.sc[t.dataset.s][t.dataset.d] = parseNum(t.value) || 0; persist(); run(); });
    function model(d){ const R0 = num(root, "s_rev"), gm = num(root, "s_gm") / 100, F0 = num(root, "s_fix"), er = num(root, "s_eur") / 100, ec = num(root, "s_eurc") / 100;
      const rev = R0 * (1 + d.v / 100) * (1 + d.p / 100) * (1 + er * d.fx / 100), vc = R0 * (1 - gm) * (1 + d.v / 100) * (1 + d.c / 100) * (1 + ec * d.fx / 100), fix = F0 * (1 + d.f / 100);
      return {rev, gp: rev - vc, fix, ebitda: rev - vc - fix}; }
    function run(){
      const out = Object.fromEntries(Object.entries(s.sc).map(([k, d]) => [k, model(d)])), b = out.bazowy;
      const tor = [["v","Wolumen ±10%",10],["p","Cena ±5%",5],["c","Koszt jednostkowy ±10%",10],["f","Koszty stałe ±10%",10],["fx","Kurs EUR ±10%",10]].map(([d, l, st]) => { const up = model(Object.assign({v:0,p:0,c:0,f:0,fx:0}, {[d]: st})).ebitda - b.ebitda, dn = model(Object.assign({v:0,p:0,c:0,f:0,fx:0}, {[d]: -st})).ebitda - b.ebitda; return {l, up, dn, r: Math.abs(up - dn)}; }).sort((a, b2) => b2.r - a.r);
      const bev = num(root, "s_fix") / (num(root, "s_gm") / 100), sm = 1 - bev / num(root, "s_rev");
      res.innerHTML = `<div class="kpis">${Object.entries(out).map(([k, o]) => kpi("EBITDA " + k, shortNum(o.ebitda), k === "bazowy" ? "marża " + pct(o.ebitda / o.rev) : fmtPct(o.ebitda / b.ebitda - 1) + " vs baza", o.ebitda < 0 ? "bad" : k === "bazowy" ? "" : o.ebitda >= b.ebitda ? "good" : "warn")).join("")}</div>
        ${tableHTML([{l:"Wynik"}, ...Object.keys(out).map(k => ({l:k, n:1}))], [["Przychody", ...Object.values(out).map(o => fmt(o.rev))], ["Marża brutto", ...Object.values(out).map(o => fmt(o.gp))], ["Koszty stałe", ...Object.values(out).map(o => fmt(o.fix))], ["EBITDA", ...Object.values(out).map(o => fmt(o.ebitda))], ["Marża EBITDA", ...Object.values(out).map(o => pct(o.ebitda / o.rev))], ["Zmiana EBITDA vs baza", ...Object.values(out).map(o => fmtPct(o.ebitda / b.ebitda - 1))]], {rowCls: (r, i) => i === 3 ? "tot" : ""})}
        <h3 style="font-size:15px">Wrażliwość EBITDA (tornado)</h3>
        ${hBars(tor.flatMap(t => [{l: t.l + " (w górę)", v: t.up}, {l: t.l + " (w dół)", v: t.dn}]), {fmtV: v => (v > 0 ? "+" : "") + shortNum(v)})}
        <div class="comment"><p>Najsilniej na EBITDA działa: ${tor[0].l.toLowerCase()} (rozpiętość ${fmtZl(tor[0].r, 0)}), a następnie ${tor[1].l.toLowerCase()}. Na tych czynnikach skup monitoring i plany awaryjne.</p><p>Próg rentowności EBITDA: ${fmtZl(bev, 0)} przychodów. Margines bezpieczeństwa: ${pct(sm)} (o tyle mogą spaść przychody, zanim EBITDA będzie zerowa).</p>${out.stresowy && out.stresowy.ebitda < 0 ? `<p><b>Scenariusz stresowy daje stratę ${fmtZl(out.stresowy.ebitda, 0)}.</b> Przygotuj plan działań: cięcie kosztów stałych, renegocjacja cen, zabezpieczenie walutowe.</p>` : ""}</div>`;
      res.append(exportBar("scenariusze", () => [["Wynik", ...Object.keys(out)], ["Przychody", ...Object.values(out).map(o => Math.round(o.rev))], ["Marża brutto", ...Object.values(out).map(o => Math.round(o.gp))], ["EBITDA", ...Object.values(out).map(o => Math.round(o.ebitda))]]));
      markUse("fa-scen");
    }
    liveForm(root, s, ["s_rev","s_gm","s_fix","s_eur","s_eurc"], run);
  }});

/* ——————————————— NPV / IRR (inwestycje i koszty–korzyści) ——————————————— */
function npv(r, cf){ return cf.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0); }
function irr(cf){ let lo = -0.99, hi = 10, flo = npv(lo, cf), fhi = npv(hi, cf); if (flo * fhi > 0) return NaN; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2, fm = npv(mid, cf); if (Math.abs(fm) < 1e-7) return mid; if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; } } return (lo + hi) / 2; }
function payback(cf){ let cum = 0; for (let t = 0; t < cf.length; t++) { const prev = cum; cum += cf[t]; if (t > 0 && cum >= 0 && prev < 0) return t - 1 + (-prev / cf[t]); } return cum >= 0 && cf[0] >= 0 ? 0 : NaN; }
function renderNPV(id, defaults, extra = ""){
  return (root, s) => {
    const {form, res} = calcShell(root, `
      <div class="row">${inp("n_inv", "Nakład początkowy (zł)", defaults.inv)}${inp("n_rate", "Stopa dyskontowa %", defaults.rate, "Koszt kapitału (WACC) lub wymagana stopa zwrotu.")}</div>
      <div class="row">${inp("n_ben", "Korzyści roczne (zł)", defaults.ben)}${inp("n_cost", "Koszty roczne (zł)", defaults.cost)}</div>
      <div class="row">${inp("n_yrs", "Liczba lat", defaults.yrs)}${inp("n_g", "Wzrost korzyści rocznie %", "0")}</div>
      <div class="row">${inp("n_res", "Wartość rezydualna na końcu (zł)", defaults.res)}${inp("n_tax", "Podatek dochodowy %", "19", "Wpisz 0, aby liczyć przed podatkiem.")}</div>
      <div class="field"><label for="n_cf">Albo własne przepływy (rok; kwota). Jeśli wypełnione, mają pierwszeństwo.</label><textarea id="n_cf" class="data" style="min-height:80px" placeholder="0;-2 400 000&#10;1;520 000&#10;2;610 000"></textarea></div>${extra}`);
    function run(){
      let cf;
      const own = parseTable(val(root, "n_cf")).rows.filter(r => r.length >= 2 && isNum(r[1]));
      const tax = num(root, "n_tax") / 100, inv = num(root, "n_inv"), yrs = Math.min(40, Math.max(1, Math.round(num(root, "n_yrs", 5))));
      if (own.length >= 2) { cf = []; own.forEach(r => { cf[Math.round(parseNum(r[0]))] = parseNum(r[1]); }); cf = Array.from(cf, x => x || 0); }
      else { const dep = inv / yrs; cf = [-inv]; for (let t = 1; t <= yrs; t++) { const ben = num(root, "n_ben") * Math.pow(1 + num(root, "n_g") / 100, t - 1), cost = num(root, "n_cost"); const ebit = ben - cost - dep; cf.push(ben - cost - Math.max(0, ebit) * tax + (t === yrs ? num(root, "n_res") : 0)); } }
      const r = num(root, "n_rate", 9) / 100, v = npv(r, cf), i = irr(cf), pb = payback(cf), disc = cf.map((c, t) => c / Math.pow(1 + r, t)), dpb = payback(disc), pi = cf[0] ? (v - cf[0]) / -cf[0] : NaN;
      let cum = 0, dcum = 0;
      const rows = cf.map((c, t) => { cum += c; dcum += disc[t]; return [String(t), fmt(c), fmt(1 / Math.pow(1 + r, t), 4), fmt(disc[t]), fmt(cum), fmt(dcum)]; });
      const rates = [-2, -1, 0, 1, 2].map(d => r + d / 100), mult = [-.2, -.1, 0, .1];
      const sens = mult.map(m => [`przepływy ${m ? (m > 0 ? "+" : "") + m * 100 + "%" : "bazowe"}`, ...rates.map(rr => { const x = npv(rr, cf.map((c, t) => t ? c * (1 + m) : c)); return `<span class="${x < 0 ? "unf" : "fav"}" style="color:${x < 0 ? "var(--bad)" : "var(--good)"}">${fmt(x)}</span>`; })]);
      const verdict = v > 0 && (isNaN(i) || i > r) ? ["good", "Projekt tworzy wartość: NPV jest dodatnie, a IRR przekracza stopę dyskontową. Rekomendacja: realizować, jeśli ryzyka są akceptowalne."] : v > -0.05 * Math.abs(cf[0]) ? ["warn", "Projekt jest na granicy opłacalności. Rekomendacja: realizować warunkowo, po poprawie założeń (koszt, harmonogram, finansowanie)."] : ["bad", "Projekt nie zwraca kosztu kapitału przy obecnych założeniach. Rekomendacja: odrzucić lub przeprojektować."];
      res.innerHTML = `<div class="kpis">${kpi("NPV", shortNum(v), "przy stopie " + pct(r), v >= 0 ? "good" : "bad")}${kpi("IRR", isFinite(i) ? pct(i) : "brak", "", isFinite(i) && i > r ? "good" : "bad")}${kpi("Okres zwrotu", isFinite(pb) ? fmt(pb, 1) + " lat" : "powyżej horyzontu")}${kpi("Zdyskontowany zwrot", isFinite(dpb) ? fmt(dpb, 1) + " lat" : "powyżej horyzontu")}${kpi("Wskaźnik rentowności (PI)", fmt(pi, 2), pi >= 1 ? "≥ 1: tworzy wartość" : "< 1", pi >= 1 ? "good" : "bad")}</div>
        <div class="comment" style="border-color:var(--${verdict[0]})"><p>${verdict[1]}</p></div>
        ${tableHTML([{l:"Rok"},{l:"Przepływ",n:1},{l:"Czynnik dyskonta",n:1},{l:"Wartość bieżąca",n:1},{l:"Narastająco",n:1},{l:"Narastająco zdyskont.",n:1}], rows)}
        <h3 style="font-size:15px">Wrażliwość NPV: stopa dyskontowa × przepływy</h3>
        ${tableHTML([{l:""}, ...rates.map(x => ({l: pct(x), n:1}))], sens)}`;
      res.append(exportBar(id, () => [["Rok","Przepływ","Wartość bieżąca"], ...cf.map((c, t) => [t, Math.round(c), Math.round(disc[t])]), [], ["NPV", Math.round(v)], ["IRR", isFinite(i) ? (i * 100).toFixed(2).replace(".", ",") + "%" : "brak"]]));
      markUse(id);
    }
    liveForm(root, s, ["n_inv","n_rate","n_ben","n_cost","n_yrs","n_g","n_res","n_tax","n_cf"], run);
  };
}
reg({id:"fa-invest", a:"fa", kind:"calc", t:"Research inwestycyjny", min:35, d:"Ocena inwestycji: NPV, IRR, okres zwrotu, PI, wrażliwość i rekomendacja. Z listą pytań do due diligence.",
  render: renderNPV("fa-invest", {inv:"2 400 000", rate:"10", ben:"820 000", cost:"140 000", yrs:"7", res:"200 000"},
    `<details class="info"><summary style="cursor:pointer;font-weight:600;color:var(--ink)">Pytania do analizy inwestycji</summary><ol style="margin:8px 0 0;padding-left:18px"><li>Jaka jest teza inwestycyjna i jakie założenie jest najbardziej ryzykowne?</li><li>Skąd pochodzą prognozy przychodów (umowy, lejek sprzedaży, rynek)?</li><li>Jakie są przewagi konkurencyjne i jak trwałe?</li><li>Jakie nakłady odtworzeniowe będą potrzebne w horyzoncie analizy?</li><li>Jak inwestycja wpłynie na kapitał obrotowy i kowenanty?</li><li>Jakie są alternatywy (leasing, outsourcing, odłożenie decyzji)?</li><li>Jaki jest scenariusz wyjścia i wartość odzyskiwalna aktywów?</li><li>Czy przysługuje ulga (robotyzacja, B+R, strefa inwestycyjna)?</li></ol></details>`)});
reg({id:"bud-cba", a:"bud", kind:"calc", t:"Analiza kosztów i korzyści", min:30, d:"Opłacalność projektu: przepływy rok po roku, NPV, IRR, próg zwrotu i wrażliwość na założenia.",
  render: renderNPV("bud-cba", {inv:"380 000", rate:"9", ben:"210 000", cost:"60 000", yrs:"5", res:"0"})});

/* ——————————————— WSKAŹNIKI KPI (cele zapamiętywane) ——————————————— */
reg({id:"cfo-kpi", a:"cfo", kind:"calc", t:"Wskaźniki efektywności", min:30, d:"Rotacje (DSO, DIO, DPO), cykl konwersji gotówki, marże, płynność, zadłużenie i ROE ze statusem względem Twoich celów.",
  render(root, s){
    const F = [["k_days","Dni w okresie","365"],["k_rev","Przychody","46 000 000"],["k_cogs","Koszt własny sprzedaży","26 700 000"],["k_ebitda","EBITDA","5 300 000"],["k_net","Zysk netto","2 900 000"],["k_int","Koszty odsetek","620 000"],["k_ar","Należności handlowe","8 200 000"],["k_inv","Zapasy","5 100 000"],["k_ap","Zobowiązania handlowe","4 300 000"],["k_ca","Aktywa obrotowe","15 600 000"],["k_cash","Środki pieniężne","1 850 000"],["k_cl","Zobowiązania krótkoterminowe","9 800 000"],["k_debt","Dług oprocentowany","9 400 000"],["k_eq","Kapitał własny","17 900 000"],["k_ta","Aktywa razem","36 500 000"]];
    const {form, res} = calcShell(root, `<div class="row">${F.map(([id, l, v]) => inp(id, l, v)).join("")}</div>`);
    $$(".row .field", form).forEach(f => f.style.flex = "1 1 150px");
    s.tg ||= {};
    const DEF = {gm:[">=",40], em:[">=",12], nm:[">=",5], dso:["<=",60], dio:["<=",45], dpo:[">=",45], ccc:["<=",60], cr:[">=",1.2], qr:[">=",1], nd:["<=",2.5], roe:[">=",12], roa:[">=",5], ic:[">=",4]};
    function run(){
      const g = id => num(root, id), d = g("k_days") || 365, ann = 365 / d;
      const K = [["gm","Marża brutto","%",(g("k_rev") - g("k_cogs")) / g("k_rev") * 100],["em","Marża EBITDA","%",g("k_ebitda") / g("k_rev") * 100],["nm","Marża netto","%",g("k_net") / g("k_rev") * 100],
        ["dso","DSO: rotacja należności","dni",g("k_ar") / g("k_rev") * d],["dio","DIO: rotacja zapasów","dni",g("k_inv") / g("k_cogs") * d],["dpo","DPO: rotacja zobowiązań","dni",g("k_ap") / g("k_cogs") * d],
        ["ccc","Cykl konwersji gotówki","dni",g("k_ar") / g("k_rev") * d + g("k_inv") / g("k_cogs") * d - g("k_ap") / g("k_cogs") * d],["cr","Płynność bieżąca","x",g("k_ca") / g("k_cl")],["qr","Płynność szybka","x",(g("k_ca") - g("k_inv")) / g("k_cl")],
        ["nd","Dług netto / EBITDA","x",(g("k_debt") - g("k_cash")) / (g("k_ebitda") * ann)],["roe","ROE (rocznie)","%",g("k_net") * ann / g("k_eq") * 100],["roa","ROA (rocznie)","%",g("k_net") * ann / g("k_ta") * 100],["ic","Pokrycie odsetek EBITDA","x",g("k_ebitda") / g("k_int")]];
      const status = (k, v) => { const [op, t] = s.tg[k] || DEF[k]; if (!isFinite(v)) return ""; const ok = op === ">=" ? v >= t : v <= t; const near = op === ">=" ? v >= t * .85 : v <= t * 1.15; return ok ? "good" : near ? "warn" : "bad"; };
      const u = (v, unit) => unit === "%" ? fmt(v, 1) + "%" : unit === "dni" ? fmt(v, 0) + " dni" : fmt(v, 2) + "×";
      const bad = K.filter(([k, , , v]) => status(k, v) === "bad");
      res.innerHTML = `<div class="kpis">${K.map(([k, l, unit, v]) => kpi(l, u(v, unit), `cel ${(s.tg[k] || DEF[k])[0] === ">=" ? "≥" : "≤"} ${fmt((s.tg[k] || DEF[k])[1], unit === "x" ? 1 : 0)}${unit === "%" ? "%" : unit === "dni" ? " dni" : "×"}`, status(k, v))).join("")}</div>
        <div class="comment">${bad.length ? `<p>Poniżej celu: ${bad.map(([, l]) => l).join(", ")}.</p>` : "<p>Wszystkie wskaźniki mieszczą się w celach.</p>"}<p>Cykl konwersji gotówki ${fmt(K[6][3], 0)} dni oznacza, że tyle dni firma finansuje działalność operacyjną. Skrócenie go o 10 dni uwolni około ${fmtZl(g("k_rev") / d * 10, 0)} gotówki.</p></div>
        <details class="info"><summary style="cursor:pointer;font-weight:600;color:var(--ink)">Ustaw własne cele (zapamiętam je)</summary><div class="row" style="margin-top:10px">${K.map(([k, l, unit]) => { const [op, t] = s.tg[k] || DEF[k]; return `<div class="field" style="flex:1 1 160px"><label for="tg_${k}">${esc(l)} ${op === ">=" ? "≥" : "≤"}</label><input id="tg_${k}" data-tg="${k}" data-op="${op}" value="${fmt(t, unit === "x" ? 1 : 0)}"></div>`; }).join("")}</div></details>`;
      res.append(exportBar("wskazniki-kpi", () => [["Wskaźnik","Wartość","Jednostka","Cel","Status"], ...K.map(([k, l, unit, v]) => [l, isFinite(v) ? +v.toFixed(2) : "", unit, (s.tg[k] || DEF[k]).join(" "), {good:"OK", warn:"blisko celu", bad:"poniżej celu"}[status(k, v)] || ""])]));
      res.querySelectorAll("[data-tg]").forEach(el => el.addEventListener("change", () => { const v = parseNum(el.value); if (isFinite(v)) { s.tg[el.dataset.tg] = [el.dataset.op, v]; persist(); toast("Zapamiętano cel."); run(); } }));
      markUse("cfo-kpi");
    }
    liveForm(root, s, F.map(f => f[0]), run);
  }});

/* ——————————————— UZGODNIENIA ——————————————— */
const EX_RA = "Data;Numer;Kwota\n02.09.2026;FV/2026/08/114;23 400,00\n05.09.2026;FV/2026/08/131;11 250,00\n09.09.2026;FV/2026/09/007;8 610,00\n12.09.2026;FV/2026/09/019;15 990,00\n18.09.2026;FV/2026/09/044;4 305,00\n26.09.2026;FV/2026/09/061;27 060,00\n29.09.2026;FV/2026/09/070;6 150,00";
const EX_RB = "Data;Numer;Kwota\n02.09.2026;FV/2026/08/114;23 400,00\n05.09.2026;FV/2026/08/131;11 250,00\n10.09.2026;FV/2026/09/007;8 616,15\n12.09.2026;FV/2026/09/019;15 990,00\n12.09.2026;FV/2026/09/019;15 990,00\n19.09.2026;przelew 44;4 305,00\n30.09.2026;FV/2026/09/072;1 845,00";
reg({id:"ap-recon", a:"ap", kind:"data", t:"Pomoc w uzgodnieniach", min:35, d:"Dopasowuje dwa zestawienia (księgi vs kontrahent lub bank) po numerze, kwocie i dacie. Wskazuje różnice i przyczyny.",
  render(root, s){
    const {form, res} = calcShell(root, "");
    const A = dataField({id:"r_a", label:"Zestawienie A: nasze księgi (data; numer; kwota)", ex:EX_RA, value:s.a, onChange:v => { s.a = v; persist(); run(); }});
    const B = dataField({id:"r_b", label:"Zestawienie B: kontrahent lub wyciąg bankowy", ex:EX_RB, value:s.b, onChange:v => { s.b = v; persist(); run(); }});
    form.append(A, B, h(`<div class="row">${inp("r_days", "Tolerancja dat (dni)", "5")}${inp("r_tol", "Tolerancja kwoty (zł)", "0,01")}</div>`), h(`<label class="lbl-s" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="r_neg"> Odwróć znak w zestawieniu B (np. Wn/Ma u kontrahenta)</label>`));
    const norm = x => String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const rd = t => { const {head, rows} = parseTable(t); const iD = findCol(head, [/dat/], 0), iN = findCol(head, [/num|nr|dok|faktur|tytu|opis/], 1), iK = findCol(head, [/kwot|wart|saldo|amount|brutto/], 2);
      return rows.filter(r => isNum(r[iK])).map((r, i) => ({i, d: parseDate(r[iD]), n: r[iN] || "", nn: norm(r[iN]), k: parseNum(r[iK])})); };
    function run(){
      const a = rd(A.get()), b = rd(B.get()); if ($("#r_neg", root).checked) b.forEach(x => x.k = -x.k);
      if (!a.length || !b.length) { res.innerHTML = `<div class="empty">Wklej oba zestawienia.</div>`; return; }
      const tol = num(root, "r_tol", .01), dt = num(root, "r_days", 5);
      const used = new Set(), pairs = [], diffs = [];
      const eq = (x, y) => Math.abs(x - y) <= tol + 1e-9;
      const take = (x, cond, how) => { const j = b.findIndex(y => !used.has(y.i) && cond(x, y)); if (j < 0) return false; used.add(b[j].i); pairs.push({x, y: b[j], how}); return true; };
      const left = a.filter(x => !take(x, (x, y) => x.nn && x.nn === y.nn && eq(x.k, y.k), "numer i kwota"));
      const left2 = left.filter(x => !take(x, (x, y) => eq(x.k, y.k) && x.d && y.d && Math.abs(dayDiff(x.d, y.d)) <= dt, "kwota i data"));
      const left3 = left2.filter(x => { const j = b.findIndex(y => !used.has(y.i) && x.nn && x.nn === y.nn); if (j < 0) return true; used.add(b[j].i); diffs.push({x, y: b[j]}); return false; });
      const onlyB = b.filter(y => !used.has(y.i));
      const dupB = b.filter((y, i) => b.findIndex(z => z.nn === y.nn && eq(z.k, y.k)) !== i && y.nn);
      const sa = a.reduce((t, x) => t + x.k, 0), sb = b.reduce((t, x) => t + x.k, 0);
      const monthEnd = d => d && d.getDate() >= new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - 3;
      const rows = [
        ...diffs.map(({x, y}) => { const d = y.k - x.k, rel = Math.abs(d / x.k); return ["różnica kwoty", fmtDate(x.d), esc(x.n), fmt(x.k, 2), fmt(y.k, 2), fmt(d, 2), rel < .01 ? "różnica kursowa lub zaokrąglenie" : "błędna kwota na fakturze lub korekcie", rel < .01 ? "Ująć różnicę kursową / zaokrąglenie" : "Wyjaśnić z kontrahentem, poprosić o fakturę korygującą"]; }),
        ...left3.map(x => ["tylko u nas", fmtDate(x.d), esc(x.n), fmt(x.k, 2), "–", fmt(-x.k, 2), monthEnd(x.d) ? "dokument z końca okresu, u kontrahenta w następnym miesiącu" : "brak dokumentu u kontrahenta", "Wysłać kopię dokumentu, potwierdzić ujęcie"]),
        ...onlyB.map(y => { const dup = dupB.includes(y); return ["tylko w B", fmtDate(y.d), esc(y.n), "–", fmt(y.k, 2), fmt(y.k, 2), dup ? "możliwy duplikat w zestawieniu B" : monthEnd(y.d) ? "płatność lub dokument w drodze (koniec okresu)" : "brak dokumentu w naszych księgach", dup ? "Poprosić kontrahenta o korektę duplikatu" : "Sprawdzić wpływ dokumentu (KSeF), zaksięgować lub wyjaśnić"]; })];
      res.innerHTML = `<div class="kpis">${kpi("Saldo A", fmt(sa, 2))}${kpi("Saldo B", fmt(sb, 2))}${kpi("Różnica", fmt(sb - sa, 2), "", Math.abs(sb - sa) <= tol ? "good" : "bad")}${kpi("Dopasowane", pairs.length + " / " + a.length)}${kpi("Do wyjaśnienia", rows.length, "", rows.length ? "warn" : "good")}</div>
        <div class="comment"><p>${rows.length ? `Różnica sald ${fmtZl(sb - sa)} wynika z ${rows.length} ${rows.length === 1 ? "pozycji" : "pozycji"} opisanych poniżej. Suma różnic w tabeli: ${fmtZl(rows.reduce((t, r) => t + parseNum(r[5]), 0))}.` : "Zestawienia są zgodne."}</p>${pairs.filter(p => p.how === "kwota i data").length ? `<p>${pairs.filter(p => p.how === "kwota i data").length} pozycji dopasowałem tylko po kwocie i dacie (inny opis). Sprawdź je na liście dopasowań.</p>` : ""}</div>
        ${rows.length ? tableHTML([{l:"Status"},{l:"Data"},{l:"Numer"},{l:"Kwota A",n:1},{l:"Kwota B",n:1},{l:"Różnica",n:1},{l:"Prawdopodobna przyczyna"},{l:"Działanie"}], rows) : ""}
        <details><summary style="cursor:pointer;font-weight:600">Dopasowane pozycje (${pairs.length})</summary>${tableHTML([{l:"Numer A"},{l:"Numer B"},{l:"Kwota",n:1},{l:"Dopasowano po"}], pairs.map(p => [esc(p.x.n), esc(p.y.n), fmt(p.x.k, 2), p.how]))}</details>`;
      res.append(exportBar("uzgodnienie", () => [["Status","Data","Numer","Kwota A","Kwota B","Różnica","Przyczyna","Działanie"], ...rows.map(r => r.map(c => String(c).replace(/&amp;/g, "&")))]));
      markUse("ap-recon");
    }
    ["r_days","r_tol"].forEach(id => $("#" + id, root).addEventListener("input", run)); $("#r_neg", root).addEventListener("change", run);
    run();
  }});

/* ——————————————— WYKRYWANIE ANOMALII (uczy się wyjątków) ——————————————— */
const EX_AN = (() => { const v = ["TransLog S.A.","Hurtownia Delta","Biuro Serwis","Energa Obrót","Papiernik sp. z o.o.","IT Partner","Catering Smak","Kancelaria Lex"];
  const acc = i => `PL${String(20 + i * 7)}1020102600001234567${i}${i}`; const rows = ["Data;Kontrahent;Numer;Kwota;Rachunek"]; let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 44; i++) { let d = new Date(2026, 7, 3 + Math.floor(rnd() * 26)); while (!isWorkday(d)) d = addDays(d, 1); const k = Math.floor(rnd() * v.length); rows.push(`${fmtDate(d)};${v[k]};FV/${100 + i};${fmt(Math.round(250 + Math.pow(rnd(), 2) * 7800) + Math.round(rnd() * 99) / 100, 2)};${acc(k)}`); }
  rows.push(`17.08.2026;Nowy Dostawca Consulting;FV/901;48 000,00;PL55109010140000071219812874`, `18.08.2026;IT Partner;FV/902;9 950,00;${acc(5)}`, `24.08.2026;TransLog S.A.;FV/903;12 480,00;${acc(0)}`, `24.08.2026;TransLog S.A.;FV/903;12 480,00;${acc(0)}`, `22.08.2026;Catering Smak;FV/904;1 870,00;${acc(6)}`, `26.08.2026;Kancelaria Lex;FV/905;6 150,00;${acc(0)}`);
  return rows.join("\n"); })();
const BENF = [1,2,3,4,5,6,7,8,9].map(d => Math.log10(1 + 1 / d));
reg({id:"aud-anom", a:"aud", kind:"data", nw:true, t:"Wykrywanie anomalii", min:40, d:"Duplikaty, kwoty tuż pod progiem, weekendy, okrągłe kwoty, nowi dostawcy, wspólne rachunki i test Benforda.",
  render(root, s){
    const {form, res} = calcShell(root, "");
    const df = dataField({id:"an_data", label:"Transakcje: data; kontrahent; numer; kwota; rachunek (nagłówek pomaga dopasować kolumny)", ex:EX_AN, value:s.data, onChange:v => { s.data = v; persist(); run(); }});
    form.append(df, h(`<div>${inp("an_thr", "Progi akceptacji (zł, oddziel średnikiem)", s.thr ?? "10 000; 50 000")}</div>`), h(`<div class="info">Pozycję, która nie jest problemem, oznacz „Normalne”. Zapamiętam wyjątek (kontrahent + reguła) i nie pokażę go ponownie.</div>`));
    function run(){
      s.thr = val(root, "an_thr"); persist();
      const {head, rows} = parseTable(df.get());
      const iD = findCol(head, [/dat/], 0), iV = findCol(head, [/kontrah|dostaw|odbior|nazwa|vendor/], 1), iN = findCol(head, [/num|nr|dok|faktur/], 2), iK = findCol(head, [/kwot|wart|brutto|amount/], 3), iR = findCol(head, [/rachun|konto|iban|nrb/], head && head.length > 4 ? 4 : -1);
      const T = rows.filter(r => isNum(r[iK])).map((r, i) => ({i, d: parseDate(r[iD]), v: r[iV] || "", n: r[iN] || "", k: parseNum(r[iK]), acc: iR >= 0 ? (r[iR] || "").replace(/\s/g, "") : ""}));
      if (T.length < 5) { res.innerHTML = `<div class="empty">Wklej co najmniej 5 transakcji.</div>`; return; }
      const thr = val(root, "an_thr").split(/[;|]/).map(parseNum).filter(isFinite);
      const cnt = {}, accV = {}; T.forEach(t => { cnt[t.v] = (cnt[t.v] || 0) + 1; if (t.acc) (accV[t.acc] ||= new Set()).add(t.v); });
      const amts = T.map(t => Math.abs(t.k)), p90 = stat.quantile(amts, .9), q1 = stat.quantile(amts, .25), q3 = stat.quantile(amts, .75), out = q3 + 3 * (q3 - q1);
      const flags = T.map(t => { const f = [];
        if (T.some(u => u !== t && u.v === t.v && Math.abs(u.k - t.k) < .005 && (u.n === t.n || !t.n))) f.push("duplikat");
        if (thr.some(x => t.k >= x * .95 && t.k < x)) f.push("tuż pod progiem");
        if (t.d && !isWorkday(t.d)) f.push(isHoliday(t.d) ? "święto" : "weekend");
        if (Math.abs(t.k) >= 1000 && Math.abs(t.k) % 1000 === 0) f.push("okrągła kwota");
        if (cnt[t.v] === 1 && Math.abs(t.k) > p90) f.push("nowy kontrahent, duża kwota");
        if (Math.abs(t.k) > out) f.push("kwota odstająca");
        if (t.acc && accV[t.acc].size > 1) f.push("rachunek wielu kontrahentów");
        const shown = f.filter(r => !M.learn.anomOk[t.v + "|" + r]);
        return {t, f: shown, skipped: f.length - shown.length}; });
      const hits = flags.filter(x => x.f.length), skipped = flags.reduce((a, x) => a + x.skipped, 0);
      const lvl = x => x.f.includes("duplikat") || x.f.includes("rachunek wielu kontrahentów") || x.f.length >= 2 ? "wysokie" : "średnie";
      hits.sort((a, b) => (lvl(a) === "wysokie" ? 0 : 1) - (lvl(b) === "wysokie" ? 0 : 1) || b.t.k - a.t.k);
      const fd = T.map(t => String(Math.abs(t.k)).replace(/^[0.]+/, "")[0]).filter(c => c >= "1" && c <= "9").map(Number);
      const obs = [1,2,3,4,5,6,7,8,9].map(d => fd.filter(x => x === d).length / fd.length), mad = stat.mean(obs.map((o, i) => Math.abs(o - BENF[i])));
      const conf = mad < .006 ? ["good","zgodność bardzo dobra"] : mad < .012 ? ["good","zgodność akceptowalna"] : mad < .015 ? ["warn","zgodność na granicy"] : ["bad","brak zgodności: zbadaj głębiej"];
      const byRule = {}; hits.forEach(x => x.f.forEach(r => byRule[r] = (byRule[r] || 0) + 1));
      res.innerHTML = `<div class="kpis">${kpi("Transakcji", T.length)}${kpi("Oznaczonych", hits.length, pct(hits.length / T.length) + " populacji", hits.length ? "warn" : "good")}${kpi("Ryzyko wysokie", hits.filter(x => lvl(x) === "wysokie").length, "", hits.some(x => lvl(x) === "wysokie") ? "bad" : "good")}${kpi("Test Benforda (MAD)", fmt(mad, 4), conf[1], conf[0])}${skipped ? kpi("Znane wyjątki", skipped, "pominięte dzięki nauce", "") : ""}</div>
        <div class="comment"><p>${Object.keys(byRule).length ? "Wyniki według reguł: " + Object.entries(byRule).map(([r, n]) => `${r}: ${n}`).join(", ") + "." : "Nie znaleziono podejrzanych transakcji."}</p><p>${fd.length < 50 ? "Test Benforda jest wiarygodny dopiero od około 50–100 transakcji; traktuj go poglądowo." : "Test Benforda porównuje rozkład pierwszych cyfr kwot z rozkładem naturalnym."}</p></div>
        ${hits.length ? `<div class="tbl"><table><thead><tr><th>Ryzyko</th><th>Data</th><th>Kontrahent</th><th>Numer</th><th class="n">Kwota</th><th>Reguły</th><th class="no-print"></th></tr></thead><tbody>${hits.map(x => `<tr class="${lvl(x) === "wysokie" ? "flag" : ""}"><td><span class="pill ${lvl(x) === "wysokie" ? "bad" : "warn"}">${lvl(x)}</span></td><td>${fmtDate(x.t.d)}</td><td>${esc(x.t.v)}</td><td>${esc(x.t.n)}</td><td class="n">${fmt(x.t.k, 2)}</td><td>${x.f.map(r => `<span class="pill">${r}</span>`).join(" ")}</td><td class="no-print"><button class="btn sm ghost" type="button" data-ok="${x.t.i}" title="Zapamiętaj jako normalne">Normalne</button></td></tr>`).join("")}</tbody></table></div>` : ""}
        <h3 style="font-size:15px">Rozkład pierwszych cyfr (Benford)</h3>
        ${lineChart({labels:["1","2","3","4","5","6","7","8","9"], series:[{name:"Oczekiwany (Benford)", values:BENF.map(x => x * 100), dash:true, color:"var(--muted)"}, {name:"Twoje dane", values:obs.map(x => x * 100)}], hh:200})}`;
      res.append(exportBar("anomalie", () => [["Ryzyko","Data","Kontrahent","Numer","Kwota","Reguły"], ...hits.map(x => [lvl(x), fmtDate(x.t.d), x.t.v, x.t.n, x.t.k, x.f.join(", ")])]));
      res.querySelectorAll("[data-ok]").forEach(b => b.addEventListener("click", () => { const x = flags.find(f => f.t.i === +b.dataset.ok); x.f.forEach(r => M.learn.anomOk[x.t.v + "|" + r] = true); persist(); toast(`Zapamiętano wyjątek dla: ${x.t.v}.`); run(); }));
      markUse("aud-anom");
    }
    $("#an_thr", root).addEventListener("input", run);
    run();
  }});

/* ——————————————— ABC: sprzedaż i dostawcy ——————————————— */
function renderABC(id, cfg){
  return (root, s) => {
    const {form, res} = calcShell(root, "");
    const df = dataField({id:"abc_data", label: cfg.label, ex: cfg.ex, value: s.data, onChange: v => { s.data = v; persist(); run(); }});
    form.append(df, h(`<div class="row">${inp("abc_a", "Granica klasy A (% skumulowane)", "80")}${inp("abc_b", "Granica klasy B", "95")}</div>`));
    function run(){
      const {head, rows} = parseTable(df.get()); const d = rows.filter(r => r.length >= 2 && isNum(r[1])).map(r => ({n: r[0], v: parseNum(r[1]), x: r.length > 2 && isNum(r[2]) ? parseNum(r[2]) : null})).sort((a, b) => b.v - a.v);
      if (d.length < 3) { res.innerHTML = `<div class="empty">Wklej co najmniej 3 pozycje: nazwa i wartość.</div>`; return; }
      const tot = d.reduce((a, x) => a + x.v, 0), ca = num(root, "abc_a", 80) / 100, cb = num(root, "abc_b", 95) / 100; let cum = 0;
      d.forEach(x => { const prev = cum; cum += x.v / tot; x.sh = x.v / tot; x.cum = cum; x.cls = prev < ca ? "A" : prev < cb ? "B" : "C"; });
      const hhi = d.reduce((a, x) => a + (x.sh * 100) ** 2, 0), cA = d.filter(x => x.cls === "A"), top10 = d.slice(0, Math.max(1, Math.ceil(d.length * .1))).reduce((a, x) => a + x.sh, 0);
      const xName = head && head[2] ? head[2] : cfg.xName, hasX = d.some(x => x.x != null);
      const wx = hasX ? d.reduce((a, x) => a + (x.x ?? 0) * x.v, 0) / d.filter(x => x.x != null).reduce((a, x) => a + x.v, 0) : null;
      const cm = cfg.comment({d, cA, top10, hhi, wx, hasX, tot});
      res.innerHTML = `<div class="kpis">${kpi("Suma", shortNum(tot))}${kpi("Pozycji w klasie A", `${cA.length} z ${d.length}`, pct(cA.length / d.length) + " pozycji")}${kpi("Największy udział", pct(d[0].sh), esc(d[0].n), d[0].sh > .2 ? "warn" : "")}${kpi("Top 10% pozycji", pct(top10))}${kpi("Koncentracja HHI", fmt(hhi, 0), hhi > 2500 ? "wysoka" : hhi > 1500 ? "umiarkowana" : "niska", hhi > 2500 ? "bad" : hhi > 1500 ? "warn" : "good")}${hasX ? kpi(cfg.xKpi, fmt(wx, 1) + cfg.xUnit, "średnia ważona") : ""}</div>
        ${hBars(d.slice(0, 15).map(x => ({l: x.n, v: x.v, col: x.cls === "A" ? "var(--accent)" : x.cls === "B" ? "var(--learn)" : "var(--muted)"})))}
        <div class="comment">${cm.map(c => `<p>${c}</p>`).join("")}</div>
        ${tableHTML([{l:"#"},{l:"Nazwa"},{l:"Wartość",n:1},{l:"Udział",n:1},{l:"Skumulowany",n:1},{l:"Klasa"}, ...(hasX ? [{l: xName, n:1}] : [])], d.map((x, i) => [i + 1, esc(x.n), fmt(x.v), pct(x.sh), pct(x.cum), `<span class="pill ${x.cls === "A" ? "good" : x.cls === "B" ? "warn" : ""}">${x.cls}</span>`, ...(hasX ? [x.x == null ? "–" : fmt(x.x, 1) + cfg.xUnit] : [])]))}`;
      res.append(exportBar(id, () => [["Nazwa","Wartość","Udział","Skumulowany","Klasa", ...(hasX ? [xName] : [])], ...d.map(x => [x.n, x.v, (x.sh * 100).toFixed(2).replace(".", ","), (x.cum * 100).toFixed(2).replace(".", ","), x.cls, ...(hasX ? [x.x ?? ""] : [])])]));
      markUse(id);
    }
    ["abc_a","abc_b"].forEach(i => $("#" + i, root).addEventListener("input", run));
    run();
  };
}
reg({id:"perf-sales", a:"perf", kind:"data", t:"Analiza sprzedaży", min:30, d:"Analiza ABC (Pareto) klientów lub produktów, koncentracja HHI i rentowność, jeśli podasz marżę.",
  render: renderABC("perf-sales", {label:"Klient lub produkt; sprzedaż (opcjonalnie: marża %)", xName:"Marża %", xKpi:"Marża średnia", xUnit:"%",
    ex:"Klient;Sprzedaż;Marża %\nAlfa Retail;9 800 000;18\nBeta Dystrybucja;7 450 000;22\nGamma Sklepy;5 900 000;15\nDelta Hurt;4 100 000;24\nOmega Export GmbH;3 600 000;28\nSigma;2 300 000;31\nKappa;1 900 000;12\nLambda;1 400 000;35\nTheta;980 000;33\nZeta;720 000;9\nEpsilon;450 000;38\nJota;310 000;40",
    comment: ({d, cA, top10, hasX}) => { const c = [`${cA.length} ${cA.length === 1 ? "klient generuje" : "klientów generuje"} około 80% sprzedaży. Największy odbiorca (${esc(d[0].n)}) to ${pct(d[0].sh)} obrotów${d[0].sh > .2 ? ": to istotne ryzyko koncentracji, rozważ zabezpieczenie należności i dywersyfikację" : ""}.`];
      if (hasX) { const low = d.filter(x => x.cls === "A" && x.x != null && x.x < 16); const hi = d.filter(x => x.cls !== "A" && x.x != null && x.x > 30); if (low.length) c.push(`Duzi klienci z niską marżą: ${low.map(x => esc(x.n) + " (" + fmt(x.x, 0) + "%)").join(", ")}. Przejrzyj rabaty i warunki handlowe.`); if (hi.length) c.push(`Mniejsi klienci z wysoką marżą (potencjał wzrostu): ${hi.map(x => esc(x.n)).join(", ")}.`); }
      c.push("Klasa A: indywidualna obsługa i monitoring należności. Klasa B: programy rozwoju. Klasa C: automatyzacja obsługi i przegląd opłacalności."); return c; }})});
reg({id:"perf-vendor", a:"perf", kind:"data", t:"Zarządzanie dostawcami", min:25, d:"Segmentacja ABC wydatków, koncentracja i terminy płatności. Wskazuje dostawców do negocjacji.",
  render: renderABC("perf-vendor", {label:"Dostawca; wydatki (opcjonalnie: termin płatności w dniach)", xName:"Termin płatności", xKpi:"Średni termin płatności", xUnit:" dni",
    ex:"Dostawca;Wydatki;Termin (dni)\nStalex;6 200 000;30\nChemBud;3 900 000;14\nTransLog S.A.;2 750 000;21\nEnerga Obrót;1 600 000;14\nPakTech;1 350 000;45\nIT Partner;820 000;30\nBiuro Serwis;410 000;7\nCatering Smak;160 000;7\nKancelaria Lex;150 000;14",
    comment: ({d, cA, wx, hasX}) => { const c = [`${cA.length} dostawców odpowiada za około 80% wydatków. Tam negocjacje dają największy efekt.`];
      if (d[0].sh > .2) c.push(`Uzależnienie od dostawcy ${esc(d[0].n)} (${pct(d[0].sh)} wydatków). Rozważ drugie źródło dostaw i umowę ramową z gwarancją ceny.`);
      if (hasX) { const neg = d.filter(x => x.cls === "A" && x.x != null && x.x < wx); if (neg.length) c.push(`Kandydaci do wydłużenia terminu płatności (duży wolumen, termin poniżej średniej ${fmt(wx, 0)} dni): ${neg.map(x => `${esc(x.n)} (${fmt(x.x, 0)} dni)`).join(", ")}. Wydłużenie terminu o 15 dni uwolni około ${fmtZl(neg.reduce((a, x) => a + x.v, 0) / 365 * 15, 0)} gotówki.`); }
      c.push("Pamiętaj: w transakcjach handlowych termin płatności co do zasady nie może przekraczać 60 dni (dłuższy tylko wyjątkowo i gdy nie jest rażąco nieuczciwy wobec wierzyciela); ze szczególnymi zasadami dla dużych firm i podmiotów publicznych."); return c; }})});

/* ——————————————— DOBÓR PRÓBY DO TESTÓW KONTROLI ——————————————— */
const SAMPLE = {"roczna":[1,1],"kwartalna":[2,2],"miesięczna":[2,5],"tygodniowa":[5,15],"dzienna":[20,40],"wiele razy dziennie":[25,60]};
reg({id:"aud-test", a:"aud", kind:"calc", t:"Testowanie kontroli", min:30, d:"Wielkość próby według częstotliwości kontroli, losowanie próby z ziarnem i arkusz testu do eksportu.",
  render(root, s){
    const {form, res} = calcShell(root, `
      ${inp("t_ctl", "Testowana kontrola", "Akceptacja przelewów powyżej 50 000 zł przez dwie osoby")}
      <div class="row">${sel("t_freq", "Częstotliwość kontroli", Object.keys(SAMPLE), "wiele razy dziennie")}${sel("t_risk", "Ryzyko", ["niższe","wyższe"], "wyższe")}</div>
      <div class="row">${inp("t_pop", "Liczebność populacji", "1 240")}${inp("t_seed", "Ziarno losowania", String(20260925), "To samo ziarno da tę samą próbę (powtarzalność).")}</div>
      <div class="field"><label for="t_ids">Albo lista identyfikatorów populacji (po jednym w wierszu)</label><textarea id="t_ids" class="data" style="min-height:70px" placeholder="PRZ/0001&#10;PRZ/0002"></textarea></div>
      <div class="field"><label for="t_attr">Atrybuty do sprawdzenia (po jednym w wierszu)</label><textarea id="t_attr">Są dwa podpisy w systemie bankowym\nAkceptujący mają uprawnienia zgodne z macierzą\nPłatność zgodna z fakturą i zamówieniem\nRachunek odbiorcy na białej liście VAT</textarea></div>`);
    function run(){
      const [lo, hi] = SAMPLE[val(root, "t_freq")], risk = val(root, "t_risk"), N = Math.max(1, Math.round(num(root, "t_pop", 100)));
      const ids = val(root, "t_ids").split("\n").map(x => x.trim()).filter(Boolean), pop = ids.length || N, n = Math.min(pop, risk === "wyższe" ? hi : lo);
      let seed = Math.round(num(root, "t_seed", 1)) % 2147483647 || 1; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
      const idx = [...Array(pop).keys()]; for (let i = pop - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const pick = idx.slice(0, n).sort((a, b) => a - b).map(i => ids.length ? ids[i] : "poz. " + (i + 1));
      const attrs = val(root, "t_attr").split("\n").map(x => x.trim()).filter(Boolean);
      res.innerHTML = `<div class="kpis">${kpi("Wielkość próby", n, `zakres dla tej częstotliwości: ${lo}–${hi}`)}${kpi("Populacja", fmt(pop))}${kpi("Dopuszczalne odchylenia", n >= 25 ? "0–1" : "0", "przy większej liczbie: kontrola nieskuteczna")}</div>
        <div class="comment"><p>Test projektu: potwierdź przejściem (walkthrough) jednej transakcji, że kontrola „${esc(val(root, "t_ctl"))}” jest zaprojektowana tak, by zapobiegać ryzyku lub je wykrywać. Test działania: sprawdź ${n} ${n === 1 ? "wylosowaną pozycję" : "wylosowanych pozycji"} pod kątem ${attrs.length} atrybutów.</p><p>Jeśli znajdziesz odchylenie, ustal przyczynę. Gdy to błąd systemowy, rozszerz próbę lub uznaj kontrolę za nieskuteczną i opisz ustalenie (moduł „Dokumentowanie ustaleń”).</p></div>
        ${tableHTML([{l:"#"},{l:"Pozycja"}, ...attrs.map((a, i) => ({l: "A" + (i + 1)})), {l:"Wynik"},{l:"Uwagi"}], pick.map((p, i) => [i + 1, esc(p), ...attrs.map(() => "☐"), "", ""]))}
        <div class="info">${attrs.map((a, i) => `<b>A${i + 1}</b>: ${esc(a)}`).join("<br>")}</div>`;
      res.append(exportBar("test-kontroli", () => [["Kontrola", val(root, "t_ctl")], ["Ziarno", val(root, "t_seed")], [], ["#","Pozycja", ...attrs, "Wynik","Uwagi"], ...pick.map((p, i) => [i + 1, p, ...attrs.map(() => ""), "", ""])]));
      markUse("aud-test");
    }
    liveForm(root, s, ["t_ctl","t_freq","t_risk","t_pop","t_seed","t_ids","t_attr"], run);
  }});

/* ——————————————— WALIDATOR FAKTURY I KONTRAHENTA ——————————————— */
function nipOk(v){ const d = String(v).replace(/\D/g, ""); if (d.length !== 10) return false; const w = [6,5,7,2,3,4,5,6,7]; const c = w.reduce((a, x, i) => a + x * +d[i], 0) % 11; return c !== 10 && c === +d[9]; }
function regonOk(v){ const d = String(v).replace(/\D/g, ""); const chk = (s, w) => { const c = w.reduce((a, x, i) => a + x * +s[i], 0) % 11 % 10; return c === +s[w.length]; };
  if (d.length === 9) return chk(d, [8,9,2,3,4,5,6,7]); if (d.length === 14) return chk(d, [2,4,8,5,0,9,7,3,6,1,2,4,8]) && chk(d.slice(0, 9), [8,9,2,3,4,5,6,7]); return false; }
function ibanOk(v){ let s = String(v).replace(/\s/g, "").toUpperCase(); if (/^\d{26}$/.test(s)) s = "PL" + s; if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false; const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, c => c.charCodeAt(0) - 55); let m = 0; for (const ch of r) m = (m * 10 + +ch) % 97; return m === 1; }
reg({id:"ap-invoice", a:"ap", kind:"calc", t:"Walidator faktury", min:20, d:"Sprawdza NIP, REGON i numer rachunku, przelicza VAT pozycji, termin płatności, split payment i format numeru KSeF.",
  render(root, s){
    const {form, res} = calcShell(root, `
      <div class="row">${inp("i_nip", "NIP sprzedawcy", "5261040828")}${inp("i_regon", "REGON (opcjonalnie)", "")}</div>
      ${inp("i_acc", "Rachunek bankowy (NRB lub IBAN)", "PL61 1090 1014 0000 0712 1981 2874")}
      ${inp("i_ksef", "Numer KSeF (opcjonalnie)", "", "Format: NIP-RRRRMMDD-12 znaków-2 znaki")}
      <div class="field"><label for="i_lines">Pozycje: netto; stawka VAT (%, zw lub np)</label><textarea id="i_lines" class="data" style="min-height:90px">12 000,00;23\n3 500,00;8\n800,00;zw</textarea></div>
      <div class="row">${inp("i_vat", "VAT z faktury", "3 040,00")}${inp("i_gross", "Brutto z faktury", "19 340,00")}</div>
      <div class="row">${inp("i_date", "Data wystawienia", isoDate(today()), "", 'type="date"')}${inp("i_days", "Termin płatności (dni)", "30")}</div>
      <label class="lbl-s" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="i_z15"> Towary lub usługi z załącznika nr 15 do ustawy o VAT</label>`);
    function run(){
      const nip = val(root, "i_nip"), rg = val(root, "i_regon").trim(), acc = val(root, "i_acc").trim(), ks = val(root, "i_ksef").trim();
      const lines = parseTable(val(root, "i_lines")).rows.filter(r => isNum(r[0])).map(r => { const net = parseNum(r[0]), rt = String(r[1] || "").trim().toLowerCase(); const rate = isNum(rt) ? parseNum(rt) / 100 : 0; return {net, rt: isNum(rt) ? fmt(parseNum(rt), 0) + "%" : rt || "?", vat: Math.round(net * rate * 100) / 100}; });
      const byRate = {}; lines.forEach(l => { const k = l.rt; byRate[k] ||= {net:0, vat:0}; byRate[k].net += l.net; byRate[k].vat += l.vat; });
      Object.values(byRate).forEach(b => { b.vat2 = Math.round(b.net * (parseNum(Object.keys(byRate).find(k => byRate[k] === b)) / 100 || 0) * 100) / 100; });
      const net = lines.reduce((a, l) => a + l.net, 0), vatL = lines.reduce((a, l) => a + l.vat, 0), vatR = Object.values(byRate).reduce((a, b) => a + b.vat2, 0), gross = net + vatR;
      const vD = parseNum(val(root, "i_vat")), gD = parseNum(val(root, "i_gross"));
      const dt = parseDate(val(root, "i_date")), due = dt ? addDays(dt, Math.round(num(root, "i_days", 0))) : null;
      const checks = [
        ["NIP sprzedawcy", nipOk(nip) ? ["good","poprawna suma kontrolna"] : ["bad","błędny NIP (suma kontrolna)"]],
        ...(rg ? [["REGON", regonOk(rg) ? ["good","poprawny"] : ["bad","błędna suma kontrolna"]]] : []),
        ["Rachunek bankowy", acc ? (ibanOk(acc) ? ["good","poprawna suma kontrolna IBAN/NRB"] : ["bad","błędny numer rachunku"]) : ["warn","nie podano"]],
        ...(ks ? [["Numer KSeF", /^\d{10}-\d{8}-[0-9A-F]{12}-[0-9A-F]{2}$/i.test(ks) ? (ks.slice(0, 10) === nip.replace(/\D/g, "") ? ["good","format poprawny, NIP zgodny"] : ["warn","format poprawny, ale NIP w numerze inny niż sprzedawcy"]) : ["bad","nieprawidłowy format"]]] : []),
        ["VAT", isFinite(vD) ? (Math.abs(vD - vatR) < .015 ? ["good","zgodny z przeliczeniem"] : ["bad",`różnica ${fmt(vD - vatR, 2)} zł (wyliczono ${fmt(vatR, 2)})`]) : ["warn","nie podano kwoty VAT"]],
        ["Brutto", isFinite(gD) ? (Math.abs(gD - gross) < .015 ? ["good","zgodne"] : ["bad",`różnica ${fmt(gD - gross, 2)} zł (wyliczono ${fmt(gross, 2)})`]) : ["warn","nie podano kwoty brutto"]],
        ["Mechanizm podzielonej płatności", $("#i_z15", root).checked && gross > 15000 ? ["warn","OBOWIĄZKOWY: brutto powyżej 15 000 zł i towary z zał. 15. Na fakturze musi być adnotacja „mechanizm podzielonej płatności”."] : ["good","nie jest obowiązkowy dla tych danych"]],
        ["Biała lista VAT", gross > 15000 ? ["warn","płatność powyżej 15 000 zł: sprawdź rachunek w wykazie podatników VAT w dniu przelewu, inaczej grozi brak kosztu podatkowego i solidarna odpowiedzialność."] : ["good","płatność nie przekracza 15 000 zł"]]];
      if (Math.abs(vatL - vatR) >= .01) checks.push(["Zaokrąglenia VAT", ["warn",`VAT liczony od pozycji (${fmt(vatL, 2)}) różni się od liczonego od sumy stawki (${fmt(vatR, 2)}). Obie metody są dopuszczalne, ale muszą być stosowane konsekwentnie.`]]);
      const bad = checks.filter(c => c[1][0] === "bad").length;
      res.innerHTML = `<div class="kpis">${kpi("Netto", fmt(net, 2))}${kpi("VAT (wyliczony)", fmt(vatR, 2))}${kpi("Brutto (wyliczone)", fmt(gross, 2))}${kpi("Termin płatności", due ? fmtDate(due) : "–", due ? `${DOW[due.getDay()]}${isWorkday(due) ? "" : ", dzień wolny"}` : "", due && dayDiff(today(), due) < 0 ? "bad" : "")}${kpi("Wynik kontroli", bad ? bad + " błędy" : "bez błędów", "", bad ? "bad" : "good")}</div>
        ${tableHTML([{l:"Sprawdzenie"},{l:"Wynik"}], checks.map(([l, [c, t]]) => [l, `<span class="pill ${c}">${c === "good" ? "OK" : c === "bad" ? "błąd" : "uwaga"}</span> ${esc(t)}`]))}
        <h3 style="font-size:15px">Podsumowanie według stawek</h3>${tableHTML([{l:"Stawka"},{l:"Netto",n:1},{l:"VAT",n:1},{l:"Brutto",n:1}], Object.entries(byRate).map(([k, b]) => [esc(k), fmt(b.net, 2), fmt(b.vat2, 2), fmt(b.net + b.vat2, 2)]))}
        <div class="info">Status w wykazie VAT i numer KSeF zweryfikujesz online: <a href="https://www.podatki.gov.pl/wykaz-podatnikow-vat-wyszukiwarka" target="_blank" rel="noopener">wykaz podatników VAT</a>. To narzędzie działa offline, więc sprawdza tylko poprawność formalną.</div>`;
      markUse("ap-invoice");
    }
    liveForm(root, s, ["i_nip","i_regon","i_acc","i_ksef","i_lines","i_vat","i_gross","i_date","i_days","i_z15"], run);
    $("#i_z15", root).addEventListener("change", run);
  }});

/* ——————————————— KALKULATOR FINANSISTY ——————————————— */
reg({id:"day-calc", a:"day", kind:"calc", t:"Kalkulator finansisty", min:10, d:"VAT netto/brutto, marża a narzut, zmiana procentowa, przeliczenie walut, dni robocze i terminy z polskimi świętami.",
  render(root, s){
    root.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">VAT</h3><div class="row">${inp("v_amt", "Kwota", "10 000")}${sel("v_rate", "Stawka", ["23","8","5","0"], "23")}</div>${sel("v_dir", "Podana kwota to", [["net","netto"],["gross","brutto"]], "net")}<div id="v_out" class="kpis"></div></section>
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">Marża i narzut</h3><div class="row">${inp("m_cost", "Koszt zakupu", "80")}${inp("m_price", "Cena sprzedaży", "100")}</div>${inp("m_target", "Albo docelowa marża % (policzę cenę)", "")}<div id="m_out" class="kpis"></div></section>
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">Zmiana procentowa</h3><div class="row">${inp("p_a", "Wartość poprzednia", "3 950 000")}${inp("p_b", "Wartość bieżąca", "4 200 000")}</div><div id="p_out" class="kpis"></div></section>
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">Przeliczenie walut</h3><div class="row">${inp("x_amt", "Kwota w walucie", "1 000")}${inp("x_rate", "Kurs (średni NBP)", P().eur)}</div><span class="hint">Do VAT i kosztów przyjmuje się zwykle kurs średni NBP z dnia roboczego poprzedzającego dzień powstania obowiązku lub poniesienia kosztu.</span><div id="x_out" class="kpis"></div></section>
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">Dni robocze</h3><div class="row">${inp("d_a", "Od", isoDate(today()), "", 'type="date"')}${inp("d_b", "Do", isoDate(addDays(today(), 30)), "", 'type="date"')}</div><div id="d_out" class="kpis"></div></section>
      <section class="stack ck-grp" style="padding:12px"><h3 style="background:none;border:0;padding:0">Termin</h3><div class="row">${inp("t_a", "Data początkowa", isoDate(today()), "", 'type="date"')}${inp("t_n", "Liczba dni", "14")}</div>${sel("t_k", "Rodzaj dni", [["cal","kalendarzowe (przesunięcie z dnia wolnego)"],["work","robocze"]], "cal")}<div id="t_out" class="kpis"></div></section></div>`;
    function run(){
      const a = num(root, "v_amt"), r = num(root, "v_rate") / 100, net = val(root, "v_dir") === "net" ? a : a / (1 + r);
      $("#v_out", root).innerHTML = kpi("Netto", fmt(net, 2)) + kpi("VAT", fmt(net * r, 2)) + kpi("Brutto", fmt(net * (1 + r), 2));
      const c = num(root, "m_cost"), tgt = parseNum(val(root, "m_target")); let p = num(root, "m_price"); if (isFinite(tgt) && tgt < 100) p = c / (1 - tgt / 100);
      $("#m_out", root).innerHTML = kpi("Cena", fmt(p, 2)) + kpi("Marża (od ceny)", pct((p - c) / p)) + kpi("Narzut (od kosztu)", pct((p - c) / c));
      const pa = num(root, "p_a"), pb = num(root, "p_b");
      $("#p_out", root).innerHTML = kpi("Zmiana", fmtPct(pb / pa - 1), "", pb >= pa ? "good" : "bad") + kpi("Różnica", fmt(pb - pa)) + kpi("Punkty procentowe", "wpisz % w polach");
      if (/%/.test(val(root, "p_a") + val(root, "p_b"))) $("#p_out", root).lastElementChild.outerHTML = kpi("Zmiana w p.p.", fmt(pb - pa, 2) + " p.p.");
      else $("#p_out", root).lastElementChild.remove();
      $("#x_out", root).innerHTML = kpi("W złotych", fmt(num(root, "x_amt") * num(root, "x_rate"), 2)) + kpi("Z PLN na walutę", fmt(num(root, "x_amt") / num(root, "x_rate"), 2));
      const da = parseDate(val(root, "d_a")), db = parseDate(val(root, "d_b"));
      if (da && db) { const hols = []; for (let x = da; x <= db; x = addDays(x, 1)) { const n = isHoliday(x); if (n && x.getDay() && x.getDay() !== 6) hols.push(`${fmtDate(x)} ${n}`); } $("#d_out", root).innerHTML = kpi("Dni robocze", workdaysBetween(da, db)) + kpi("Dni kalendarzowe", dayDiff(da, db) + 1) + (hols.length ? `<div class="kpi" style="grid-column:1/-1"><span>Święta w dni powszednie</span><small>${hols.join("<br>")}</small></div>` : ""); }
      const ta = parseDate(val(root, "t_a")), tn = Math.round(num(root, "t_n"));
      if (ta) { let end; if (val(root, "t_k") === "work") { end = ta; let k = 0; while (k < tn) { end = addDays(end, 1); if (isWorkday(end)) k++; } } else end = addDays(ta, tn); const sh = nextWorkday(end);
        $("#t_out", root).innerHTML = kpi("Termin", fmtDate(sh), DOW[sh.getDay()]) + (+sh !== +end ? kpi("Przesunięto z", fmtDate(end), (isHoliday(end) || "weekend") + " (art. 12 § 5 Ordynacji podatkowej, art. 115 KC)", "warn") : ""); }
      markUse("day-calc");
    }
    liveForm(root, s, ["v_amt","v_rate","v_dir","m_cost","m_price","m_target","p_a","p_b","x_amt","x_rate","d_a","d_b","t_a","t_n","t_k"], run);
  }});

/* ——————————————— KOREKTA SFORMUŁOWAŃ (reguły + Twoje reguły) ——————————————— */
const WORD_RULES = [
  ["w miare ok","na akceptowalnym poziomie"],["w miarę ok","na akceptowalnym poziomie"],["jest ok","jest zadowalający"],["w miare","w miarę"],["tak naprawdę","w rzeczywistości"],["póki co","obecnie"],["na dzień dzisiejszy","obecnie"],["w dniu dzisiejszym","dziś"],["w chwili obecnej","obecnie"],["na szybko","wstępnie"],["ogarnąć","uporządkować"],["dogadać się","uzgodnić"],["kasa","środki pieniężne"],["fajnie","korzystnie"],["bo","ponieważ"],["wg","według"],
  ["wogóle","w ogóle"],["narazie","na razie"],["napewno","na pewno"],["poprostu","po prostu"],["conajmniej","co najmniej"],["wkońcu","w końcu"],["przedewszystkim","przede wszystkim"],["niewiem","nie wiem"],["niema","nie ma"],["wziąść","wziąć"],["tyś.","tys."],
  ["sie","się"],["tez","też"],["wiec","więc"],["juz","już"],["moze","może"],["dzieki","dzięki"],["prosze","proszę"],["dziekuje","dziękuję"],["rowniez","również"],["poniewaz","ponieważ"],["ktory","który"],["ktora","która"],["ktore","które"],["ktorych","których"],
  ["bylo","było"],["byly","były"],["byl","był"],["spadly","spadły"],["spadl","spadł"],["wzrosly","wzrosły"],["wzrosl","wzrósł"],["planowalismy","planowaliśmy"],["przesuneli","przesunęli"],["zamowienia","zamówienia"],["zamowien","zamówień"],
  ["platnosc","płatność"],["platnosci","płatności"],["naleznosci","należności"],["zobowiazania","zobowiązania"],["sprzedaz","sprzedaż"],["sprzedazy","sprzedaży"],["budzet","budżet"],["budzetu","budżetu"],["zaleglosc","zaległość"],["miesiac","miesiąc"],["miesiacu","miesiącu"],["nizsze","niższe"],["nizszy","niższy"],["wyzsze","wyższe"],["wyzszy","wyższy"],["wplyw","wpływ"],["wplywy","wpływy"],["kwartal","kwartał"],["niz","niż"],["marza","marża"],["marzy","marży"],["wyniosla","wyniosła"],["wyniosl","wyniósł"],["wyniosly","wyniosły"],["budzecie","budżecie"],["zl","zł"]
];
reg({id:"day-wording", a:"day", kind:"calc", t:"Korekta sformułowań", min:8, d:"Poprawia polskie znaki, potoczne zwroty, spacje, interpunkcję i zapis kwot. Uczy się Twoich własnych reguł.",
  render(root, s){
    const {form, res} = calcShell(root, `<div class="field"><label for="w_in">Tekst do poprawy</label><textarea id="w_in" style="min-height:220px">W sierpniu przychody byly nizsze niz planowalismy bo klienci przesuneli zamowienia ,ale za to koszty tez spadly wiec wynik jest w miare ok.Marza wyniosla 1250000 zl  czyli o 3 % mniej niz w budzecie.</textarea></div>
      <div class="row"><div class="field"><label for="w_from">Twoja reguła: zamień</label><input id="w_from" placeholder="np. klient kluczowy"></div><div class="field"><label for="w_to">na</label><input id="w_to" placeholder="np. klient strategiczny"></div><button class="btn" type="button" id="w_add">Dodaj regułę</button></div>
      <div class="info">Reguły dodane przez Ciebie są zapamiętywane i stosowane w pierwszej kolejności. Zarządzasz nimi w „Pamięć i ustawienia”.</div>`);
    const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    function correct(t){
      const ch = [];
      const rep = (re, to, why) => { t = t.replace(re, (...m) => { const r = typeof to === "function" ? to(...m) : m[0].replace(new RegExp(re.source, re.flags.replace("g", "")), to); if (r !== m[0]) ch.push(`${why}: „${m[0].trim()}” → „${r.trim()}”`); return r; }); };
      const strip = x => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/Ł/g, "L");
      const rules = [...M.learn.words.filter(w => !w.off).map(w => [w.from, w.to, "Twoja reguła"]), ...WORD_RULES.map(([f, to]) => [f, to, strip(to) === strip(f) ? "polskie znaki" : "styl"])];
      for (const [from, to, why] of rules) {
        const re = new RegExp(`(^|[^\\p{L}])(${reEsc(from)})(?=$|[^\\p{L}])`, "giu");
        rep(re, (m0, pre, w) => pre + (w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to), why);
      }
      rep(/(\d)\s*(zl)\b/gi, "$1 zł", "zapis waluty");
      rep(/\b(\d{4,})(?=(,\d+)?\s*(zł|PLN|EUR|USD|tys|mln))/g, (m0, d) => fmt(+d), "zapis kwoty");
      rep(/(\d)\s+%/g, "$1%", "zapis procentu");
      rep(/ +([,.;:!?])/g, "$1", "spacja przed znakiem");
      rep(/([,;:])(?=[\p{L}])/gu, "$1 ", "brak spacji po przecinku");
      rep(/([a-ząćęłńóśźż])\.(?=[A-ZĄĆĘŁŃÓŚŹŻ])/g, "$1. ", "brak spacji po kropce");
      rep(/ {2,}/g, " ", "podwójna spacja");
      rep(/(^|[.!?]\s+)([a-ząćęłńóśźż])/g, (m0, p, l) => p + l.toUpperCase(), "wielka litera");
      rep(/\b(\p{L}+) \1\b/giu, "$1", "powtórzone słowo");
      const warn = t.split(/(?<=[.!?])\s+/).filter(x => x.split(/\s+/).length > 30).map(x => `Długie zdanie (${x.split(/\s+/).length} słów): „${x.slice(0, 60)}…” Rozważ podział.`);
      return {t: t.trim(), ch, warn};
    }
    function run(){
      const r = correct(val(root, "w_in"));
      res.innerHTML = `<div class="kpis">${kpi("Poprawek", r.ch.length, "", r.ch.length ? "warn" : "good")}${kpi("Uwag", r.warn.length)}${kpi("Twoich reguł", M.learn.words.filter(w => !w.off).length)}</div>
        <label class="lbl-s" for="w_out">Tekst poprawiony</label><textarea class="out" id="w_out">${esc(r.t)}</textarea>
        <div class="actions"><button class="btn primary" type="button" id="w_copy">Kopiuj poprawiony</button><button class="btn" type="button" id="w_use">Wstaw do edycji</button></div>
        ${r.ch.length ? `<h3 style="font-size:15px">Wprowadzone zmiany</h3><ul style="margin:0;padding-left:18px;font-size:13.5px">${r.ch.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        ${r.warn.length ? `<div class="note">${r.warn.map(esc).join("<br>")}</div>` : ""}
        <div class="info">Reguły nie zastąpią korekty językowej. Sprawdzam typowe błędy w tekstach finansowych, a przed wysyłką przeczytaj tekst jeszcze raz.</div>`;
      $("#w_copy", res).addEventListener("click", () => copyText($("#w_out", res).value));
      $("#w_use", res).addEventListener("click", () => { $("#w_in", root).value = $("#w_out", res).value; run(); });
      markUse("day-wording");
    }
    $("#w_add", root).addEventListener("click", () => { const f = val(root, "w_from").trim(), t = val(root, "w_to").trim(); if (!f) return; M.learn.words = M.learn.words.filter(w => w.from.toLowerCase() !== f.toLowerCase()); M.learn.words.push({from: f, to: t, at: Date.now()}); persist(); $("#w_from", root).value = ""; $("#w_to", root).value = ""; toast("Zapamiętano regułę."); run(); });
    liveForm(root, s, ["w_in"], run);
  }});

/* ——————————————— STRESZCZENIE (ekstrakcyjne, bez AI) ——————————————— */
const STOP = new Set("a aby ale albo ani bardzo bez będzie będą bo by być był była było były czy dla do gdy go i ich im in jak jako je jego jej jest jeszcze już jego ją każdy które który która ma mają może mu na nad nie nich nim niż o od oraz po pod przez przy się są ta tak tam te tego tej ten to tu tych tylko tym tę w we więc wszystko z za ze że żeby co".split(" "));
const FIN_KW = /kar[aęy]|odsetk|termin|płatnoś|zobowiąz|wynagrodz|kwot|zł|pln|eur|ryzyk|gwaranc|zabezpiecz|wypowiedz|rozwiąz|odpowiedzialn|limit|kowenant|zysk|strat|przychod|koszt|podatk|vat|faktur/i;
reg({id:"day-summary", a:"day", kind:"calc", t:"Streszczenie dokumentu", min:15, d:"Wybiera najważniejsze zdania, wyciąga kwoty, daty, terminy i zobowiązania z umowy, raportu lub protokołu.",
  render(root, s){
    const EX = "Umowa dostawy nr 14/2026 zawarta w dniu 03.08.2026 r. pomiędzy Alfa Produkcja sp. z o.o. a Stalex S.A. Przedmiotem umowy są dostawy stali w łącznej ilości do 1 200 ton rocznie. Cena jednostkowa wynosi 3 450 zł netto za tonę i może być waloryzowana raz na kwartał o wskaźnik cen stali, nie więcej niż o 5%. Dostawca zobowiązuje się dostarczać towar w terminie 10 dni roboczych od złożenia zamówienia. Za każdy dzień opóźnienia dostawca zapłaci karę umowną w wysokości 0,2% wartości zamówienia, nie więcej niż 10% wartości zamówienia. Zamawiający zapłaci wynagrodzenie w terminie 45 dni od otrzymania faktury ustrukturyzowanej w KSeF. Strony ustalają limit kredytu kupieckiego na 1 500 000 zł. Umowa zostaje zawarta na czas określony do 31.12.2027 r. Każda ze stron może ją wypowiedzieć z zachowaniem trzymiesięcznego okresu wypowiedzenia. Odpowiedzialność dostawcy jest ograniczona do wysokości 2 000 000 zł, z wyjątkiem szkody wyrządzonej umyślnie. Spory rozstrzyga sąd właściwy dla siedziby zamawiającego.";
    const {form, res} = calcShell(root, "");
    const df = dataField({id:"su_in", label:"Tekst dokumentu (wklej lub wczytaj plik TXT)", ex:EX, value:s.txt, onChange:v => { s.txt = v; persist(); run(); }});
    $("textarea", df).classList.remove("data"); $("textarea", df).style.minHeight = "260px";
    form.append(df, h(`<div class="row">${sel("su_n", "Liczba zdań w streszczeniu", ["3","5","8"], s.n || "5")}${inp("su_k", "Na czym się skupić (słowa kluczowe, po przecinku)", s.k ?? "kara, termin, płatność")}</div>`));
    function run(){
      s.n = val(root, "su_n"); s.k = val(root, "su_k"); persist();
      const txt = df.get().replace(/\s+/g, " ").trim(); if (txt.length < 40) { res.innerHTML = `<div class="empty">Wklej tekst dokumentu.</div>`; return; }
      const prot = txt.replace(/\b(r|ust|art|pkt|nr|np|tj|tzw|ok|zł|tys|mln|godz|poz|sp|S\.A|m\.in|ww|str|zob)\./gi, m => m.replace(/\./g, "§"));
      const sents = prot.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„"])/).map(x => x.replace(/§/g, ".").trim()).filter(x => x.length > 15);
      const tok = x => x.toLowerCase().match(/\p{L}{3,}/gu)?.filter(w => !STOP.has(w)).map(w => w.slice(0, 6)) || [];
      const tf = {}; sents.forEach(x => tok(x).forEach(w => tf[w] = (tf[w] || 0) + 1));
      const focus = val(root, "su_k").split(",").map(x => x.trim().toLowerCase().slice(0, 5)).filter(x => x.length > 2);
      const sc = sents.map((x, i) => { const t = tok(x); let v = t.reduce((a, w) => a + Math.log(1 + tf[w]), 0) / Math.sqrt(t.length || 1); if (/\d/.test(x)) v += 1; if (FIN_KW.test(x)) v += 1; focus.forEach(f => { if (x.toLowerCase().includes(f)) v += 2; }); if (i < 2) v += .8; return {x, i, v}; });
      const N = +val(root, "su_n"), top = [...sc].sort((a, b) => b.v - a.v).slice(0, N).sort((a, b) => a.i - b.i);
      const amounts = [...txt.matchAll(/(\d[\d\s]*(?:,\d+)?\s?(?:zł|PLN|EUR|USD|%|tys\.?\s?zł|mln\s?zł))/g)].map(m => ({v: m[1].trim(), c: txt.slice(Math.max(0, m.index - 60), m.index).split(/[.;]/).pop().trim()}));
      const dates = [...txt.matchAll(/(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s(?:stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s\d{4})/g)].map(m => ({v: m[1], c: txt.slice(Math.max(0, m.index - 60), m.index).split(/[.;]/).pop().trim()}));
      const terms = [...txt.matchAll(/(w terminie[^.;,]*|w ciągu[^.;,]*|z zachowaniem[^.;,]*okresu wypowiedzenia|do dnia [^.;,]*|na czas (?:nie)?określony[^.;,]*)/gi)].map(m => m[1]);
      const obl = sents.filter(x => /zobowiązuje się|jest zobowiązan|zapłaci|powinien|musi|należy|kar[aęy] umown|odpowiedzialnoś|wypowiedz/i.test(x));
      const words = txt.split(/\s+/).length;
      res.innerHTML = `<div class="kpis">${kpi("Słów w dokumencie", fmt(words))}${kpi("Zdań", sents.length)}${kpi("Streszczenie", top.reduce((a, t) => a + t.x.split(/\s+/).length, 0) + " słów")}${kpi("Oszczędność czytania", "~" + Math.max(1, Math.round(words / 200)) + " min")}</div>
        <h3 style="font-size:15px">Najważniejsze</h3><div class="comment">${top.map(t => `<p>${esc(t.x)}</p>`).join("")}</div>
        ${amounts.length ? `<h3 style="font-size:15px">Kwoty i wartości</h3>${tableHTML([{l:"Wartość",n:1},{l:"Kontekst"}], amounts.slice(0, 20).map(a => [esc(a.v), "…" + esc(a.c)]))}` : ""}
        ${dates.length || terms.length ? `<h3 style="font-size:15px">Daty i terminy</h3><ul style="margin:0;padding-left:18px;font-size:13.5px">${dates.map(d => `<li><b>${esc(d.v)}</b>: …${esc(d.c)}</li>`).join("")}${terms.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${obl.length ? `<h3 style="font-size:15px">Zobowiązania, kary i ryzyka</h3><ul style="margin:0;padding-left:18px;font-size:13.5px">${obl.map(o => `<li>${esc(o)}</li>`).join("")}</ul>` : ""}
        <div class="actions"><button class="btn primary" type="button" id="su_copy">Kopiuj streszczenie</button></div>`;
      $("#su_copy", res).addEventListener("click", () => copyText(`Streszczenie\n\n${top.map(t => "- " + t.x).join("\n")}\n\nKwoty: ${amounts.map(a => a.v).join(", ")}\nTerminy: ${[...dates.map(d => d.v), ...terms].join("; ")}\n\nZobowiązania i ryzyka:\n${obl.map(o => "- " + o).join("\n")}`));
      markUse("day-summary");
    }
    $("#su_n", root).addEventListener("change", run); $("#su_k", root).addEventListener("input", run);
    run();
  }});

/* ——————————————— KALENDARZ PODATKOWY ——————————————— */
function deadlinesFor(y, m){
  const p = P(), prevM = new Date(y, m - 1, 1), pm = `${MONTHS[prevM.getMonth()]} ${prevM.getFullYear()}`, list = [];
  const add = (day, t, d, cat, shift = true) => { const dim = new Date(y, m + 1, 0).getDate(); const orig = new Date(y, m, Math.min(day, dim)); const date = shift ? nextWorkday(orig) : orig; list.push({date, orig, t, d, cat}); };
  add(+p.zus || 20, "ZUS: składki i deklaracje", `Składki za ${pm}${p.zus === "15" ? " (jednostki budżetowe: do 15.)" : ""}.`, "ZUS");
  add(15, "PPK: wpłaty", `Wpłaty do PPK za ${pm}.`, "ZUS");
  add(20, "PIT-4: podatek od wynagrodzeń", `Zaliczki pobrane od wynagrodzeń i zryczałtowany podatek (PIT-8A) za ${pm}.`, "PIT");
  const qEnd = [0,3,6,9].includes(m);
  if (p.cit === "miesięcznie") add(20, "CIT: zaliczka miesięczna", `Zaliczka na CIT za ${pm}.`, "CIT");
  else if (p.cit === "kwartalnie" && qEnd) add(20, "CIT: zaliczka kwartalna", `Zaliczka za kwartał zakończony w miesiącu: ${pm}.`, "CIT");
  add(25, p.vat === "kwartalnie" ? "JPK_V7K: ewidencja VAT" : "JPK_V7M: ewidencja, deklaracja i zapłata VAT", p.vat === "kwartalnie" ? `Ewidencja za ${pm}${qEnd ? "; deklaracja i zapłata VAT za kwartał" : ""}.` : `Rozliczenie VAT za ${pm}.`, "VAT");
  add(25, "VAT-UE: informacja podsumowująca", `Za ${pm}, jeśli były transakcje wewnątrzwspólnotowe.`, "VAT");
  const last = (() => { let d = new Date(y, m + 1, 0); while (!isWorkday(d)) d = addDays(d, -1); return d.getDate(); })();
  add(last, "Zamknięcie miesiąca: start", `Ostatni dzień roboczy. Otwórz checklistę zamknięcia za ${MONTHS[m]}.`, "wewn.", false);
  const fy = (+p.fy || 12) - 1, mAfter = k => (fy + k) % 12;
  if (m === 0) { add(31, "PIT-11, PIT-4R, PIT-8AR do urzędu", "Informacje i deklaracje roczne za poprzedni rok.", "PIT"); }
  if (m === 1) add(28, "PIT-11 dla pracowników", "Przekazanie informacji PIT-11 podatnikom (do końca lutego).", "PIT");
  if (m === 3) add(30, "Zeznania roczne osób fizycznych", "PIT-36, PIT-36L, PIT-28, PIT-38.", "PIT");
  if (m === mAfter(3)) { add(31, "CIT-8 i zapłata podatku za rok", "Zeznanie roczne (z JPK_CIT, jeśli dotyczy). Zweryfikuj termin na dany rok.", "CIT"); add(31, "Sporządzenie sprawozdania finansowego", "3 miesiące od dnia bilansowego (art. 52 ust. 1 UoR).", "UoR", false); }
  if (m === mAfter(6)) add(30, "Zatwierdzenie sprawozdania finansowego", "6 miesięcy od dnia bilansowego (art. 53 UoR). Złożenie w KRS w ciągu 15 dni od zatwierdzenia.", "UoR", false);
  if (m === mAfter(7)) add(15, "Sprawozdanie do KRS (orientacyjnie)", "15 dni od zatwierdzenia; data zależy od dnia zatwierdzenia.", "UoR", false);
  if (m === mAfter(10)) add(31, "Lokalna dokumentacja cen transferowych", "Koniec 10. miesiąca po roku podatkowym (zweryfikuj).", "TP");
  if (m === mAfter(11)) add(30, "TPR-C: informacja o cenach transferowych", "Koniec 11. miesiąca po roku podatkowym (zweryfikuj).", "TP");
  if (m === mAfter(12) && p.large === "tak") add(31, "Informacja o strategii podatkowej", "Publikacja do końca 12. miesiąca po roku (art. 27c ustawy o CIT), jeśli dotyczy.", "CIT", false);
  return list.sort((a, b) => a.date - b.date);
}
function upcoming(days = 21){ const t = today(), end = addDays(t, days); const out = []; for (let k = 0; k < 2; k++) { const d = new Date(t.getFullYear(), t.getMonth() + k, 1); deadlinesFor(d.getFullYear(), d.getMonth()).forEach(x => { if (x.date >= t && x.date <= end) out.push(x); }); } return out.sort((a, b) => a.date - b.date); }
function ics(list){ const st = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Godzina Finansisty//PL","CALSCALE:GREGORIAN", ...list.flatMap((x, i) => ["BEGIN:VEVENT", `UID:gf-${st(x.date)}-${i}@godzina-finansisty`, `DTSTAMP:${st(today())}T000000Z`, `DTSTART;VALUE=DATE:${st(x.date)}`, `DTEND;VALUE=DATE:${st(addDays(x.date, 1))}`, `SUMMARY:${x.t.replace(/[,;]/g, " ")}`, `DESCRIPTION:${x.d.replace(/[,;]/g, " ")}`, "BEGIN:VALARM","TRIGGER:-P2D","ACTION:DISPLAY","DESCRIPTION:Przypomnienie","END:VALARM","END:VEVENT"]), "END:VCALENDAR"].join("\r\n"); }
reg({id:"tax-cal", a:"tax", kind:"calc", nw:true, t:"Kalendarz podatkowy", min:15, d:"Terminy ZUS, PIT, CIT, VAT, JPK i sprawozdań na dany miesiąc, z przesunięciem ze świąt i eksportem do Outlooka.",
  render(root, s){
    let cur = new Date(today().getFullYear(), today().getMonth(), 1);
    root.innerHTML = `<div class="stack"><div class="actions"><button class="btn" type="button" data-m="-1">← Poprzedni</button><b id="cal_m" style="font:700 18px var(--f-display);min-width:170px;text-align:center"></b><button class="btn" type="button" data-m="1">Następny →</button><span style="flex:1"></span><button class="btn" type="button" id="cal_ics">Pobierz do kalendarza (.ics)</button><button class="btn sm" type="button" id="cal_ics3">Następne 3 miesiące (.ics)</button></div>
      <div class="info">Ustawienia (VAT miesięcznie lub kwartalnie, termin ZUS, zaliczki CIT, koniec roku obrotowego) zmienisz w „Pamięć i ustawienia → Profil firmy”. Terminy podatkowe przypadające na dzień wolny przesuwam na najbliższy dzień roboczy.</div><div id="cal_list"></div></div>`;
    function draw(){
      const L = deadlinesFor(cur.getFullYear(), cur.getMonth()), t = today();
      $("#cal_m", root).textContent = `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`;
      $("#cal_list", root).innerHTML = tableHTML([{l:"Termin"},{l:"Dzień"},{l:"Obowiązek"},{l:"Szczegóły"},{l:"Kategoria"},{l:"Za ile"}], L.map(x => { const dd = dayDiff(t, x.date); return [`<b class="num">${fmtDate(x.date)}</b>${+x.date !== +x.orig ? `<br><span class="hint">przesunięte z ${fmtDate(x.orig)} (${isHoliday(x.orig) || "weekend"})</span>` : ""}`, DOW[x.date.getDay()], esc(x.t), esc(x.d), `<span class="pill">${x.cat}</span>`, dd < 0 ? '<span class="hint">minął</span>' : dd === 0 ? '<span class="pill bad">dziś</span>' : `<span class="pill ${dd <= 3 ? "warn" : ""} num">${dd} dni</span>`]; }), {rowCls: r => r[5].includes("minął") ? "" : r[5].includes("dziś") || r[5].includes("warn") ? "flag" : ""});
      markUse("tax-cal");
    }
    root.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (b) { cur = new Date(cur.getFullYear(), cur.getMonth() + +b.dataset.m, 1); draw(); } });
    $("#cal_ics", root).addEventListener("click", () => download(`terminy-${cur.getFullYear()}-${pad(cur.getMonth() + 1)}.ics`, ics(deadlinesFor(cur.getFullYear(), cur.getMonth())), "text/calendar"));
    $("#cal_ics3", root).addEventListener("click", () => { const L = []; for (let k = 0; k < 3; k++) { const d = new Date(today().getFullYear(), today().getMonth() + k, 1); L.push(...deadlinesFor(d.getFullYear(), d.getMonth())); } download("terminy-3-miesiace.ics", ics(L), "text/calendar"); });
    draw();
  }});

/* ——————————————— STRATEGIA PODATKOWA: kwestionariusz ulg ——————————————— */
reg({id:"tax-strategy", a:"tax", kind:"calc", t:"Strategia podatkowa", min:40, d:"Kwestionariusz wskazuje ulgi i preferencje, które mogą Ci przysługiwać, z szacunkiem korzyści i warunkami.",
  render(root, s){
    const Q = [["q_br","Prowadzisz prace rozwojowe: nowe lub ulepszone produkty, procesy, oprogramowanie?"],["q_ip","Wytwarzasz własne prawa IP (program komputerowy, patent, wzór) i uzyskujesz z nich dochód?"],["q_rob","Kupujesz roboty przemysłowe, maszyny współpracujące z robotem lub oprogramowanie do automatyzacji?"],["q_exp","Zwiększasz sprzedaż nowych produktów lub wchodzisz na nowe rynki (targi, marketing, dokumentacja)?"],["q_est","Wspólnikami są wyłącznie osoby fizyczne, a przychody nie przekraczają 100 mln zł?"],["q_small","Przychody brutto nie przekroczyły 2 mln EUR w poprzednim roku?"],["q_grp","Działasz w grupie powiązanych spółek z dużą liczbą transakcji wewnątrzgrupowych?"],["q_inv","Planujesz nową inwestycję (zakład, linia, centrum usług)?"],["q_low","Masz stratę lub rentowność poniżej 2%?"],["q_big","Przychody przekraczają 50 mln EUR?"]];
    const {form, res} = calcShell(root, `<div class="stack">${Q.map(([id, q]) => `<label style="display:flex;gap:10px;align-items:flex-start;font-size:14px"><input type="checkbox" id="${id}" style="width:18px;height:18px;margin-top:2px;accent-color:var(--accent)"> ${esc(q)}</label>`).join("")}</div>
      <div class="row">${inp("q_brc", "Koszty prac rozwojowych rocznie (zł)", "800 000")}${inp("q_ipd", "Dochód z IP rocznie (zł)", "1 200 000")}</div>${inp("q_robc", "Wydatki na robotyzację (zł)", "600 000")}`);
    function run(){
      const c = id => $("#" + id, root).checked, R = [];
      if (c("q_br")) R.push(["Ulga B+R","art. 18d ustawy o CIT","Dodatkowe odliczenie kosztów kwalifikowanych (do 200% kosztów pracowniczych, 100% pozostałych). Ewidencja kosztów B+R, dokumentacja projektów.", num(root, "q_brc") * .19, "niskie, gdy dokumentacja projektów jest solidna"]);
      if (c("q_ip")) R.push(["IP Box: 5% CIT","art. 24d–24e ustawy o CIT","Dochód z kwalifikowanych praw IP opodatkowany 5%. Odrębna ewidencja, wskaźnik nexus, zwykle interpretacja indywidualna.", num(root, "q_ipd") * .14, "średnie: wymaga starannej ewidencji"]);
      if (c("q_rob")) R.push(["Ulga na robotyzację","art. 38eb ustawy o CIT","Dodatkowe odliczenie 50% kosztów robotyzacji (dla kosztów poniesionych w latach 2022–2026).", num(root, "q_robc") * .5 * .19, "niskie"]);
      if (c("q_exp")) R.push(["Ulga na ekspansję","art. 18eb ustawy o CIT","Dodatkowe odliczenie kosztów zwiększenia przychodów ze sprzedaży produktów (limit 1 mln zł rocznie), gdy przychody rosną.", NaN, "średnie: warunek wzrostu przychodów"]);
      if (c("q_est")) R.push(["Estoński CIT (ryczałt od dochodów spółek)","art. 28c–28t ustawy o CIT","Podatek płacony dopiero przy wypłacie zysku. Warunki: wspólnicy osoby fizyczne, co najmniej 3 osoby zatrudnione, struktura przychodów, brak udziałów w innych spółkach.", NaN, "średnie: wiele warunków do utrzymania"]);
      if (c("q_small")) R.push(["Stawka 9% CIT (mały podatnik)","art. 19 ust. 1 pkt 2 ustawy o CIT","9% dla przychodów innych niż zyski kapitałowe, jeśli przychody w roku nie przekroczą 2 mln EUR. Wyłączenia dla podmiotów po restrukturyzacjach.", NaN, "niskie"]);
      if (c("q_grp")) R.push(["Grupa VAT lub PGK","ustawa o VAT (grupa VAT), art. 1a ustawy o CIT (PGK)","Transakcje wewnątrz grupy VAT poza VAT; PGK pozwala łączyć zyski i straty spółek. Wymogi powiązań i umowy.", NaN, "średnie"]);
      if (c("q_inv")) R.push(["Polska Strefa Inwestycji","ustawa o wspieraniu nowych inwestycji","Zwolnienie z CIT na podstawie decyzji o wsparciu, zależne od lokalizacji i wielkości nakładów.", NaN, "niskie przy dotrzymaniu warunków decyzji"]);
      if (c("q_low")) R.push(["Uwaga: podatek minimalny","art. 24ca ustawy o CIT","Przy stracie lub rentowności poniżej 2% może powstać obowiązek podatku minimalnego. Sprawdź zwolnienia i sposób liczenia.", NaN, "wysokie, jeśli nie monitorujesz"]);
      if (c("q_big")) R.push(["Obowiązek: strategia podatkowa i JPK_CIT","art. 27c ustawy o CIT","Publikacja informacji o realizowanej strategii podatkowej; JPK_CIT; raportowanie MDR i ryzyka związane z GAAR.", NaN, "regulacyjne"]);
      const sum = R.reduce((a, r) => a + (isFinite(r[3]) ? r[3] : 0), 0);
      res.innerHTML = R.length ? `<div class="kpis">${kpi("Rozwiązań do analizy", R.length)}${kpi("Szacunkowa korzyść roczna", sum ? shortNum(sum) : "–", "tylko pozycje z podanymi kwotami", sum ? "good" : "")}</div>
        ${tableHTML([{l:"Rozwiązanie"},{l:"Podstawa"},{l:"Warunki i opis"},{l:"Szac. korzyść",n:1},{l:"Ryzyko"}], R.map(r => [`<b>${esc(r[0])}</b>`, esc(r[1]), esc(r[2]), isFinite(r[3]) ? fmt(r[3]) : "–", esc(r[4])]))}
        <div class="note"><b>Ważne:</b> to wstępny przegląd, nie porada podatkowa. Przed wdrożeniem potwierdź warunki z doradcą, sprawdź aktualny stan prawny, obowiązki MDR i klauzulę przeciwko unikaniu opodatkowania (art. 119a Ordynacji podatkowej).</div>` : `<div class="empty">Zaznacz pytania, które dotyczą Twojej firmy.</div>`;
      res.append(exportBar("strategia-podatkowa", () => [["Rozwiązanie","Podstawa","Warunki","Korzyść","Ryzyko"], ...R.map(r => [r[0], r[1], r[2], isFinite(r[3]) ? Math.round(r[3]) : "", r[4]])]));
      markUse("tax-strategy");
    }
    liveForm(root, s, [...Q.map(q => q[0]), "q_brc","q_ipd","q_robc"], run);
    Q.forEach(([id]) => { if (s.v && s.v[id + "_c"] != null) $("#" + id, root).checked = s.v[id + "_c"]; $("#" + id, root).addEventListener("change", e => { s.v ||= {}; s.v[id + "_c"] = e.target.checked; persist(); run(); }); });
    run();
  }});
