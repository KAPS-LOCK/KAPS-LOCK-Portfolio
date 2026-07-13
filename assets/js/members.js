// Fetches content/members.json and renders the member cards on index.html.
// No build step — edit the JSON, refresh the page.

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("members-grid");
  const count = document.querySelector(".members-count");
  if (!grid) return;

  fetch("content/members.json")
    .then((res) => res.json())
    .then((members) => {
      members.sort((a, b) => a.order - b.order);

      grid.innerHTML = members.map(renderCard).join("\n");
      if (count) count.textContent = `${members.length} members`;

      // Cards were just inserted, so wire up the hover effect script.js
      // already set up for elements present at DOMContentLoaded.
      grid.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        });
      });
    });
});

function renderCard(m) {
  const tag = m.portfolio ? "a" : "div";
  const attrs = m.portfolio
    ? ` href="${escapeHtml(m.portfolio)}" target="_blank" rel="noopener"`
    : "";
  const realName = m.realName ? `<p class="real-name">${escapeHtml(m.realName)}</p>` : "";
  return `<${tag} class="card"${attrs}>
    <div class="card-photo">
      <img src="${escapeHtml(m.photo)}" alt="Portrait of ${escapeHtml(m.penName)}" loading="lazy" />
    </div>
    <div class="card-body">
      <h3 class="pen-name">${escapeHtml(m.penName)}</h3>
      ${realName}
      <p class="role">${escapeHtml(m.role)}</p>
      <p class="bio">${escapeHtml(m.bio)}</p>
    </div>
  </${tag}>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
