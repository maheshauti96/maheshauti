import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/theme.css"), "utf8");
const assets = Object.fromEntries([
  ["/css/site.css", "src/theme.css"],
  ["/js/theme.js", "src/theme.js"],
  ["/js/vortex-glass.js", "src/vortex-glass.js"],
  ["/js/vortex-spiral.js", "src/vortex-spiral.js"],
].map(([url, source]) => [url, `${url}?v=${createHash("sha256").update(readFileSync(join(root, source))).digest("hex").slice(0, 10)}`]));

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

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function postsByDate(site) {
  return [...site.writing].sort((a, b) => b.date.localeCompare(a.date));
}

function span(start, end) {
  const from = formatMonth(start);
  if (!end) return `${from} to present`;
  return `${from} to ${formatMonth(end)}`;
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

function yearsSince(iso, date = new Date()) {
  const [year, month] = iso.split("-").map(Number);
  const months = (date.getFullYear() - year) * 12 + date.getMonth() + 1 - month;
  return Math.floor(months / 12);
}

/** One row per page section. Drives the menubar, the tab bar, headings, and scrollspy. */
const SECTIONS = [
  { id: "overview", nav: null, tab: "Home", icon: "home" },
  {
    id: "shipped",
    nav: "Work",
    tab: "Work",
    icon: "box",
    title: "Small tools. Real impact.",
    dek: "macOS tools I built, use every day, and keep open source.",
  },
  {
    id: "foundations",
    nav: "Principles",
    tab: null,
    title: "How I work",
    dek: "The rules I hold myself to on every build, from first sketch to launch.",
  },
  {
    id: "track",
    nav: "Experience",
    tab: "Experience",
    icon: "brief",
    title: "Built along the way.",
    dek: "From intern to leading an engineering team, still writing the systems.",
  },
  {
    id: "writing",
    nav: "Blog",
    tab: "Blog",
    href: "/blog/",
    icon: "pen",
    title: "Notes from the work.",
    dek: "Essays on working with AI models, published on LinkedIn.",
  },
  { id: "inbound", nav: "Talk", tab: "Talk", icon: "chat" },
];

const THEME_BOOT = `(function(){var t="dark";try{var s=localStorage.getItem("ma-theme");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})();`;

const SUN = `<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4"/></svg>`;
const MOON = `<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 14.3A8.4 8.4 0 1 1 9.7 3 7 7 0 0 0 21 14.3z"/></svg>`;

const SOCIAL_ICONS = {
  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
};

const TAB_ICON = (d) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const TAB_ICONS = {
  home: TAB_ICON(`<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>`),
  box: TAB_ICON(`<path d="M12 3 4 7v10l8 4 8-4V7l-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>`),
  brief: TAB_ICON(`<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`),
  pen: TAB_ICON(`<path d="M4 20h4L18 10l-4-4L4 16v4z"/><path d="M13 7l4 4"/>`),
  chat: TAB_ICON(`<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.2A8 8 0 1 1 21 12z"/>`),
};

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

function plate(src, ink) {
  if (!src) return `<span class="plate plate-empty"></span>`;
  return `<span class="plate${ink ? " ink" : ""}"><img src="${esc(src)}" alt="" width="56" height="56"></span>`;
}

function btn(href, kind, label, style, aria) {
  const named = aria ? ` aria-label="${esc(aria)}"` : "";
  return `<a class="btn ${style}" href="${esc(href)}" rel="noopener"${named}>${socialIcon(kind)}<span>${esc(label)}</span></a>`;
}

function screen(title, body, note) {
  return `<div class="screen">
        <div class="screen-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(title)}</span><span class="demo-label">Interactive demo</span></div>
        <div class="screen-body">${body}</div>
        <p class="screen-note"${note.hook ? ` ${note.hook} role="status" aria-live="polite" aria-atomic="true"` : ""}>${esc(note.text)}</p>
      </div>`;
}

const SESSIONS = [
  { id: "cursor", name: "Cursor", icon: "/img/logos/cursor.png", project: "site-redesign", status: "running", tone: "run" },
  { id: "claude", name: "Claude", icon: "/img/logos/claude.png", project: "analytics-pipeline", status: "idle", tone: "idle" },
  { id: "grok", name: "Grok Build", icon: "/img/logos/grok.png", project: "portfolio-research", status: "stream", tone: "stream" },
  { id: "codex", name: "Codex", icon: "/img/logos/codex.svg", project: "eval-harness", status: "active", tone: "work" },
];

/** Keyed by `product.demo` in content/site.mjs. */
const DEMOS = {
  spiral: (product) =>
    screen(
      `${product.name} · spiral overlay`,
      `<div class="spiral-stage"><vortex-spiral glass appearance="dark" instant static nohint></vortex-spiral></div>`,
      { text: "Hover or tap a window to preview it in the hub." },
    ),
  sessions: (product) =>
    screen(
      `${product.name} · menu bar`,
      `<div class="stream" data-sessions>${SESSIONS.map(
        (row, i) => `<button type="button" class="stream-row${i === 0 ? " is-on" : ""}" aria-pressed="${i === 0}" data-session="${esc(row.id)}" data-tone="${esc(row.tone)}">
          <span class="stream-dot"></span>
          <img class="provider-icon" src="${esc(row.icon)}" alt="" width="18" height="18">
          <strong>${esc(row.name)}</strong>
          <span class="proj">${esc(row.project)}</span>
          <span class="st">${esc(row.status)}</span>
        </button>`,
      ).join("")}</div>`,
      {
        text: "Cursor is working on site-redesign. Select a session to explore this demo.",
        hook: "data-session-log",
      },
    ),
};

function featureRow(product, index) {
  const demo = DEMOS[product.demo];
  const name = product.url
    ? `<a href="${esc(product.url)}" rel="noopener">${esc(product.name)}</a>`
    : esc(product.name);
  const primary = product.url
    ? `<a href="${esc(product.url)}" rel="noopener">${esc(product.action)} <span aria-hidden="true">↗</span></a>`
    : "";
  const source =
    product.repo && product.repo !== product.url
      ? `<a class="quiet" href="${esc(product.repo)}" rel="noopener">Source ↗</a>`
      : "";
  return `<article class="feature" id="${slug(product.name)}">
      <div class="feature-copy">
        <div class="feature-top">${plate(product.logo, product.logoInk)}<span class="project-number">0${index + 1} / OPEN SOURCE</span></div>
        <p class="eyebrow">${esc(product.tag)}</p>
        <h3>${name}</h3>
        <p class="feature-desc">${esc(product.oneLiner)}</p>
        <ul class="product-details">${product.details.map((detail) => `<li>${esc(detail)}</li>`).join("")}</ul>
        <p class="feature-links">${primary}${source}</p>
      </div>
      <div class="feature-demo">${demo ? demo(product) : ""}</div>
    </article>`;
}

function principle(item) {
  return `<li class="principle">
      <p class="eyebrow">${esc(item.code)} · ${esc(item.lens)}</p>
      <h3>${esc(item.title)}</h3>
      <p>${esc(item.body)}</p>
    </li>`;
}

function orgRow(group) {
  const name = group.orgUrl
    ? `<a href="${esc(group.orgUrl)}" rel="noopener">${esc(group.org)}</a>`
    : esc(group.org);
  const titles = group.titles
    .map(
      (role) => `<li${role.end === null ? ' class="is-now"' : ""}>
          <strong>${esc(role.title)}</strong>
          <time datetime="${esc(role.start)}">${esc(span(role.start, role.end))}</time>
          ${role.notes[0] ? `<p>${esc(role.notes[0])}</p>` : ""}
        </li>`,
    )
    .join("");
  return `<li class="org">
      ${plate(group.logo, false)}
      <div class="org-body">
        <div class="org-head">
          <h3>${name}</h3>
          <p class="org-meta">${esc(yearRange(group))} · ${esc(group.location)}</p>
        </div>
        <ol class="titles">${titles}</ol>
      </div>
    </li>`;
}

function essay(piece) {
  return `<li><a class="essay" href="${esc(piece.href)}" rel="noopener">
      <time datetime="${esc(piece.date)}">${esc(formatMonth(piece.date.slice(0, 7)))}</time>
      <div class="essay-body">
        <h3>${esc(piece.title)}</h3>
        <p>${esc(piece.dek)}</p>
      </div>
      <span class="essay-arrow" aria-hidden="true">↗</span>
    </a></li>`;
}

const BODIES = {
  shipped: ({ live }) =>
    `<div class="features">${live.map((p, i) => featureRow(p, i)).join("")}</div>`,
  foundations: ({ site }) =>
    `<ol class="principles">${site.foundations.map(principle).join("")}</ol>`,
  track: ({ groups }) => `<ol class="career">${groups.map(orgRow).join("")}</ol>`,
  writing: ({ site }) => `<ol class="essays">${postsByDate(site).slice(0, 3).map(essay).join("")}</ol>
      <a class="all-posts-link" href="/blog/">View all posts <span aria-hidden="true">↗</span></a>`,
};

function sectionHead(section, index) {
  return `<header class="sec-head">
        <p class="sec-index">${String(index).padStart(2, "0")} / ${esc(section.nav)}</p>
        <h2>${esc(section.title)}</h2>
        <p class="sec-dek">${esc(section.dek)}</p>
      </header>`;
}

function hero(site, { current, live }) {
  const x = site.doors.find((door) => door.kind === "x");
  const linkedin = site.doors.find((door) => door.kind === "linkedin");
  const github = site.reach.find((item) => item.kind === "github");
  const org = current
    ? current.orgUrl
      ? `<a href="${esc(current.orgUrl)}" rel="noopener">${esc(current.org)}</a>`
      : esc(current.org)
    : "";
  const role = current ? `${esc(current.title)} at ${org}` : esc(site.person.location);
  const actions = `<a class="btn btn-solid" href="#shipped" data-jump="shipped">Explore my work <span aria-hidden="true">↘</span></a>${x ? btn(x.href, "x", "Let's talk", "btn-ghost") : ""}`;
  const socials = [
    linkedin ? btn(linkedin.href, "linkedin", "LinkedIn", "profile-link") : "",
    github ? btn(github.href, "github", github.label, "profile-link", "GitHub") : "",
  ].join("");
  const receipts = [
    { n: `${yearsSince(site.roles.at(-1).start)}+`, label: "years building products", to: "track" },
    { n: String(live.length).padStart(2, "0"), label: "open-source macOS apps", to: "shipped" },
    { n: String(site.writing.length).padStart(2, "0"), label: "essays on working with AI", to: "writing" },
  ]
    .map(
      (r) => `<li><a href="#${r.to}" data-jump="${r.to}">
          <strong>${esc(r.n)}</strong>
          <span>${esc(r.label)}</span>
          <i class="go" aria-hidden="true">→</i>
        </a></li>`,
    )
    .join("");
  return `<section class="hero" id="overview" data-section tabindex="-1">
      <div class="hero-copy">
        <p class="hero-eyebrow"><span class="beacon" aria-hidden="true"></span>${esc(site.person.eyebrow)}</p>
        <h1>${esc(site.person.headline[0])}<br>${esc(site.person.headline[1])} <span>${esc(site.person.headline[2])}</span></h1>
        <p class="lede">${esc(site.person.how)}</p>
        <p class="hero-intro">${esc(site.person.intro)}</p>
        <div class="actions">${actions}</div>
      </div>
      <aside class="profile" aria-label="About Mahesh">
        <div class="portrait-wrap">
          <img class="portrait portrait-dark" src="${esc(site.person.photo.src)}" alt="${esc(site.person.photo.alt)}" width="180" height="180" fetchpriority="high">
          <img class="portrait portrait-light" src="${esc(site.person.photo.lightSrc)}" alt="${esc(site.person.photo.lightAlt)}" width="180" height="180" fetchpriority="high">
        </div>
        <p class="byline-name">${esc(site.person.name)}</p>
        <p class="byline-role">${role}</p>
        <p class="profile-location">Based in ${esc(site.person.location)}</p>
        <div class="profile-socials">${socials}</div>
      </aside>
      <ol class="receipts">${receipts}</ol>
    </section>`;
}

function inbound(site) {
  const x = site.doors.find((door) => door.kind === "x");
  const linkedin = site.doors.find((door) => door.kind === "linkedin");
  const actions = [
    x ? btn(x.href, "x", x.label, "btn-solid") : "",
    linkedin ? btn(linkedin.href, "linkedin", linkedin.label, "btn-ghost") : "",
  ].join("");
  return `<section class="inbound" id="inbound" data-section tabindex="-1">
      <p class="eyebrow">HAVE SOMETHING IN MIND?</p>
      <h2>Good things start<br>with a conversation.</h2>
      <p>${esc(site.person.who)} Tell me what you're working on.</p>
      <div class="actions">${actions}</div>
    </section>`;
}

function head(site, { title, description, robots, path = "/", type = "profile", structuredData = jsonLd(site), demos = false }) {
  const desc = description
    ? `  <meta name="description" content="${esc(description)}">\n`
    : "";
  const robotsTag = robots
    ? `  <meta name="robots" content="${esc(robots)}">\n`
    : "";
  const social = description
    ? `  <meta property="og:site_name" content="${esc(site.person.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(site.origin + path)}">
  <meta property="og:image" content="${esc(site.origin)}${esc(site.person.photo.src)}">
  <meta property="og:type" content="${esc(type)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">\n`
    : "";
  const schema = description
    ? `  <script type="application/ld+json">${JSON.stringify(structuredData).replaceAll("<", "\\u003c")}</script>\n`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
${desc}${robotsTag}  <link rel="canonical" href="${esc(site.origin + path)}">
${social}  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#101514">
  <meta name="color-scheme" content="dark light">
  <script>${THEME_BOOT}</script>
  <link rel="stylesheet" href="${assets["/css/site.css"]}">
  ${demos ? `<script src="${assets["/js/vortex-glass.js"]}" defer></script>
  <script src="${assets["/js/vortex-spiral.js"]}" defer></script>` : ""}
${schema}</head>`;
}

function navigationLink(section, page, mobile = false) {
  const href = section.href || `${page === "home" ? "" : "/"}#${section.id}`;
  const jump = page === "home" && !section.href ? ` data-jump="${section.id}"` : "";
  const active = page === "blog" && section.href === "/blog/";
  const classes = [section.id === "inbound" && !mobile ? "menubar-talk" : "", active ? "is-on" : ""].filter(Boolean).join(" ");
  const content = mobile ? `${TAB_ICONS[section.icon]}<span>${esc(section.tab)}</span>` : esc(section.nav);
  return `<a href="${esc(href)}"${jump}${classes ? ` class="${classes}"` : ""}${active ? ' aria-current="page"' : ""}>${content}</a>`;
}

function menubar(site, { nav, page = "home" }) {
  const brand = nav && page === "home"
    ? `<a class="brand" href="#overview" data-jump="overview">`
    : `<a class="brand" href="/">`;
  const links = nav
    ? `<nav class="menubar-nav" aria-label="Main navigation">${SECTIONS.filter((s) => s.nav)
        .map((s) => navigationLink(s, page))
        .join("")}</nav>`
    : "";
  return `<header class="menubar">
    ${brand}<span class="brand-tile" aria-hidden="true">ma.</span><span>${esc(site.person.name)}</span></a>
    ${links}
    <div class="menubar-end">
      <time class="clock" data-ist-clock>IST</time>
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Toggle color theme">${MOON}${SUN}</button>
    </div>
  </header>`;
}

function tabbar(page = "home") {
  return `<nav class="tabbar" aria-label="Mobile navigation">${SECTIONS.filter((s) => s.tab)
    .map((s) => navigationLink(s, page, true))
    .join("")}</nav>`;
}

export function renderHome(site) {
  const ctx = {
    site,
    live: site.products.filter((p) => p.status === "live"),
    current: site.roles.find((role) => role.end === null),
    groups: groupRoles(site.roles),
  };
  const sections = SECTIONS.filter((s) => s.title)
    .map(
      (s, i) => `<section id="${s.id}" data-section tabindex="-1">
      ${sectionHead(s, i + 1)}
      ${BODIES[s.id](ctx)}
    </section>`,
    )
    .join("\n    ");

  return `${head(site, {
    title: site.person.name,
    description: `${site.person.who} ${site.person.how}`,
    demos: true,
  })}
<body>
  <a class="skip" href="#overview">Skip to content</a>
  ${menubar(site, { nav: true })}
  <main class="stage">
    ${hero(site, ctx)}
    ${sections}
    ${inbound(site)}
  </main>
  <footer class="stage foot">
    <p>${esc(site.person.name)} <span class="footer-dot">/</span> ${esc(site.person.aside)}</p>
    <a href="#overview" data-jump="overview">Back to top <span aria-hidden="true">↑</span></a>
  </footer>
  ${tabbar()}
  <script src="${assets["/js/theme.js"]}" defer></script>
</body>
</html>
`.replace(/[ \t]+\n/g, "\n");
}

export function render404(site) {
  return `${head(site, {
    title: `Not here · ${site.person.name}`,
    robots: "noindex",
    path: "/404.html",
  })}
<body>
  ${menubar(site, { nav: false })}
  <main class="stage lost">
    <h1>This page is not here.</h1>
    <p><a href="/">Go to the home page.</a></p>
  </main>
  <script src="${assets["/js/theme.js"]}"></script>
</body>
</html>
`.replace(/[ \t]+\n/g, "\n");
}

function blogPost(piece, index) {
  const publisher = new URL(piece.href).hostname.replace(/^www\./, "");
  const source = publisher === "linkedin.com" ? "LinkedIn" : publisher;
  return `<li><article>
      <a class="blog-post${index === 0 ? " is-latest" : ""}" href="${esc(piece.href)}" rel="noopener">
        <div class="post-meta">${index === 0 ? '<span class="latest-label">Latest post</span>' : ""}<time datetime="${esc(piece.date)}">${esc(formatDate(piece.date))}</time><span>${esc(source)}</span></div>
        <h2>${esc(piece.title)}</h2>
        <p>${esc(piece.dek)}</p>
        <span class="post-read">Read on ${esc(source)} <span aria-hidden="true">↗</span></span>
      </a>
    </article></li>`;
}

export function renderBlog(site) {
  const posts = postsByDate(site);
  const author = { "@type": "Person", name: site.person.name, url: `${site.origin}/` };
  return `${head(site, {
    title: `Blog · ${site.person.name}`,
    description: site.blog.description,
    path: "/blog/",
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${site.person.name} · Blog`,
      description: site.blog.description,
      url: `${site.origin}/blog/`,
      author,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.dek,
        datePublished: post.date,
        url: post.href,
        author,
      })),
    },
  })}
