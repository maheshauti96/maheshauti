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
        logo: role.logo,
        location: role.location,
        titles: [role],
      });
    }
  }
  return groups;
}

function yearRange(group) {
  const start = group.titles.at(-1).start.slice(0, 4);
  const latest = group.titles[0];
  const end = latest.end ? latest.end.slice(0, 4) : "Present";
  return start === end ? start : `${start} to ${end}`;
}

const THEME_BOOT = `(function(){var t="dark";try{var s=localStorage.getItem("ma-theme");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})();`;

const SUN = `<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4"/></svg>`;
const MOON = `<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 14.3A8.4 8.4 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>`;
const BATTERY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="18" height="10" rx="2"/><rect x="4.2" y="9.2" width="13.6" height="5.6" fill="currentColor" stroke="none"/><path d="M22 10v4"/></svg>`;

const SOCIAL_ICONS = {
  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
};

const CHECK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`;
const CLOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
const BRIEF = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`;
const BOOK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`;

function socialIcon(kind) {
  return SOCIAL_ICONS[kind] || "";
}

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

function mark(src, ink) {
  if (!src) return "";
  const wrap = ink ? " ink" : "";
  return `<span class="card-mark-wrap${wrap}"><img class="card-mark" src="${esc(src)}" alt="" width="56" height="56"></span>`;
}

