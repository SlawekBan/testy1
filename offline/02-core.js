/* =====================================================================
   GODZINA FINANSISTY OFFLINE — rdzeń: pamięć, formaty, parsery, wykresy
   ===================================================================== */
const AREAS = [
  {id:"fa",  name:"Zespół analiz finansowych", grp:"Zespoły"},
  {id:"bud", name:"Budżetowanie i prognozy",   grp:"Zespoły"},
  {id:"cfo", name:"CFO",                        grp:"Zespoły"},
  {id:"tax", name:"Podatki i strategia",       grp:"Zespoły"},
  {id:"ap",  name:"Zobowiązania i należności", grp:"Zespoły"},
  {id:"ctl", name:"Kontroler finansowy",       grp:"Zespoły"},
  {id:"aud", name:"Zespół audytu",             grp:"Zespoły"},
  {id:"day", name:"Produktywność",             grp:"Na co dzień"},
  {id:"stk", name:"Komunikacja z interesariuszami", grp:"Na co dzień"},
  {id:"perf",name:"Plany efektywności",        grp:"Na co dzień"},
  {id:"tool",name:"Samouczki narzędzi",        grp:"Na co dzień"}
];
const KIND = {calc:"kalkulator", data:"analiza danych", tpl:"generator pism", check:"checklista", reg:"rejestr", lib:"biblioteka"};
const MODS = [];
const reg = m => { MODS.push(m); return m; };
const byId = id => MODS.find(m => m.id === id);
const areaName = id => (AREAS.find(a => a.id === id) || {}).name || "";

/* ——— pamięć ——— */
const KEY = "godzina-finansisty-offline.v1";
const blank = () => ({profile:{}, stats:{}, log:[], mods:{}, learn:{hist:{}, varType:{}, varCause:{}, anomOk:{}, words:[]}});
let M = blank(), memoryOk = true;
try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); M = Object.assign(blank(), d); M.learn = Object.assign(blank().learn, d.learn || {}); } }
catch { memoryOk = false; }
let savePending = false;
function flush(){ savePending = false; try { localStorage.setItem(KEY, JSON.stringify(M)); } catch { memoryOk = false; } }
function persist(){ if (!savePending) { savePending = true; queueMicrotask(flush); } }
window.addEventListener("pagehide", () => { if (savePending) flush(); });
const ms = id => (M.mods[id] ||= {});
const P = () => Object.assign({vat:"miesięcznie", zus:"20", cit:"miesięcznie", fy:"12", ref:"4,00", eur:"4,25", prog:"5% lub 50 000 zł"}, M.profile);

