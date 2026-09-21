const KEY = "ma-theme";

function systemTheme() {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function current() {
  return document.documentElement.getAttribute("data-theme") || systemTheme();
}

function bind() {
  const button = document.querySelector("[data-theme-toggle]");
  if (button) {
    button.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      apply(next);
      if (next === systemTheme()) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    });
  }
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
}

bind();
