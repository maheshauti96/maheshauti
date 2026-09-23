const KEY = "ma-theme";

const SESSION_LOG = {
  cursor:
    "Active Cursor session · process: cursor-agent-worker · local file locks verified",
  claude:
    "Idle Claude session · process: claude-code-engine · listening on stdin",
  grok: "Active Grok session · process: grok-build-plan · local JSONL turn stream",
  codex:
    "Active Codex session · process: app-server · thread-writer lock held",
};

const SPY_IDS = [
  "overview",
  "shipped",
  "foundations",
  "track",
  "writing",
  "inbound",
];

function motion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll("vortex-spiral").forEach((el) => {
    el.setAttribute("appearance", theme);
    el.setAttribute("glass", "");
    if (typeof el.setAppearance === "function") el.setAppearance(theme);
  });
}

function current() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}

function bindTheme() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    const next = current() === "dark" ? "light" : "dark";
    apply(next);
    localStorage.setItem(KEY, next);
  });
}

function istClock(date = new Date()) {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return `${time} IST`;
}

function iosClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value || "9";
  const minute = parts.find((p) => p.type === "minute")?.value || "41";
  return `${hour}:${minute}`;
}

function bindClock() {
  const istEl = document.querySelector("[data-ist-clock]");
  const iosEl = document.querySelector("[data-ios-clock]");
  const tick = () => {
    if (istEl) istEl.textContent = istClock();
    if (iosEl) iosEl.textContent = iosClock();
  };
  tick();
  setInterval(tick, 1000);
}

function bindSessions() {
  const root = document.querySelector("[data-sessions]");
  if (!root) return;
  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-session]");
    if (!row || !root.contains(row)) return;
    root.querySelectorAll("[data-session]").forEach((node) => {
      node.classList.toggle("is-on", node === row);
    });
    const log = root.querySelector("[data-session-log]");
    const key = row.getAttribute("data-session");
    if (log && SESSION_LOG[key]) log.textContent = SESSION_LOG[key];
  });
}

let holdSpy = false;

function setSpy(id) {
  document.querySelectorAll("[data-jump]").forEach((node) => {
    const match = node.getAttribute("data-jump") === id;
    const inSpy = SPY_IDS.includes(node.getAttribute("data-jump"));
    if (inSpy) node.classList.toggle("is-on", match);
  });
}

function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  holdSpy = true;
  if (SPY_IDS.includes(id)) setSpy(id);
  el.scrollIntoView({ behavior: motion(), block: "start" });
  history.replaceState(null, "", `#${id}`);
  const release = () => {
    holdSpy = false;
    window.removeEventListener("scrollend", release);
  };
  window.addEventListener("scrollend", release);
  setTimeout(release, 900);
}

function bindJumps() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-jump]");
    if (!link) return;
    const id = link.getAttribute("data-jump");
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    jumpTo(id);
  });
}

function bindSpy() {
  const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(
    Boolean,
  );
  if (!sections.length) return;

  const sync = () => {
    if (holdSpy) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY >= max - 48) {
      setSpy(SPY_IDS.at(-1));
      return;
    }
    const line = 120;
    let currentId = SPY_IDS[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) currentId = section.id;
    }
    setSpy(currentId);
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

function bindGlassLight() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const panes = ".hero, .card, .mind-card, .write-card, .career, .inbound, .dock";
  document.addEventListener(
    "pointermove",
    (event) => {
      const pane = event.target.closest(panes);
      if (!pane) return;
      const box = pane.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pane.style.setProperty("--lx", `${((event.clientX - box.left) / box.width) * 100}%`);
      pane.style.setProperty("--ly", `${((event.clientY - box.top) / box.height) * 100}%`);
    },
    { passive: true },
  );
}

function bindCursorLight() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (matchMedia("(pointer: coarse)").matches) return;
  const light = document.createElement("div");
  light.className = "cursor-light";
  light.setAttribute("aria-hidden", "true");
  document.body.prepend(light);
  let x = window.innerWidth * 0.5;
  let y = 72;
  let tx = x;
  let ty = y;
  let visible = false;
  const place = () => {
    light.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const loop = () => {
    x += (tx - x) * 0.34;
    y += (ty - y) * 0.34;
    place();
    requestAnimationFrame(loop);
  };
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      tx = event.clientX;
      ty = event.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        light.classList.add("is-on");
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    visible = false;
    light.classList.remove("is-on");
  });
  place();
  requestAnimationFrame(loop);
}

bindTheme();
bindClock();
bindSessions();
bindJumps();
bindSpy();
bindGlassLight();
bindCursorLight();
apply(current());
