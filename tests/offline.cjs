// Testy end-to-end wersji offline (bez Claude, bez internetu).
// Uruchomienie: npm test   (albo: NODE_PATH=$(npm root -g) node tests/offline.cjs)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const assert = require("assert");

const FILE = "file://" + path.resolve(__dirname, "../dist/godzina-finansisty-offline.html");
const SHOTS = path.resolve(__dirname, "../docs");
const results = [];
async function test(name, fn) {
  try { await fn(); results.push(["ok", name]); console.log("  ✓ " + name); }
  catch (e) { results.push(["fail", name, e]); console.log("  ✗ " + name + "\n    " + (e && e.message)); }
}

// Minimalny plik XLSX (ZIP z deflate) budowany w teście, bez bibliotek
function makeXlsx(files) {
  const locals = [], centrals = []; let off = 0;
  for (const [name, text] of Object.entries(files)) {
    const raw = Buffer.from(text, "utf8"), data = zlib.deflateRawSync(raw), nm = Buffer.from(name), crc = zlib.crc32(raw);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nm, data); centrals.push(ch, nm); off += 30 + nm.length + data.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(centrals.length / 2, 8); end.writeUInt16LE(centrals.length / 2, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}
const XLSX = makeXlsx({
  "[Content_Types].xml": `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>`,
  "xl/workbook.xml": `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Budżet" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
  "xl/sharedStrings.xml": `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Pozycja</t></si><si><t>Budżet</t></si><si><t>Wykonanie</t></si><si><t>Przychody ze sprzedaży</t></si><si><t>Energia</t></si><si><t>Data</t></si></sst>`,
  "xl/styles.xml": `<?xml version="1.0"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="14"/></cellXfs></styleSheet>`,
  "xl/worksheets/sheet1.xml": `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
    <row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>5</v></c></row>
    <row r="2"><c r="A2" t="s"><v>3</v></c><c r="B2"><v>4200000</v></c><c r="C2"><v>3950000.5</v></c><c r="D2" s="1"><v>46265</v></c></row>
    <row r="3"><c r="A3" t="s"><v>4</v></c><c r="B3"><v>95000</v></c><c r="C3"><v>121000</v></c></row></sheetData></worksheet>`
});

(async () => {
  const browser = await chromium.launch();
  const errors = []; let netRequests = 0;
  const newPage = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, acceptDownloads: true, colorScheme: opts.dark ? "dark" : "light", permissions: ["clipboard-read", "clipboard-write"] });
    await ctx.route(/^https?:/, r => { netRequests++; r.abort(); });   // całkowicie offline
    const page = await ctx.newPage();
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(FILE);
    return { ctx, page };
  };
  const go = async (page, id) => { await page.evaluate(i => { location.hash = i; }, id); await page.waitForSelector("#ws"); await page.waitForTimeout(80); };
  const learn = page => page.evaluate(() => window.__GF.M().learn);

  console.log("Godzina Finansisty Offline — testy");
  const { ctx, page } = await newPage();

  await test("działa bez internetu: zero żądań sieciowych, brak zewnętrznych skryptów i fontów", async () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../dist/godzina-finansisty-offline.html"), "utf8");
    assert.ok(!/<script[^>]+src=|<link[^>]+stylesheet|@import|fonts\.googleapis/.test(html), "zewnętrzny zasób w pliku");
    assert.ok(!/claude\.ai|anthropic/i.test(html), "odwołanie do Claude");
    assert.strictEqual(netRequests, 0);
  });

  await test("47 narzędzi w 11 obszarach; każde otwiera się bez błędu", async () => {
    const ids = await page.evaluate(() => window.__GF.MODS.map(m => m.id));
    assert.strictEqual(ids.length, 47);
    assert.strictEqual(new Set(ids).size, 47);
    for (const id of ids) { await go(page, id); const t = await page.textContent("#ws"); assert.ok(!/Nie udało się otworzyć/.test(t), id); }
  });

  await test("liczby w formacie polskim, NIP, REGON, IBAN, NPV i IRR", async () => {
    const r = await page.evaluate(() => { const G = window.__GF; return { a: G.parseNum("1 234 567,89 zł"), b: G.parseNum("(1 500)"), c: G.parseNum("1,234,567.89"), d: G.parseNum("3,14"), nip: [G.nipOk("5261040828"), G.nipOk("5261040829")], regon: [G.regonOk("012100784"), G.regonOk("012100785")], iban: [G.ibanOk("PL61 1090 1014 0000 0712 1981 2874"), G.ibanOk("PL61 1090 1014 0000 0712 1981 2875")], npv: G.npv(0.1, [-1000, 500, 500, 500]), irr: G.irr([-1000, 500, 500, 500]) }; });
    assert.strictEqual(r.a, 1234567.89); assert.strictEqual(r.b, -1500); assert.strictEqual(r.c, 1234567.89); assert.strictEqual(r.d, 3.14);
    assert.deepStrictEqual(r.nip, [true, false]); assert.deepStrictEqual(r.regon, [true, false]); assert.deepStrictEqual(r.iban, [true, false]);
    assert.ok(Math.abs(r.npv - 243.43) < 0.01); assert.ok(Math.abs(r.irr - 0.2338) < 0.0005);
  });

  await test("kalendarz: święta ruchome i przesunięcie terminu z niedzieli (25.10.2026 → 26.10.2026)", async () => {
    const r = await page.evaluate(() => { const G = window.__GF; const h = G.holidays(2026); return { easter: h.get("2026-04-06"), corpus: h.get("2026-06-04"), vat: G.deadlinesFor(2026, 9).filter(d => d.t.startsWith("JPK")).map(d => d.date.getDate()), zus: G.deadlinesFor(2026, 9).find(d => d.t.startsWith("ZUS")).date.getDate() }; });
    assert.strictEqual(r.easter, "Poniedziałek Wielkanocny"); assert.strictEqual(r.corpus, "Boże Ciało");
    assert.deepStrictEqual(r.vat, [26]); assert.strictEqual(r.zus, 20);
  });

  await test("samo otwarcie narzędzia nie nalicza czasu; praca w nim już tak", async () => {
    await page.evaluate(() => { localStorage.clear(); }); await page.reload();
    await go(page, "bud-var");
    assert.strictEqual(await page.textContent("#savedToday"), "0 min");
    await page.fill("#va_pp", "4"); await page.waitForTimeout(50);
    assert.strictEqual(await page.textContent("#savedToday"), "30 min");
  });

  await test("analiza odchyleń: wynik, istotność i nauka typu pozycji oraz przyczyny po przeładowaniu", async () => {
    await go(page, "bud-var");
    const k = await page.textContent("#res .kpis"); assert.ok(/−?-?388\s000\szł/u.test(k), k);
    const sel = page.locator('select[data-type]').nth(1);                  // „Pozostałe przychody operacyjne”
    await sel.selectOption("cost");
    await page.locator('input[data-cause="4"]').fill("kampania targowa"); await page.locator('input[data-cause="4"]').press("Tab");
    await page.waitForTimeout(200);
    await page.reload(); await go(page, "bud-var");
    const L = await learn(page);
    assert.strictEqual(L.varType["Pozostałe przychody operacyjne"], "cost");
    assert.strictEqual(L.varCause["Marketing"], "kampania targowa");
    assert.strictEqual(await page.locator('input[data-cause="4"]').inputValue(), "kampania targowa");
  });

  await test("import XLSX bez bibliotek (ciągi wspólne, liczby, daty)", async () => {
    await go(page, "bud-var");
    await page.setInputFiles("#va_data_f", { name: "budzet.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: XLSX });
    await page.waitForFunction(() => document.querySelector("#va_data").value.includes("3950000,5"));
    const v = await page.inputValue("#va_data");
    assert.ok(v.includes("Przychody ze sprzedaży;4200000;3950000,5;31.08.2026"), v);
    await page.waitForSelector("#res table");
    assert.ok((await page.textContent("#res table")).includes("Energia"));
  });

  await test("uzgodnienia: 5 różnic z przyczynami (kwota, duplikat, tylko A, tylko B)", async () => {
    await go(page, "ap-recon");
    const rows = await page.locator("#res .tbl").first().locator("tbody tr").allTextContents();
    assert.strictEqual(rows.length, 5, rows.join("\n"));
    assert.ok(rows.some(r => r.includes("różnica kwoty") && r.includes("kursowa")));
    assert.ok(rows.some(r => r.includes("duplikat")));
  });

  await test("anomalie: wykrywa duplikat i kwotę pod progiem; „Normalne” uczy się wyjątku", async () => {
    await go(page, "aud-anom");
    const t = await page.textContent("#res"); assert.ok(t.includes("duplikat") && t.includes("tuż pod progiem") && t.includes("rachunek wielu kontrahentów"));
    const before = await page.locator("[data-ok]").count();
    await page.locator("[data-ok]").first().click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator("[data-ok]").count() < before);
    assert.ok(Object.keys((await learn(page)).anomOk).length >= 1);
    assert.ok((await page.textContent("#res .kpis")).includes("Znane wyjątki"));
  });

  await test("checklista: postęp, własny punkt i ukrywanie punktów „nie dotyczy” po dwóch okresach", async () => {
    await go(page, "ctl-gl");
    const item = "Uzgodnić rozrachunki wewnątrzgrupowe";
    for (const per of ["lipiec 2026", "sierpień 2026"]) { await page.fill("#ck_per", per); await page.locator("#ck_per").press("Tab"); await page.locator(`[data-na="${item}"]`).click(); }
    await page.fill("#ck_per", "wrzesień 2026"); await page.locator("#ck_per").press("Tab");
    assert.strictEqual(await page.locator(`[data-na="${item}"]`).count(), 0, "punkt powinien być ukryty");
    assert.ok((await page.textContent("#ck_learn")).includes("ukryłem 1"));
    await page.locator("#ck_groups input[type=checkbox]").first().check();
    assert.ok((await page.textContent("#ck_lbl")).startsWith("Wykonano 1 z"));
    await page.fill("#ck_t", "Uzgodnić saldo z bankiem w EUR"); await page.click('[data-a="add"]');
    await page.reload(); await go(page, "ctl-gl");
    assert.ok((await page.textContent("#ck_groups")).includes("Uzgodnić saldo z bankiem w EUR"));
  });

  await test("pisma: odsetki i rekompensata, daty DD.MM.RRRR, własny szablon zapamiętany", async () => {
    await go(page, "ap-remind");
    await page.fill("#t_kwota", "10 000"); await page.fill("#t_termin", "2026-01-01"); await page.fill("#t_zaplata", "2026-01-31"); await page.fill("#t_ref", "4,00"); await page.fill("#t_eur", "4,25");
    const info = await page.textContent("#tp_calc");
    assert.ok(/115,07\szł/u.test(info), info); assert.ok(info.includes("70 EUR") && /297,50/.test(info));
    await page.selectOption("#tp_var", "Nota odsetkowa");
    const out = await page.inputValue("#tp_out");
    assert.ok(out.includes("Termin płatności: 01.01.2026") && out.includes("Liczba dni opóźnienia: 30"), out);
    await page.click('[data-a="edit"]'); await page.fill("#tp_src", "MOJA NOTA {{klient}} {{odsetki}}"); await page.click('[data-a="save"]');
    await page.reload(); await go(page, "ap-remind");
    assert.ok((await page.inputValue("#tp_out")).startsWith("MOJA NOTA"));
  });

  await test("korekta sformułowań: polskie znaki, styl, kwoty i własna reguła", async () => {
    await go(page, "day-wording");
    const out = await page.inputValue("#w_out");
    for (const w of ["były niższe", "planowaliśmy", "ponieważ", "też spadły", "na akceptowalnym poziomie", "Marża wyniosła"]) assert.ok(out.includes(w), w + " w: " + out);
    assert.ok(/1\s250\s000 zł/u.test(out), out);
    await page.fill("#w_from", "klienci"); await page.fill("#w_to", "odbiorcy"); await page.click("#w_add");
    assert.ok((await page.inputValue("#w_out")).includes("odbiorcy przesunęli"));
  });

  await test("streszczenie: kwoty, daty, zobowiązania i kary", async () => {
    await go(page, "day-summary");
    const t = await page.textContent("#res");
    assert.ok(t.includes("3 450 zł") && t.includes("31.12.2027") && t.includes("karę umowną"), t.slice(0, 400));
  });

  await test("płynność 13 tygodni: ręczne nadpisanie jest zapamiętane", async () => {
    await go(page, "bud-cash13");
    await page.locator('input[data-k="oin"][data-i="2"]').fill("500 000"); await page.locator('input[data-k="oin"][data-i="2"]').press("Tab");
    await page.reload(); await go(page, "bud-cash13");
    assert.strictEqual((await page.locator('input[data-k="oin"][data-i="2"]').inputValue()).replace(/\s/g, ""), "500000");
  });

  await test("prognoza wybiera metodę z najmniejszym MAPE", async () => {
    await go(page, "bud-forecast");
    const rows = await page.locator("#res .tbl").first().locator("tbody tr").allTextContents();
    assert.ok(rows[0].includes("najlepsza")); assert.ok(rows.length >= 4);
  });

  await test("kalendarz podatkowy: eksport .ics do Outlooka", async () => {
    await go(page, "tax-cal");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#cal_ics")]);
    const ics = fs.readFileSync(await dl.path(), "utf8");
    assert.ok(ics.startsWith("BEGIN:VCALENDAR") && ics.includes("BEGIN:VEVENT") && ics.includes("SUMMARY:"));
  });

  await test("eksport tabeli do CSV z polskimi znakami (BOM, średnik)", async () => {
    await go(page, "fa-trend");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-x="csv"]')]);
    const csv = fs.readFileSync(await dl.path(), "utf8");
    assert.ok(csv.charCodeAt(0) === 0xfeff && csv.includes("Okres;Wartość;m/m"));
  });

  await test("pamięć: lista nauczonych rzeczy, „Zapomnij” i eksport JSON", async () => {
    await page.click("#openSettings"); await page.click('.tabs [data-tab="memory"]');
    const t = await page.textContent('[data-panel="memory"]');
    for (const w of ["Twoje reguły językowe", "Typy pozycji", "Znane wyjątki", "zwykle Cię nie dotyczą", "Twoje szablony pism"]) assert.ok(t.includes(w), w);
    const n = await page.locator("[data-forget]").count(); await page.locator("[data-forget]").first().click();
    assert.strictEqual(await page.locator("[data-forget]").count(), n - 1);
    await page.click('.tabs [data-tab="data"]');
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#exportBtn")]);
    const data = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
    assert.ok(data.learn && data.mods && data.stats);
    await page.click("#closeSettings");
  });

  await test("„Dla Ciebie” pokazuje używane narzędzia i najbliższe terminy", async () => {
    await page.evaluate(() => { location.hash = ""; }); await page.click('#areas [data-v="home"]');
    const t = await page.textContent("#main");
    assert.ok(t.includes("Najbliższe terminy")); assert.ok(/użyte \d+×/.test(t));
    await page.screenshot({ path: path.join(SHOTS, "offline-home.png") });
    await go(page, "bud-var"); await page.screenshot({ path: path.join(SHOTS, "offline-odchylenia.png") });
  });

  await test("telefon 390 px: brak poziomego przewijania strony", async () => {
    const { ctx: c2, page: p2 } = await newPage({ viewport: { width: 390, height: 844 } });
    for (const id of ["", "bud-var", "ap-remind", "ctl-gl", "tax-cal"]) { if (id) await go(p2, id); const over = await p2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); assert.ok(over <= 0, `${id || "start"}: ${over}px`); }
    await p2.screenshot({ path: path.join(SHOTS, "offline-mobile.png") });
    await c2.close();
  });

  await test("tryb ciemny", async () => {
    const { ctx: c3, page: p3 } = await newPage({ dark: true });
    assert.strictEqual(await p3.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(11, 18, 16)");
    await c3.close();
  });

  await test("brak błędów JavaScript i żądań sieciowych w całej sesji", async () => {
    assert.deepStrictEqual(errors, []); assert.strictEqual(netRequests, 0);
  });

  await ctx.close(); await browser.close();
  const failed = results.filter(r => r[0] === "fail").length;
  console.log(`\n${results.length - failed}/${results.length} testów zaliczonych`);
  process.exit(failed ? 1 : 0);
})();