/* ——— DOM i drobne narzędzia ——— */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 2600); }
function h(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

/* ——— liczby i daty w formacie polskim ——— */
function parseNum(v){
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  let s = String(v).trim(); if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[\s  ']/g, "").replace(/(zł|pln|eur|usd|chf|gbp|%|€|\$)/gi, "");
  if (s.endsWith("-")) { neg = !neg; s = s.slice(0, -1); }
  const c = s.includes(","), d = s.includes(".");
  if (c && d) { s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, ""); }
  else if (c) { s = /^[-+]?\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", "."); }
  else if (d && /^[-+]?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
  const n = parseFloat(s); return neg ? -n : n;
}
const isNum = v => !isNaN(parseNum(v));
const nf = {};
function fmt(n, dec = 0){ if (n == null || !isFinite(n)) return "–"; const k = dec; return (nf[k] ||= new Intl.NumberFormat("pl-PL", {minimumFractionDigits:k, maximumFractionDigits:k, useGrouping:true})).format(n).replace(/ /g, " "); }
const fmtZl = (n, dec = 2) => isFinite(n) ? fmt(n, dec) + " zł" : "–";
const fmtPct = (x, dec = 1) => isFinite(x) ? (x > 0 ? "+" : "") + fmt(x * 100, dec) + "%" : "–";
const pct = (x, dec = 1) => isFinite(x) ? fmt(x * 100, dec) + "%" : "–";
const pad = n => String(n).padStart(2, "0");
const fmtDate = d => d ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` : "–";
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parseDate(v){
  if (v instanceof Date) return v;
  const s = String(v ?? "").trim(); let m;
  const mk = (y, mo, d) => { const x = new Date(y, mo - 1, d); return x.getMonth() === mo - 1 ? x : null; };
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return mk(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/))) return mk(+m[3], +m[2], +m[1]);
  if ((m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2})$/))) return mk(2000 + +m[3], +m[2], +m[1]);
  return null;
}
const dayDiff = (a, b) => Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const MONTHS = ["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"];
const MONTHS_GEN = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];
const DOW = ["nd","pn","wt","śr","cz","pt","sb"];

/* ——— święta w Polsce i dni robocze ——— */
function easter(y){ const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),hh=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-hh-k)%7,m=Math.floor((a+11*hh+22*l)/451),mo=Math.floor((hh+l-7*m+114)/31),da=((hh+l-7*m+114)%31)+1; return new Date(y,mo-1,da); }
const holCache = {};
function holidays(y){
  if (holCache[y]) return holCache[y];
  const e = easter(y), s = new Map();
  const add = (d, n) => s.set(isoDate(d), n);
  [[1,1,"Nowy Rok"],[1,6,"Trzech Króli"],[5,1,"Święto Pracy"],[5,3,"Święto Konstytucji 3 Maja"],[8,15,"Wniebowzięcie NMP"],[11,1,"Wszystkich Świętych"],[11,11,"Święto Niepodległości"],[12,25,"Boże Narodzenie"],[12,26,"Drugi dzień Bożego Narodzenia"]].forEach(([m,d,n]) => add(new Date(y,m-1,d), n));
  if (y >= 2025) add(new Date(y,11,24), "Wigilia");
  add(e, "Wielkanoc"); add(addDays(e,1), "Poniedziałek Wielkanocny"); add(addDays(e,49), "Zielone Świątki"); add(addDays(e,60), "Boże Ciało");
  return holCache[y] = s;
}
const isHoliday = d => holidays(d.getFullYear()).get(isoDate(d));
const isWorkday = d => d.getDay() !== 0 && d.getDay() !== 6 && !isHoliday(d);
function nextWorkday(d){ let x = d; while (!isWorkday(x)) x = addDays(x, 1); return x; }
function workdaysBetween(a, b){ let n = 0, x = a; const s = a <= b ? 1 : -1; while (s > 0 ? x <= b : x >= b) { if (isWorkday(x)) n++; x = addDays(x, s); } return n * s; }

/* ——— tabele: parsowanie wklejonych danych i CSV ——— */
function parseTable(text){
  const lines = String(text || "").replace(/\r/g, "").split("\n").filter(l => l.trim() && !/^\s*\|?\s*:?-{3,}/.test(l));
  if (!lines.length) return {head:null, rows:[]};
  const sample = lines.slice(0, 5).join("\n");
  const del = sample.includes("\t") ? "\t" : sample.includes(";") ? ";" : sample.includes("|") ? "|" : ",";
  const split = l => {
    if (del === "|") return l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
    const out = []; let cur = "", q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i];
      if (ch === '"') { if (q && l[i+1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (ch === del && !q) { out.push(cur.trim()); cur = ""; } else cur += ch; }
    out.push(cur.trim()); return out;
  };
  const rows = lines.map(split);
  const numCount = r => r.filter(c => c !== "" && isNum(c)).length;
  let head = null;
  if (rows.length > 1 && numCount(rows[0]) < numCount(rows[1])) head = rows.shift();
  else if (rows.length > 1 && numCount(rows[0]) === 0 && rows[0].every(c => c && !parseDate(c))) head = rows.shift();
  return {head, rows};
}
function findCol(head, patterns, fallback){
  if (head) { for (const p of patterns) { const i = head.findIndex(c => p.test(c.toLowerCase())); if (i >= 0) return i; } }
  return fallback;
}
const csvCell = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const toCSV = rows => "﻿" + rows.map(r => r.map(csvCell).join(";")).join("\r\n");
const toTSV = rows => rows.map(r => r.map(v => String(v ?? "").replace(/[\t\n]/g, " ")).join("\t")).join("\n");
function download(name, text, type = "text/plain"){
  try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type: type + ";charset=utf-8"})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800); toast("Zapisano plik " + name); }
  catch { copyText(text); }
}
async function copyText(txt){
  try { await navigator.clipboard.writeText(txt); toast("Skopiowano do schowka"); return true; }
  catch { const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); toast(ok ? "Skopiowano do schowka" : "Nie udało się skopiować. Zaznacz tekst ręcznie."); return ok; }
}
/* tabela wyników: head = [{l, n(liczbowa), k}] lub teksty, rows = tablice komórek (html) */
function tableHTML(head, rows, opt = {}){
  const H = head.map(c => typeof c === "string" ? {l:c} : c);
  return `<div class="tbl"><table><thead><tr>${H.map(c => `<th class="${c.n ? "n" : ""}">${esc(c.l)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${opt.rowCls ? opt.rowCls(r, i) : ""}">${r.map((v, j) => `<td class="${H[j] && H[j].n ? "n" : ""} ${opt.cellCls ? opt.cellCls(r, i, j) : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
/* przyciski eksportu dla wyniku tabelarycznego */
function exportBar(name, getRows){
  const el = h(`<div class="actions no-print"><button class="btn sm" type="button" data-x="tsv">Kopiuj do Excela</button><button class="btn sm" type="button" data-x="csv">Pobierz CSV</button><button class="btn sm" type="button" data-x="print">Drukuj / PDF</button></div>`);
  el.addEventListener("click", e => { const b = e.target.closest("[data-x]"); if (!b) return; const x = b.dataset.x;
    if (x === "tsv") copyText(toTSV(getRows())); if (x === "csv") download(name + ".csv", toCSV(getRows()), "text/csv"); if (x === "print") window.print(); });
  return el;
}

/* ——— XLSX bez bibliotek: ZIP + DecompressionStream + XML ——— */
async function readXlsx(buf){
  const dv = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder();
  let eocd = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("zip");
  const files = {}; let p = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
  for (let k = 0; k < n; k++) { const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    files[td.decode(u8.subarray(p + 46, p + 46 + nl))] = {m: dv.getUint16(p + 10, true), cs: dv.getUint32(p + 20, true), lo: dv.getUint32(p + 42, true)}; p += 46 + nl + xl + cl; }
  const get = async name => { const f = files[name]; if (!f) return null; const st = f.lo + 30 + dv.getUint16(f.lo + 26, true) + dv.getUint16(f.lo + 28, true); const data = u8.subarray(st, st + f.cs);
    if (f.m === 0) return td.decode(data); const s = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw")); return await new Response(s).text(); };
  const xml = s => new DOMParser().parseFromString(s, "application/xml");
  const ss = []; const sst = await get("xl/sharedStrings.xml");
  if (sst) $$("si", xml(sst)).forEach(si => ss.push($$("t", si).map(t => t.textContent).join("")));
  const dateStyles = new Set(); const sty = await get("xl/styles.xml");
  if (sty) { const d = xml(sty); const custom = {}; $$("numFmts numFmt", d).forEach(f => custom[f.getAttribute("numFmtId")] = f.getAttribute("formatCode"));
    $$("cellXfs xf", d).forEach((xf, i) => { const id = +xf.getAttribute("numFmtId"); const code = custom[id] || ""; if ((id >= 14 && id <= 22) || (id >= 45 && id <= 47) || (/[dy]/i.test(code.replace(/"[^"]*"|\[[^\]]*\]/g, "")) && !/[#0]/.test(code))) dateStyles.add(i); }); }
  const wb = xml(await get("xl/workbook.xml")), rels = xml(await get("xl/_rels/workbook.xml.rels") || "<r/>");
  const relMap = {}; $$("Relationship", rels).forEach(r => relMap[r.getAttribute("Id")] = r.getAttribute("Target"));
  const out = [];
  for (const sh of $$("sheet", wb)) {
    const rid = sh.getAttribute("r:id") || sh.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    let target = relMap[rid] || ""; target = target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, "");
    const src = await get(target); if (!src) continue;
    const rows = [];
    $$("sheetData row", xml(src)).forEach(r => { const row = [];
      $$("c", r).forEach(c => { const ref = c.getAttribute("r") || ""; const col = ref.replace(/\d/g, "").split("").reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        const t = c.getAttribute("t"), v = ($("v", c) || {}).textContent; let val = "";
        if (t === "s") val = ss[+v] ?? ""; else if (t === "inlineStr") val = $$("t", c).map(x => x.textContent).join(""); else if (t === "b") val = v === "1" ? "PRAWDA" : "FAŁSZ";
        else if (v != null) { if (dateStyles.has(+c.getAttribute("s")) && isFinite(+v)) val = fmtDate(new Date(1899, 11, 30 + Math.floor(+v))); else val = t === "str" || t === "e" ? v : String(+v).replace(".", ","); }
        row[col >= 0 ? col : row.length] = val; });
      rows.push(Array.from(row, x => x ?? "")); });
    out.push({name: sh.getAttribute("name"), rows});
  }
  return out;
}
async function fileToText(file){
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "xlsx" || ext === "xlsm") { const sheets = await readXlsx(await file.arrayBuffer()); const s = sheets.find(x => x.rows.length) || sheets[0]; return s.rows.map(r => r.join(";")).join("\n"); }
  if (ext === "xls") throw new Error("xls");
  return await file.text();
}

/* ——— pole danych z importem pliku ——— */
function dataField(o){
  // o: {id, label, ex, value, hint, onChange}
  const el = h(`<div class="field"><label for="${o.id}">${esc(o.label)}</label>
    <textarea id="${o.id}" class="data" spellcheck="false" placeholder="Wklej dane z Excela (kolumny oddzielone tabulatorem lub średnikiem)…"></textarea>
    <div class="drop"><span>Przeciągnij plik CSV, XLSX lub TXT albo</span><label for="${o.id}_f">wybierz plik</label><input id="${o.id}_f" type="file" hidden accept=".csv,.tsv,.txt,.xlsx,.xlsm">
    <span style="margin-left:auto" class="actions"><button type="button" class="btn sm ghost" data-a="ex">Przykład</button><button type="button" class="btn sm ghost" data-a="clr">Wyczyść</button></span></div>
    ${o.hint ? `<span class="hint">${o.hint}</span>` : ""}</div>`);
  const ta = $("textarea", el), drop = $(".drop", el);
  ta.value = o.value ?? o.ex ?? "";
  const set = v => { ta.value = v; o.onChange && o.onChange(v); };
  const load = async f => { try { set(await fileToText(f)); toast("Wczytano " + f.name); } catch (e) { toast(e.message === "xls" ? "Stary format .xls: zapisz plik jako .xlsx lub CSV." : "Nie udało się odczytać pliku " + f.name); } };
  ta.addEventListener("input", () => o.onChange && o.onChange(ta.value));
  $("input[type=file]", el).addEventListener("change", e => { if (e.target.files[0]) load(e.target.files[0]); e.target.value = ""; });
  ["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) load(f); });
  el.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; set(b.dataset.a === "ex" ? (o.ex || "") : ""); });
  el.get = () => ta.value; el.set = set;
  return el;
}

/* ——— pola formularza z pamięcią wartości ——— */
function fieldHTML(f, val, pre = "f_"){
  const id = pre + f.k, hist = M.learn.hist[f.k] || [];
  const dl = hist.length && (!f.type || f.type === "text") ? `<datalist id="dl_${pre}${f.k}">${hist.map(x => `<option value="${esc(x)}">`).join("")}</datalist>` : "";
  let inp;
  if (f.type === "select") inp = `<select id="${id}" name="${f.k}">${f.o.map(o => `<option${o === val ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  else if (f.type === "textarea") inp = `<textarea id="${id}" name="${f.k}">${esc(val)}</textarea>`;
  else inp = `<input id="${id}" name="${f.k}" value="${esc(val)}" ${f.type === "date" ? 'type="date"' : f.type === "num" ? 'inputmode="decimal"' : ""} ${dl ? `list="dl_${pre}${f.k}"` : ""}>`;
  return `<div class="field${f.wide ? " wide" : ""}"><label for="${id}">${esc(f.l)}</label>${inp}${dl}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}</div>`;
}
function initialVals(fields, saved){
  const o = {}; const prof = P();
  fields.forEach(f => { let v = saved && saved[f.k]; if (v == null && f.prof) v = prof[f.prof]; if (v == null) v = typeof f.ex === "function" ? f.ex() : f.type === "select" ? f.o[0] : (f.ex ?? ""); o[f.k] = v; });
  return o;
}
function readForm(root, fields, pre = "f_"){ const o = {}; fields.forEach(f => { const el = $("#" + pre + f.k, root); o[f.k] = el ? el.value : ""; }); return o; }
function rememberHist(fields, vals){
  fields.forEach(f => { const x = String(vals[f.k] || "").trim(); if (!x || f.type === "select" || f.type === "date" || x.length > 90) return; const hs = M.learn.hist[f.k] || []; M.learn.hist[f.k] = [x, ...hs.filter(y => y !== x)].slice(0, 8); });
}

/* ——— wykresy SVG (kolory z tokenów motywu) ——— */
const SERIES = ["var(--accent)", "var(--learn)", "var(--bad)", "var(--muted)"];
function niceTicks(min, max, n = 5){
  if (min === max) { min -= 1; max += 1; }
  const span = max - min, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))), r = step0 / mag;
  const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
  for (let v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
  return t;
}
const shortNum = v => Math.abs(v) >= 1e6 ? fmt(v / 1e6, Math.abs(v) >= 1e7 ? 0 : 1) + " mln" : Math.abs(v) >= 1e3 ? fmt(v / 1e3, Math.abs(v) >= 1e4 ? 0 : 1) + " tys." : fmt(v, Math.abs(v) < 10 && v % 1 ? 1 : 0);
function lineChart({labels, series, w = 760, hh = 260, bars = null}){
  const L = 64, R = 14, T = 14, B = 34, iw = w - L - R, ih = hh - T - B;
  const all = series.flatMap(s => s.values.filter(v => v != null && isFinite(v))).concat(bars ? bars.filter(isFinite) : []);
  if (!all.length) return "";
  const ticks = niceTicks(Math.min(0, ...all) < 0 || Math.min(...all) < 0 ? Math.min(...all) : Math.min(...all) * 0.9, Math.max(...all));
  const y0 = ticks[0], y1 = ticks[ticks.length - 1], n = labels.length;
  const X = i => L + (n === 1 ? iw / 2 : i * iw / (n - 1)), Y = v => T + ih - (v - y0) / (y1 - y0) * ih;
  let g = ticks.map(t => `<line x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--rule)" stroke-width="1"/><text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${shortNum(t)}</text>`).join("");
  const every = Math.max(1, Math.ceil(n / 12));
  g += labels.map((l, i) => i % every === 0 || (i === n - 1 && (n - 1) % every >= every * .7) ? `<text x="${X(i)}" y="${hh - 12}" text-anchor="middle">${esc(l)}</text>` : "").join("");
  if (bars) { const bw = Math.max(3, iw / n * 0.6); g += bars.map((v, i) => isFinite(v) ? `<rect x="${X(i) - bw / 2}" y="${Math.min(Y(v), Y(Math.max(0, y0)))}" width="${bw}" height="${Math.abs(Y(v) - Y(Math.max(0, y0)))}" fill="${v < 0 ? "var(--bad)" : "var(--accent-soft)"}"/>` : "").join(""); }
  series.forEach((s, k) => {
    const col = s.color || SERIES[k % SERIES.length]; let d = "", on = false;
    s.values.forEach((v, i) => { if (v == null || !isFinite(v)) { on = false; return; } d += (on ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); on = true; });
    if (s.area) g += `<path d="${d} L${X(s.values.length - 1)} ${Y(y0)} L${X(s.values.findIndex(v => v != null))} ${Y(y0)} Z" fill="${col}" opacity=".08"/>`;
    g += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${s.w || 2.2}" ${s.dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round"/>`;
    (s.marks || []).forEach(i => { if (isFinite(s.values[i])) g += `<circle cx="${X(i)}" cy="${Y(s.values[i])}" r="5" fill="var(--surface)" stroke="var(--bad)" stroke-width="2.4"/>`; });
    const li = s.values.map((v, i) => v != null && isFinite(v) ? i : -1).filter(i => i >= 0).pop();
    if (li != null && !s.dash) g += `<circle cx="${X(li)}" cy="${Y(s.values[li])}" r="3.5" fill="${col}"/>`;
  });
  const legend = series.length > 1 ? `<div class="legend">${series.map((s, k) => `<span><i style="background:${s.color || SERIES[k % SERIES.length]}"></i>${esc(s.name)}</span>`).join("")}</div>` : "";
  return `<div class="chart"><svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="Wykres">${g}</svg></div>${legend}`;
}
function hBars(items, {w = 760, fmtV = v => shortNum(v)} = {}){
  // items: [{l, v, cls}] – poziome słupki od zera (wartości dodatnie i ujemne)
  const lw = 190, R = 70, bh = 22, gap = 6, hh = items.length * (bh + gap) + 10;
  const max = Math.max(...items.map(i => Math.abs(i.v)), 1), hasNeg = items.some(i => i.v < 0);
  const x0 = hasNeg ? lw + (w - lw - R) / 2 : lw, sc = (hasNeg ? (w - lw - R) / 2 : w - lw - R) / max;
  const g = items.map((it, k) => { const y = 5 + k * (bh + gap), len = Math.abs(it.v) * sc, x = it.v < 0 ? x0 - len : x0;
    const col = it.col || (it.v < 0 ? "var(--bad)" : "var(--accent)");
    return `<text x="${lw - 8}" y="${y + 15}" text-anchor="end">${esc(it.l.length > 28 ? it.l.slice(0, 27) + "…" : it.l)}</text><rect x="${x}" y="${y}" width="${Math.max(1, len)}" height="${bh}" rx="3" fill="${col}"/><text x="${it.v < 0 ? x - 6 : x + len + 6}" y="${y + 15}" text-anchor="${it.v < 0 ? "end" : "start"}">${esc(fmtV(it.v))}</text>`; }).join("");
  return `<div class="chart"><svg viewBox="0 0 ${w} ${hh}" role="img" aria-label="Wykres słupkowy">${hasNeg ? `<line x1="${x0}" x2="${x0}" y1="0" y2="${hh}" stroke="var(--rule)"/>` : ""}${g}</svg></div>`;
}
