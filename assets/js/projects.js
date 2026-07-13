// Fetches content/projects.json (written by tools/generate.js) and content/members.json,
// then renders the auto-sliding Projects carousel on index.html.
// If there are no posts yet, the section stays hidden.

document.addEventListener("DOMContentLoaded", function () {
  const section = document.getElementById("projects");
  const carousel = document.getElementById("projects-carousel");
  if (!section || !carousel) return;

  Promise.all([
    fetch("content/projects.json").then((res) => (res.ok ? res.json() : [])),
    fetch("content/members.json").then((res) => (res.ok ? res.json() : [])),
  ]).then(([posts, members]) => {
    if (!posts.length) return;

    const byPenName = {};
    members.forEach((m) => (byPenName[m.penName] = m));

    section.hidden = false;
    const count = section.querySelector(".projects-count");
    if (count) count.textContent = `${posts.length} write-up${posts.length === 1 ? "" : "s"}`;

    carousel.innerHTML = `
      <div class="carousel-frame">
        ${posts.map((p, i) => renderSlide(p, i, byPenName)).join("\n")}
      </div>
      <button class="carousel-arrow prev" aria-label="Previous project">&larr;</button>
      <button class="carousel-arrow next" aria-label="Next project">&rarr;</button>
      <div class="carousel-dots" role="tablist">
        ${posts
          .map(
            (p, i) =>
              `<button role="tab" aria-label="Go to ${escapeHtml(p.title)}"${i === 0 ? ' class="active"' : ""}></button>`
          )
          .join("\n")}
      </div>`;

    const slides = carousel.querySelectorAll(".slide");
    const dots = carousel.querySelectorAll(".carousel-dots button");
    const prev = carousel.querySelector(".carousel-arrow.prev");
    const next = carousel.querySelector(".carousel-arrow.next");
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("active", j === index));
      dots.forEach((d, j) => d.classList.toggle("active", j === index));
    }

    prev.addEventListener("click", () => { show(index - 1); restart(); });
    next.addEventListener("click", () => { show(index + 1); restart(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { show(i); restart(); }));

    if (slides.length < 2) {
      prev.hidden = next.hidden = true;
      carousel.querySelector(".carousel-dots").hidden = true;
      return;
    }

    // Basic swipe support.
    let touchX = null;
    carousel.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    carousel.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) { show(index + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    // Auto-advance, pausing on hover/focus; off entirely for reduced motion.
    const autoOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function start() { if (autoOk && !timer) timer = setInterval(() => show(index + 1), 6000); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);
    start();
  });
});

const GITHUB_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';

const LIVE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v9a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-9"/><path d="M12 14V3"/><path d="M8 7l4-4 4 4"/></svg>';

function renderSlide(p, i, byPenName) {
  const tech = [p.tech, p.event].filter(Boolean).join(" · ");
  const links = [
    p.github &&
      `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener" aria-label="GitHub repo">${GITHUB_ICON}</a>`,
    p.live &&
      `<a href="${escapeHtml(p.live)}" target="_blank" rel="noopener" aria-label="Live site">${LIVE_ICON}</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  const avatars = (p.members || [])
    .map((name) => {
      const m = byPenName[name];
      return m
        ? `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" loading="lazy" />`
        : `<span title="${escapeHtml(name)}">${escapeHtml(name.charAt(0).toUpperCase())}</span>`;
    })
    .join("");

  return `<div class="slide${i === 0 ? " active" : ""}">
    <img class="slide-cover" src="${escapeHtml(p.cover)}" alt="" loading="${i === 0 ? "eager" : "lazy"}" />
    <div class="slide-scrim"></div>
    <a class="slide-hit" href="projects/${escapeHtml(p.slug)}.html" aria-label="Read the ${escapeHtml(p.title)} write-up"></a>
    <div class="slide-info">
      <h3 class="slide-title">${escapeHtml(p.title)}</h3>
      <p class="slide-summary">${escapeHtml(p.summary || "")}</p>
      ${tech ? `<p class="slide-tech">${escapeHtml(tech)}</p>` : ""}
      ${links ? `<div class="slide-links">${links}</div>` : ""}
      ${avatars ? `<div class="slide-avatars">${avatars}</div>` : ""}
    </div>
  </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
