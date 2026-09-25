// Testy end-to-end „Godziny Finansisty” (Playwright, Chromium).
// Uruchomienie: npm test   (albo: NODE_PATH=$(npm root -g) node tests/e2e.cjs)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const assert = require("assert");

const FILE = "file://" + path.resolve(__dirname, "../dist/index.html");
const results = [];
async function test(name, fn) {
  try { await fn(); results.push(["ok", name]); console.log("  ✓ " + name); }
  catch (e) { results.push(["fail", name, e]); console.log("  ✗ " + name + "\n    " + (e && e.message)); }
}

// Atrapa window.claude.use("sample") — tak jak w przeglądarce artefaktów claude.ai
const FAKE_CLAUDE = `
  window.__calls = [];
  const fake = async (input, opts={}) => {
    window.__calls.push({input, opts: {modelTier: opts.modelTier}});
    const text = "## Podsumowanie\\nPrzychody **niższe** o 250 000 zł.\\n\\n| Pozycja | Budżet | Wykonanie |\\n|---|---|---|\\n| Przychody | 4 200 000 | 3 950 000 |\\n\\n- [ ] Sprawdzić marketing\\n\\n<script>window.__xss=1</script>";
    await new Promise(r => setTimeout(r, 30));
    opts.onText && opts.onText({ text: text.slice(0, 20), delta: text.slice(0, 20) });
    await new Promise(r => setTimeout(r, 30));
    opts.onText && opts.onText({ text, delta: text.slice(20) });
    return { text, truncated: false };
  };
  fake.json = async (input) => { window.__calls.push({input, json:true}); return [{regula:"Podawaj kwoty w tys. zł z jednym miejscem po przecinku", zakres:"globalna"},{regula:"Dodawaj kolumnę z udziałem procentowym", zakres:"zadanie"}]; };
  fake.limits = async () => ({ maxInputBytes: 65536 });
  window.claude = { use: async (n) => n === "sample" ? fake : null };
`;