<body>
  <a class="skip" href="#blog-content">Skip to content</a>
  ${menubar(site, { nav: true, page: "blog" })}
  <main class="stage blog-stage" id="blog-content" tabindex="-1">
    <header class="blog-intro">
      <a class="back-link" href="/"><span aria-hidden="true">←</span> Back to home</a>
      <p class="hero-eyebrow"><span class="beacon" aria-hidden="true"></span>THE BLOG</p>
      <h1>${esc(site.blog.title)}</h1>
      <p class="blog-description">${esc(site.blog.description)}</p>
      <div class="blog-author">
        <img class="portrait portrait-dark" src="${esc(site.person.photo.src)}" alt="" width="44" height="44">
        <img class="portrait portrait-light" src="${esc(site.person.photo.lightSrc)}" alt="" width="44" height="44">
        <span>By ${esc(site.person.name)}</span>
      </div>
    </header>
    <section class="blog-archive" aria-label="All posts">
      <div class="archive-heading"><p>All posts</p><span>${posts.length} ${posts.length === 1 ? "essay" : "essays"} <span aria-hidden="true">·</span> Newest first</span></div>
      <ol class="blog-posts">${posts.map(blogPost).join("\n")}</ol>
    </section>
  </main>
  <footer class="stage foot">
    <p>${esc(site.person.name)} <span class="footer-dot">/</span> ${esc(site.person.aside)}</p>
    <a href="/">Back to home <span aria-hidden="true">↗</span></a>
  </footer>
  ${tabbar("blog")}
  <script src="${assets["/js/theme.js"]}" defer></script>
</body>
</html>
`.replace(/[ \t]+\n/g, "\n");
}

export { css };
