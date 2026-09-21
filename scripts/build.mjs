import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../content/site.mjs";
import { renderHome, render404 } from "./render.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

const FORBIDDEN = [
  /mailto:/i,
  /founder of quattr/i,
  /quattr founder/i,
  /i founded quattr/i,
  /passionate/i,
  /revolutionizing/i,
  /cutting-edge/i,
  /sinhgad/i,
  /parner/i,
  /ahmednagar/i,
  /vidyartha\.org/i,
  /openseo\.so/i,
  /vf-theme/,
  /#00708f/i,
  /#00789b/i,
  /#5cc8e4/i,
];

function check(text, path) {
  const failures = [];
  for (const rule of FORBIDDEN) {
    if (rule.test(text)) failures.push(`${path}: matched ${rule}`);
  }
  if (path.endsWith("index.html")) {
    if (!text.includes("Acting Engineering Manager")) {
      failures.push(`${path}: missing current title`);
    }
    if (!text.includes("vortexflow.io")) {
      failures.push(`${path}: missing VortexFlow`);
    }
    if (!text.includes("github.com/maheshauti96/Limbo")) {
      failures.push(`${path}: missing Limbo`);
    }
    if (/codenotch/i.test(text)) {
      failures.push(`${path}: Codenotch must not appear`);
    }
    if (!text.includes("https://x.com/MaheshBauti")) {
      failures.push(`${path}: missing X door`);
    }
    if (!text.includes("I help founders go from idea to launch.")) {
      failures.push(`${path}: missing offer`);
    }
  }
  if (failures.length) {
    throw new Error(failures.join("\n"));
  }
}

function write(path, body) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  check(typeof body === "string" ? body : "", path.replace(root + "/", ""));
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#1c1917"/>
  <text x="16" y="22" text-anchor="middle" font-size="16" font-family="system-ui, sans-serif" font-weight="700" fill="#f4f1ea">M</text>
</svg>
`;

const robots = `User-agent: *
Allow: /
Sitemap: ${site.origin}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.origin}/</loc></url>
</urlset>
`;

mkdirSync(join(docs, "img"), { recursive: true });
mkdirSync(join(docs, "js"), { recursive: true });
mkdirSync(join(docs, "css"), { recursive: true });

write(join(docs, "index.html"), renderHome(site));
write(join(docs, "404.html"), render404(site));
write(join(docs, "CNAME"), "maheshauti.com\n");
write(join(docs, ".nojekyll"), "");
write(join(docs, "robots.txt"), robots);
write(join(docs, "sitemap.xml"), sitemap);
write(join(docs, "favicon.svg"), favicon);
copyFileSync(join(root, "src/theme.js"), join(docs, "js/theme.js"));
copyFileSync(join(root, "src/theme.css"), join(docs, "css/site.css"));
copyFileSync(join(root, "img/mahesh.jpg"), join(docs, "img/mahesh.jpg"));

const roundTrip = readFileSync(join(docs, "index.html"), "utf8");
if (roundTrip !== renderHome(site)) {
  throw new Error("docs/index.html did not round-trip");
}

console.log("Wrote docs/ for GitHub Pages.");
console.log("Apex A records:");
for (const ip of site.dns.apexA) console.log(`  ${ip}`);
console.log(`www CNAME: ${site.dns.wwwCname}`);