(async () => {
  const browser = await chromium.launch({ executablePath: fs.existsSync("/opt/pw-browsers/chromium") ? undefined : undefined });
  const errors = [];
  const newPage = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
    if (opts.fake) await ctx.addInitScript(FAKE_CLAUDE);
    const page = await ctx.newPage();
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error" && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.goto(FILE);
    return { ctx, page };
  };

  console.log("Godzina Finansisty — testy");
  const { ctx, page } = await newPage({ fake: true });

  await test("katalog: 45 zadań, 11 obszarów, wszystkie mają szablon i format", async () => {
    const info = await page.evaluate(() => { const T = window.__GF.T; return { n: T.length, bad: T.filter(t => !t.task || !t.fmt || !t.role || !t.v.length).map(t => t.id), ph: T.filter(t => (t.task.match(/\{\{(\w+)\}\}/g) || []).some(p => !t.v.find(v => "{{" + v.k + "}}" === p))).map(t => t.id) }; });
    assert.strictEqual(info.n, 45); assert.deepStrictEqual(info.bad, []); assert.deepStrictEqual(info.ph, [], "niezdefiniowane zmienne w: " + info.ph);
    assert.strictEqual(await page.locator("#areas button[data-v]").count(), 14);
  });

  await test("start w stanie roboczym: kreator otwarty z przykładem", async () => {
    assert.ok((await page.textContent("#cpTitle")).length > 3);
    assert.ok((await page.textContent("#preview")).includes("<zadanie>"));
  });

  await test("wyszukiwanie „KSeF” znajduje zadanie KSeF", async () => {
    await page.fill("#q", "KSeF");
    assert.ok(await page.locator('.card[data-id="tax-ksef"]').count() === 1);
    await page.fill("#q", "");
  });

  await test("filtr obszaru „Zespół audytu” pokazuje 5 zadań", async () => {
    await page.click('#areas button[data-v="aud"]');
    assert.strictEqual(await page.locator("#catalog .card").count(), 5);
  });

  await test("prompt: struktura XML, dane przykładowe, zmiana trybu", async () => {
    await page.click('#areas button[data-v="bud"]');
    await page.click('.card[data-id="bud-var"]');
    let p = await page.textContent("#preview");
    for (const tag of ["<rola>", "<zadanie>", "<tryb>", "<dane_wejsciowe>", "<wymagania>", "<format_odpowiedzi>"]) assert.ok(p.includes(tag), "brak " + tag);
    assert.ok(p.includes("Marketing;180 000;236 000"));
    await page.click('#mode button[data-m="guide"]');
    p = await page.textContent("#preview");
    assert.ok(p.includes("przewodnik krok po kroku"));
    await page.click('#mode button[data-m="do"]');
  });

  await test("profil firmy trafia do promptu", async () => {
    await page.click("#openSettings");
    await page.fill("#p_firma", "Alfa Produkcja sp. z o.o.");
    await page.fill("#p_erp", "Comarch ERP XL");
    await page.click("#closeSettings");
    const p = await page.textContent("#preview");
    assert.ok(p.includes("<kontekst_firmy>") && p.includes("Alfa Produkcja") && p.includes("Comarch ERP XL"));
  });

  await test("uruchomienie w Claude: streaming, tabela Markdown, brak XSS", async () => {
    await page.click("#runBtn");
    await page.waitForSelector("#outMd table");
    assert.ok((await page.textContent("#outMd h3, #outMd h2")).includes("Podsumowanie"));
    assert.strictEqual(await page.evaluate(() => window.__xss), undefined);
    assert.ok((await page.innerHTML("#outMd")).includes("&lt;script&gt;"));
    const tier = await page.evaluate(() => window.__calls[0].opts.modelTier);
    assert.strictEqual(tier, "default");
  });

  await test("zegar liczy zaoszczędzone minuty (30 min za analizę odchyleń)", async () => {
    assert.ok((await page.textContent("#savedToday")).startsWith("30 min"));
  });

  await test("samouczenie z oceny: reguły trafiają do kolejnego promptu", async () => {
    await page.click("#rDown");
    await page.fill("#rateNote", "Za dużo tekstu, chcę kwoty w tys. zł");
    await page.click("#rateSave");
    await page.waitForFunction(() => document.querySelector("#preview").textContent.includes("<preferencje_uzytkownika>"));
    const p = await page.textContent("#preview");
    assert.ok(p.includes("Podawaj kwoty w tys. zł") && p.includes("Dodawaj kolumnę z udziałem procentowym"));
    const L = await page.evaluate(() => window.__GF.M().lessons.map(l => l.scope));
    assert.deepStrictEqual(L.sort(), ["bud-var", "global"]);
  });

  await test("reguła globalna działa też w innym zadaniu, reguła zadania nie", async () => {
    await page.click('#areas button[data-v="day"]');
    await page.click('.card[data-id="day-email"]');
    const p = await page.textContent("#preview");
    assert.ok(p.includes("Podawaj kwoty w tys. zł"));
    assert.ok(!p.includes("Dodawaj kolumnę z udziałem procentowym"));
  });

  await test("nauka z ręcznych poprawek wywołuje Claude i nie dubluje reguł", async () => {
    await page.click("#runBtn");
    await page.waitForSelector("#outMd table");
    await page.click("#editBtn");
    await page.fill("#editOut", "Krótko: przychody -250 tys. zł.");
    await page.click("#learnEdit");
    await page.waitForFunction(() => window.__calls.filter(c => c.json).length === 2);
    const n = await page.evaluate(() => window.__GF.M().lessons.length);
    assert.ok(n >= 2 && n <= 3, "reguł: " + n);
  });

  await test("„Dla Ciebie” uczy się z użycia i pokazuje powód", async () => {
    await page.click('#areas button[data-v="for-you"]');
    const first = await page.locator("#catalog .grid").first().locator(".card").first();
    const id = await first.getAttribute("data-id");
    assert.ok(["bud-var", "day-email"].includes(id), "pierwsza karta: " + id);
    assert.ok((await first.textContent()).includes("użyte"));
  });

  await test("pamięć przetrwa przeładowanie strony (wartości, reguły, statystyki)", async () => {
    await page.click('#areas button[data-v="bud"]');
    await page.click('.card[data-id="bud-var"]');
    await page.fill("#f_okres", "wrzesień 2026");
    await page.click("#copyBtn");
    await page.waitForTimeout(300);
    await page.reload();
    await page.click('#areas button[data-v="bud"]');
    await page.click('.card[data-id="bud-var"]');
    assert.strictEqual(await page.inputValue("#f_okres"), "wrzesień 2026");
    const s = await page.evaluate(() => window.__GF.M().stats["bud-var"]);
    assert.ok(s.uses >= 2 && s.dislikes === 1);
    assert.ok((await page.textContent("#learnbox")).includes("Stosuję"));
  });

  await test("załącznik CSV trafia do promptu", async () => {
    await page.setInputFiles("#file", { name: "saldo.csv", mimeType: "text/csv", buffer: Buffer.from("Kontrahent;Saldo\nDelta;48 600,00\n") });
    await page.waitForFunction(() => document.querySelector("#preview").textContent.includes('<plik nazwa="saldo.csv">'));
  });

  await test("kalendarz finansisty: 25 września → sezon budżetowy i JPK", async () => {
    const h = await page.evaluate(() => window.__GF.calendarHints(new Date(2026, 8, 25)));
    assert.ok(h["bud-create"] && h["tax-filing"]);
    const h2 = await page.evaluate(() => window.__GF.calendarHints(new Date(2026, 9, 3)));
    assert.ok(h2["ctl-gl"] && h2["ap-recon"]);
  });

  await test("eksport pamięci do JSON", async () => {
    await page.click("#openSettings");
    await page.click('.tabs button[data-tab="data"]');
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#exportBtn")]);
    const data = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
    assert.ok(data.lessons.length >= 2 && data.profile.firma === "Alfa Produkcja sp. z o.o.");
    await page.click('.tabs button[data-tab="stats"]');
    assert.ok((await page.textContent("#statTiles")).includes("uruchomionych"));
    await page.click("#closeSettings");
  });

  await test("brak połączenia z Claude: przycisk kopiuje prompt do schowka", async () => {
    const { ctx: c2, page: p2 } = await newPage();
    await p2.click('.card[data-id="day-email"]');
    const [popup] = await Promise.all([p2.waitForEvent("popup").catch(() => null), p2.click("#runBtn")]);
    await p2.waitForFunction(() => document.querySelector("#status").textContent.includes("Skopiowano"));
    const clip = await p2.evaluate(() => navigator.clipboard.readText());
    assert.ok(clip.includes("<zadanie>"));
    if (popup) await popup.close();
    await c2.close();
  });

  await test("telefon 390 px: brak poziomego przewijania, kreator jako panel", async () => {
    const { ctx: c3, page: p3 } = await newPage({ viewport: { width: 390, height: 844 } });
    const over = await p3.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(over <= 0, "przelew: " + over + "px");
    await p3.click('.card[data-id="bud-var"]');
    await p3.waitForTimeout(300);
    const box = await p3.locator("#composer").boundingBox();
    assert.ok(box.x >= 0 && box.x < 5, "panel x=" + box.x);
    await p3.screenshot({ path: path.resolve(__dirname, "../docs/mobile.png") });
    await c3.close();
  });

  await test("tryb ciemny renderuje się poprawnie", async () => {
    const c4 = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    await c4.addInitScript(FAKE_CLAUDE);
    const p4 = await c4.newPage(); await p4.goto(FILE);
    const bg = await p4.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert.strictEqual(bg, "rgb(11, 18, 16)");
    await p4.screenshot({ path: path.resolve(__dirname, "../docs/dark.png") });
    await c4.close();
  });

  await page.click('#areas button[data-v="for-you"]');
  await page.click('.card[data-id="bud-var"]');
  await page.click("#runBtn"); await page.waitForSelector("#outMd table");
  await page.screenshot({ path: path.resolve(__dirname, "../docs/desktop.png") });

  await test("brak błędów JavaScript w konsoli", async () => { assert.deepStrictEqual(errors, []); });

  await ctx.close(); await browser.close();
  const failed = results.filter(r => r[0] === "fail").length;
  console.log(`\n${results.length - failed}/${results.length} testów zaliczonych`);
  process.exit(failed ? 1 : 0);
})();
