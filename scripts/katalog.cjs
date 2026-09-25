// Generuje claude-skill/godzina-finansisty/katalog.md z katalogu zadań w aplikacji HTML.
const fs = require("fs"), vm = require("vm"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "../app/godzina-finansisty.html"), "utf8");
const block = src.slice(src.indexOf("const AREAS = ["), src.indexOf("const byId"));
const ctx = {}; vm.runInNewContext(block + ";this.AREAS=AREAS;this.T=T;", ctx);
const { AREAS, T } = ctx;
let md = "# Katalog zadań\n\nWygenerowano automatycznie z `app/godzina-finansisty.html` (`npm run katalog`). `{{zmienna}}` to dane od użytkownika.\n";
for (const a of AREAS) {
  md += `\n## ${a.name}\n`;
  for (const t of T.filter(x => x.a === a.id)) {
    md += `\n### ${t.t} \`${t.id}\`${t.nw ? " (nowość 2026)" : ""}\n\n`;
    md += `- **Opis:** ${t.d} Oszczędność: ok. ${t.min} min.\n- **Rola:** ${t.role}\n`;
    md += `- **Zmienne:** ${t.v.map(v => `\`${v.k}\` (${v.l}${v.o ? ": " + v.o.join(" / ") : ""})`).join(", ")}\n`;
    md += `- **Zadanie:** ${t.task.replace(/\n+/g, " ")}\n- **Format:** ${t.fmt}\n`;
  }
}
fs.writeFileSync(path.join(__dirname, "../claude-skill/godzina-finansisty/katalog.md"), md);
console.log(`katalog.md: ${T.length} zadań`);
