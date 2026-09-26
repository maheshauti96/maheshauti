const KEY = "ma-theme";

const SESSION_LOG = {
  cursor: "Cursor is working on site-redesign. Select a session to explore this demo.",
  claude: "Claude is idle on analytics-pipeline, ready for the next instruction.",
  grok: "Grok Build is working through portfolio-research.",
  codex: "Codex is working on eval-harness.",
};

function motion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#101514" : "#f5f5f0",
  );
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
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // The selected theme still works when browser storage is unavailable.
    }
  });
}

function istClock(date = new Date()) {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${time} IST`;
}

function bindClock() {
  const el = document.querySelector("[data-ist-clock]");
  if (!el) return;
  const tick = () => {
    el.textContent = istClock();
  };
  tick();
  setInterval(tick, 60_000);
}

function bindSessions() {
  const root = document.querySelector("[data-sessions]");
  if (!root) return;
  const log = root.closest(".screen")?.querySelector("[data-session-log]");
  root.querySelectorAll("[data-session]").forEach((node) => {
    node.setAttribute("aria-pressed", String(node.classList.contains("is-on")));
  });
  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-session]");
    if (!row || !root.contains(row)) return;
    root.querySelectorAll("[data-session]").forEach((node) => {
      node.classList.toggle("is-on", node === row);
      node.setAttribute("aria-pressed", String(node === row));
    });
    const key = row.getAttribute("data-session");
    if (log && SESSION_LOG[key]) log.textContent = SESSION_LOG[key];
  });
}

let holdSpy = false;

function setSpy(id) {
  document.querySelectorAll("nav [data-jump]").forEach((node) => {
    const active = node.getAttribute("data-jump") === id;
    node.classList.toggle("is-on", active);
    if (active) node.setAttribute("aria-current", "location");
    else node.removeAttribute("aria-current");
  });
}

function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  holdSpy = true;
  setSpy(id);
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
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
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("[data-jump]");
    if (!link) return;
    const id = link.getAttribute("data-jump");
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    jumpTo(id);
  });
}

function bindSpy() {
  const sections = [...document.querySelectorAll("[data-section]")];
  if (!sections.length) return;
  const bar = document.querySelector(".menubar");

  const sync = () => {
    if (holdSpy) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && window.scrollY >= max - 48) {
      setSpy(sections.at(-1).id);
      return;
    }
    const line = (bar ? bar.offsetHeight : 0) + 32;
    let currentId = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) currentId = section.id;
    }
    setSpy(currentId);
  };

  let pendingFrame = null;
  const schedule = () => {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      sync();
    });
  };

  sync();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

bindTheme();
bindClock();
bindSessions();
bindJumps();
bindSpy();
apply(current());
