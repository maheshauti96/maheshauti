import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/theme.css"), "utf8");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatMonth(iso) {
  const [year, month] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

function span(start, end) {
  const from = formatMonth(start);
  if (!end) return `${from} to present`;
  return `${from} to ${formatMonth(end)}`;
}

function groupRoles(roles) {
  const groups = [];
  for (const role of roles) {
    const last = groups.at(-1);
    if (last && last.org === role.org) last.titles.push(role);
    else {
      groups.push({
        org: role.org,
        orgUrl: role.orgUrl,
        location: role.location,
        titles: [role],
      });
    }
  }
  return groups;
}

const THEME_BOOT = `(function(){var t="light";try{var s=localStorage.getItem("ma-theme");t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}document.documentElement.setAttribute("data-theme",t)})();`;

const SUN = `<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4"/></svg>`;
const MOON = `<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 14.3A8.4 8.4 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>`;

function jsonLd(site) {
  const current = site.roles.find((role) => role.end === null);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.person.name,
    url: site.origin,
    image: `${site.origin}${site.person.photo.src}`,
    jobTitle: current ? current.title : undefined,
    worksFor: current
      ? {
          "@type": "Organization",
          name: current.org,
          url: current.orgUrl || undefined,
        }
      : undefined,
    sameAs: site.reach.map((item) => item.href),
    knowsAbout: [
      "full-stack development",
      "AI agents",
      "agent orchestration",
    ],
  };
}

function productLogo(product) {
  if (!product.logo) return "";
  const ink = product.logo.endsWith(".svg") ? " product-logo-ink" : "";
  return `<span class="product-logo-wrap"><img class="product-logo${ink}" src="${esc(product.logo)}" alt="" width="48" height="48"></span>`;
}

function productBlock(product) {
  const link = product.url
    ? `<a href="${esc(product.url)}">${esc(product.name)}</a>`
    : esc(product.name);
  const extra =
    product.repo && product.repo !== product.url
      ? ` <a href="${esc(product.repo)}">Source</a>.`
      : "";
  return `<article class="item product">
      ${productLogo(product)}
      <div class="product-copy">
        <h3>${link}</h3>
        <p>${esc(product.oneLiner)}${extra}</p>
      </div>
    </article>`;
}

function roleBlock(group) {
  const name = group.orgUrl
    ? `<a href="${esc(group.orgUrl)}">${esc(group.org)}</a>`
    : esc(group.org);
  const titles = group.titles
    .map((role) => {
      const note = role.notes[0] ? `<p>${esc(role.notes[0])}</p>` : "";
      return `<li>
        <strong>${esc(role.title)}</strong>
        <span class="meta"> · ${esc(span(role.start, role.end))} · ${esc(role.location)}</span>
        ${note}
      </li>`;
    })
    .join("");
  return `<article class="item">
      <h3>${name}</h3>
      <ul class="titles">${titles}</ul>
    </article>`;
}

export function renderHome(site) {
  const live = site.products.filter((p) => p.status === "live");
  const building = site.products.filter((p) => p.status === "building");
  const current = site.roles.find((role) => role.end === null);
  const groups = groupRoles(site.roles);
  const doors = site.doors
    .map(
      (door, i) =>
        `<a class="btn${i === 0 ? " btn-fill" : ""}" href="${esc(door.href)}">${esc(door.label)}</a>`,
    )
    .join("");
  const writing = site.writing
    .map(
      (piece) => `<article class="item">
      <h3><a href="${esc(piece.href)}" rel="noopener">${esc(piece.title)}</a></h3>
      <p class="meta">${esc(formatMonth(piece.date.slice(0, 7)))}</p>
      <p class="dek">${esc(piece.dek)}</p>
    </article>`,
    )
    .join("");
  const reach = site.reach
    .map((item) => `<li><a href="${esc(item.href)}" rel="noopener">${esc(item.label)}</a></li>`)
    .join("");
  const now = current
    ? `<p class="now">${esc(current.title)} at ${
        current.orgUrl
          ? `<a href="${esc(current.orgUrl)}">${esc(current.org)}</a>`
          : esc(current.org)
      }.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(site.person.name)}</title>
  <meta name="description" content="${esc(site.person.who)} ${esc(site.person.how)}">
  <link rel="canonical" href="${esc(site.origin)}/">
  <meta property="og:site_name" content="${esc(site.person.name)}">
  <meta property="og:title" content="${esc(site.person.name)}">
  <meta property="og:description" content="${esc(site.person.who)} ${esc(site.person.how)}">
  <meta property="og:url" content="${esc(site.origin)}/">
  <meta property="og:image" content="${esc(site.origin)}${esc(site.person.photo.src)}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(site.person.name)}">
  <meta name="twitter:description" content="${esc(site.person.who)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#f4f1ea">
  <meta name="color-scheme" content="light dark">
  <script>${THEME_BOOT}</script>
  <style>${css}</style>
  <script type="application/ld+json">${JSON.stringify(jsonLd(site))}</script>
</head>
<body>
  <a class="skip" href="#identity">Skip to content</a>
  <header class="nav wrap">
    <a class="mark" href="/">${esc(site.person.name)}</a>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Toggle color theme">${MOON}${SUN}</button>
      ${doors}
    </div>
  </header>
  <main class="wrap">
    <section class="hero" id="identity">
      <img class="portrait" src="${esc(site.person.photo.src)}" alt="${esc(site.person.photo.alt)}" width="88" height="88">
      <h1>${esc(site.person.name)}</h1>
      <p class="who">${esc(site.person.who)}</p>
      <p class="how">${esc(site.person.how)}</p>
      ${now}
      <p class="doors">${doors}</p>
    </section>
    <section id="ship">
      <h2>Shipped</h2>
      ${live.map(productBlock).join("")}
    </section>
    ${
      building.length
        ? `<section id="building">
      <h2>Building</h2>
      ${building.map(productBlock).join("")}
    </section>`
        : ""
    }
    <section id="work">
      <h2>Work</h2>
      ${groups.map(roleBlock).join("")}
    </section>
    <section id="writing" class="writing">
      <h2>Writing</h2>
      ${writing}
    </section>
    <section id="reach">
      <h2>Talk</h2>
      <p>Founders, start on X. LinkedIn works too.</p>
      <ul class="reach">${reach}</ul>
    </section>
  </main>
  <footer class="wrap">
    <p>${esc(site.person.location)}. ${esc(site.person.aside)}</p>
    <p><a href="${esc(site.origin)}/">${esc(site.origin.replace("https://", ""))}</a></p>
  </footer>
  <script src="/js/theme.js"></script>
</body>
</html>
`;
}

export function render404(site) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Not here · ${esc(site.person.name)}</title>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${esc(site.origin)}/">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="color-scheme" content="light dark">
  <script>${THEME_BOOT}</script>
  <style>${css}</style>
</head>
<body>
  <header class="nav wrap">
    <a class="mark" href="/">${esc(site.person.name)}</a>
  </header>
  <main class="wrap hero">
    <h1>This page is not here.</h1>
    <p><a href="/">Go to the home page.</a></p>
  </main>
  <script src="/js/theme.js"></script>
</body>
</html>
`;
}

export { css };