function hostLabel(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function vortexSpiralDemo() {
  return `<div class="play vortex-play" data-vortex-play>
      <div class="play-head">
        <span>VortexFlow Spiral Overlay</span>
        <span class="hot">Archimedean radial layout</span>
      </div>
      <div class="spiral-stage">
        <vortex-spiral glass appearance="dark" instant static nohint></vortex-spiral>
      </div>
      <p class="play-status">Windows fan out from your pointer in an Archimedean radial spiral. Hover or tap wedges to inspect window focus in the central hub.</p>
    </div>`;
}

function sessionStream() {
  const rows = [
    {
      id: "cursor",
      name: "Cursor",
      project: "site-redesign",
      status: "running",
      dot: "dot-run",
      st: "st-run",
      on: true,
    },
    {
      id: "claude",
      name: "Claude",
      project: "analytics-pipeline",
      status: "idle",
      dot: "dot-idle",
      st: "st-idle",
      on: false,
    },
    {
      id: "grok",
      name: "Grok 4.6",
      project: "portfolio-research",
      status: "stream",
      dot: "dot-stream",
      st: "st-stream",
      on: false,
    },
    {
      id: "codex",
      name: "Codex",
      project: "eval-harness",
      status: "active",
      dot: "dot-work",
      st: "st-work",
      on: false,
    },
  ];
  const list = rows
    .map(
      (row) => `<button type="button" class="stream-row${row.on ? " is-on" : ""}" data-session="${esc(row.id)}">
        <span class="stream-dot ${row.dot}"></span>
        <strong>${esc(row.name)}</strong>
        <span class="proj">${esc(row.project)}</span>
        <span class="st ${row.st}">${esc(row.status)}</span>
      </button>`,
    )
    .join("");
  return `<div class="stream" data-sessions>
      <div class="play-head">
        <span>Discovered local sessions</span>
        <span class="ok">Zero network egress</span>
      </div>
      ${list}
      <p class="stream-log" data-session-log>Active Cursor session · process: cursor-agent-worker · local file locks verified</p>
    </div>`;
}

function productCard(product) {
  const id = product.name === "Limbo" ? ' id="limbo"' : "";
  const badge =
    product.name === "Limbo"
      ? `<span class="badge badge-ok">Coding agent session board</span>`
      : `<span class="badge">macOS window switcher · MIT</span>`;
  const demo =
    product.name === "VortexFlow"
      ? vortexSpiralDemo()
      : product.name === "Limbo"
        ? sessionStream()
        : "";
  const link = product.url
    ? `<a href="${esc(product.url)}" rel="noopener">${esc(product.name)}</a>`
    : esc(product.name);
  const primary = product.url
    ? `<a href="${esc(product.url)}" rel="noopener">${esc(hostLabel(product.url))} ↗</a>`
    : "";
  const source =
    product.repo && product.repo !== product.url
      ? `<a class="quiet" href="${esc(product.repo)}" rel="noopener">Source ↗</a>`
      : "";
  return `<article class="card"${id}>
      <div>
        <div class="card-head">
          ${mark(product.logo, product.logoInk)}
          <div>
            <h3>${link}</h3>
            ${badge}
          </div>
        </div>
        <p class="card-desc">${esc(product.oneLiner)}</p>
        ${demo}
      </div>
      <div class="card-links">${primary}${source}</div>
    </article>`;
}

function careerRow(group) {
  const name = group.orgUrl
    ? `<a href="${esc(group.orgUrl)}" rel="noopener">${esc(group.org)}</a>`
    : esc(group.org);
  const titles = group.titles
    .map((role) => {
      const note = role.notes[0] ? `<p>${esc(role.notes[0])}</p>` : "";
      return `<li>
        <strong>${esc(role.title)}</strong>
        <span class="when"> · ${esc(span(role.start, role.end))} · ${esc(role.location)}</span>
        ${note}
      </li>`;
    })
    .join("");
  return `<article class="career-row">
      ${mark(group.logo, false)}
      <div>
        <h3>${name}</h3>
        <ul class="titles">${titles}</ul>
      </div>
      <p class="career-meta">${esc(group.location)}<br>${esc(yearRange(group))}</p>
    </article>`;
}

function foundationCard(item) {
  return `<article class="mind-card">
      <em>${esc(item.code)} // ${esc(item.lens)}</em>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.body)}</p>
    </article>`;
}

function writingCard(piece) {
  return `<a class="write-card" href="${esc(piece.href)}" rel="noopener">
      <div>
        <h3>${esc(piece.title)}</h3>
        <p>${esc(piece.dek)}</p>
      </div>
      <span class="write-when">${esc(formatMonth(piece.date.slice(0, 7)))} ↗</span>
    </a>`;
}

function btn(href, kind, label, style, aria) {
  const mark = socialIcon(kind);
  const named = aria ? ` aria-label="${esc(aria)}"` : "";
  return `<a class="btn ${style}" href="${esc(href)}" rel="noopener"${named}>${mark}<span>${esc(label)}</span></a>`;
}

function head(site, { title, description, robots }) {
  const desc = description
    ? `  <meta name="description" content="${esc(description)}">\n`
    : "";
  const robotsTag = robots
    ? `  <meta name="robots" content="${esc(robots)}">\n`
    : "";
  const social = description
    ? `  <meta property="og:site_name" content="${esc(site.person.name)}">
  <meta property="og:title" content="${esc(site.person.name)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(site.origin)}/">
  <meta property="og:image" content="${esc(site.origin)}${esc(site.person.photo.src)}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(site.person.name)}">
  <meta name="twitter:description" content="${esc(site.person.who)}">\n`
    : "";
  const schema = description
    ? `  <script type="application/ld+json">${JSON.stringify(jsonLd(site))}</script>\n`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
${desc}${robotsTag}  <link rel="canonical" href="${esc(site.origin)}/">
${social}  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#05060c">
  <meta name="color-scheme" content="dark light">
  <script>${THEME_BOOT}</script>
  <style>${css}</style>
  <script src="/js/vortex-glass.js" defer></script>
  <script src="/js/vortex-spiral.js" defer></script>
${schema}</head>`;
}

function menubar(site, { nav }) {
  const links = nav
    ? `<nav class="menubar-nav" aria-label="Sections">
        <a href="#overview" data-jump="overview">Overview</a>
        <a href="#shipped" data-jump="shipped">Shipped</a>
        <a href="#foundations" data-jump="foundations">Foundations</a>
        <a href="#track" data-jump="track">Track Record</a>
        <a href="#writing" data-jump="writing">Writing</a>
        <a href="#inbound" data-jump="inbound">Direct Line</a>
      </nav>`
    : "";
  const live = nav
    ? `<a class="limbo-pill" href="#limbo" data-jump="limbo" title="Limbo: 4 sessions">
        <img src="/img/products/limbo.svg" alt="">
        <span>LIMBO: 4 SESSIONS</span>
      </a>`
    : "";
  return `<header class="menubar">
    <div class="menubar-start">
      <span class="apple" aria-hidden="true"></span>
      <a class="mark" href="/">${esc(site.person.name)}</a>
      ${links}
    </div>
    <div class="menubar-end">
      ${live}
      <span class="battery" title="Battery">${BATTERY}<span>100%</span></span>
      <time class="clock" data-ist-clock>IST</time>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Toggle color theme">${MOON}${SUN}</button>
    </div>
  </header>`;
}

export function renderHome(site) {
  const live = site.products.filter((p) => p.status === "live");
  const current = site.roles.find((role) => role.end === null);
  const groups = groupRoles(site.roles);
  const x = site.doors.find((door) => door.kind === "x");
  const linkedin = site.doors.find((door) => door.kind === "linkedin");
  const github = site.reach.find((item) => item.kind === "github");
  const org = current
    ? current.orgUrl
      ? `<a href="${esc(current.orgUrl)}" rel="noopener">${esc(current.org)}</a>`
      : esc(current.org)
    : "";
  const bio = current
    ? `${esc(current.title)} at ${org}. ${esc(site.person.how)}`
    : esc(site.person.how);
  const heroActions = [
    x ? btn(x.href, "x", x.label, "btn-solid") : "",
    linkedin ? btn(linkedin.href, "linkedin", "LinkedIn", "btn-ghost") : "",
    github
      ? btn(github.href, "github", github.label, "btn-ghost", "GitHub")
      : "",
  ].join("");
  const inboundActions = [
    x ? btn(x.href, "x", x.label, "btn-solid") : "",
    linkedin
      ? btn(linkedin.href, "linkedin", linkedin.label, "btn-ghost")
      : "",
  ].join("");

  return `${head(site, {
    title: site.person.name,
    description: `${site.person.who} ${site.person.how}`,
  })}
<body>
  <a class="skip" href="#overview">Skip to content</a>
  ${menubar(site, { nav: true })}
  <nav class="dock" data-dock aria-label="Page">
    <a href="#overview" data-jump="overview" class="is-on">Overview</a>
    <a href="#shipped" data-jump="shipped">Shipped</a>
    <a href="#foundations" data-jump="foundations">Foundations</a>
    <a href="#track" data-jump="track">Track Record</a>
    <a href="#writing" data-jump="writing">Writing</a>
    <span class="dock-sep"></span>
    <a class="dock-talk" href="#inbound" data-jump="inbound">Talk</a>
  </nav>
  <main class="stage">
    <section class="hero" id="overview" data-section>
      <div class="portrait-wrap">
        <img class="portrait" src="${esc(site.person.photo.src)}" alt="${esc(site.person.photo.alt)}" width="140" height="140">
        <p class="live-badge"><span class="beacon"></span><span>AVAILABLE</span></p>
      </div>
      <div>
        <h1>${esc(site.person.name)}</h1>
        <p class="pitch">${esc(site.person.who)}</p>
        <p class="bio">${bio}</p>
      </div>
      <div class="actions">${heroActions}</div>
    </section>
    <section id="shipped" data-section>
      <div class="sec-head">
        <h2 class="sec-title">${CHECK} Shipped Software &amp; Telemetry</h2>
        <p class="sec-tag">Tactile living proof</p>
      </div>
      <div class="ship-grid">${live.map(productCard).join("")}</div>
    </section>
    <section id="foundations" data-section>
      <div class="sec-head">
        <h2 class="sec-title">${CLOCK} Foundations &amp; Mental Models</h2>
        <p class="sec-tag">How I think and architect</p>
      </div>
      <div class="mind-grid">${site.foundations.map(foundationCard).join("")}</div>
    </section>
    <section id="track" data-section>
      <div class="sec-head">
        <h2 class="sec-title">${BRIEF} Career Track Record</h2>
        <p class="sec-tag">Hands-on leadership</p>
      </div>
      <div class="career">${groups.map(careerRow).join("")}</div>
    </section>
    <section id="writing" data-section>
      <div class="sec-head">
        <h2 class="sec-title">${BOOK} Published Writing</h2>
        <p class="sec-tag">Essays</p>
      </div>
      <div class="write-list">${site.writing.map(writingCard).join("")}</div>
    </section>
    <section class="inbound" id="inbound" data-section>
      <h2>Let's Build Together</h2>
      <p>${esc(site.person.who)} Founders, start on X. LinkedIn works too.</p>
      <div class="inbound-actions">${inboundActions}</div>
    </section>
  </main>
  <footer class="stage foot">
    <p>${esc(site.person.location)}. ${esc(site.person.aside)}</p>
    <p><a href="${esc(site.origin)}/">${esc(site.origin.replace("https://", ""))}</a></p>
  </footer>
  <script src="/js/theme.js" defer></script>
</body>
</html>
`;
}

export function render404(site) {
  return `${head(site, {
    title: `Not here · ${site.person.name}`,
    robots: "noindex",
  })}
<body>
  ${menubar(site, { nav: false })}
  <main class="stage lost">
    <h1>This page is not here.</h1>
    <p><a href="/">Go to the home page.</a></p>
  </main>
  <script src="/js/theme.js"></script>
</body>
</html>
`;
}

export { css };
