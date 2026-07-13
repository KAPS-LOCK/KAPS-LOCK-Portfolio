#!/usr/bin/env node
// Reads content/projects/*.md (if any) and regenerates:
//   - projects/<slug>.html      one page per write-up
//   - projects/index.html       the listing page
//   - content/projects.json     metadata consumed by projects.js (homepage carousel)
//   - sitemap.xml               homepage + project pages
//
// Usage: node tools/generate.js  (Vercel runs this automatically on deploy).
//
// Members are handled separately: content/members.json is fetched and
// rendered client-side by assets/js/members.js, no build step needed for them.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://kaps-lock.vercel.app";
const CONTENT_DIR = path.join(ROOT, "content", "projects");
const OUT_DIR = path.join(ROOT, "projects");
const MEMBERS_FILE = path.join(ROOT, "content", "members.json");

// ---------- frontmatter + minimal markdown parsing ----------

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing --- frontmatter block");
  }
  const [, fmBlock, body] = match;
  const data = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    data[key] = value;
  }
  return { data, body: body.trim() };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Small, dependency-free markdown subset: paragraphs (blank-line separated),
// ## headings, standalone ![alt](src) images, **bold**, *italic*,
// [text](url) links. Raw inline HTML (e.g. <br>) passes through untouched.
function inlineMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function markdownToHtml(body) {
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = block.match(/^##\s+(.+)$/);
      if (heading) return `<h2>${inlineMarkdown(heading[1])}</h2>`;
      const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) {
        return `<figure><img src="${image[2]}" alt="${escapeHtml(image[1])}" loading="lazy" /></figure>`;
      }
      return `<p>${inlineMarkdown(block)}</p>`;
    })
    .join("\n\n    ");
}

function loadContentDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, body } = parseFrontmatter(raw);
      const post = { ...data, body, slug: path.basename(f, ".md") };
      post.members = data.members
        ? data.members.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return post;
    });
}

function loadMembers() {
  if (!fs.existsSync(MEMBERS_FILE)) return {};
  const list = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
  const byPenName = {};
  for (const m of list) byPenName[m.penName] = m;
  return byPenName;
}

// ---------- shared page chrome ----------

const GITHUB_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';

const LIVE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v9a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-9"/><path d="M12 14V3"/><path d="M8 7l4-4 4 4"/></svg>';

const HEADER = `<header class="site-header">
  <div class="wrap" style="padding:0;">
    <a href="../index.html" class="wordmark" aria-label="KAPS LOCK™ — home">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="5" style="fill:#f4f3ef;stroke:#1c1b1a" stroke-width="1.5"/>
        <rect x="4.5" y="4.5" width="15" height="13" rx="2.5" style="fill:#ffffff;stroke:#1c1b1a" stroke-width="1.4"/>
        <path d="M9.5 7.5V14.5" style="stroke:#1c1b1a" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M9.5 11.3L14.2 7.5" style="stroke:#1c1b1a" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M9.5 11.3L14.2 14.5" style="stroke:#1c1b1a" stroke-width="1.9" stroke-linecap="round"/>
        <circle cx="17" cy="7.3" r="1.4" style="fill:#d97706"/>
        <path d="M6.5 20.3H17.5" style="stroke:#1c1b1a" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>KAPS LOCK™</span>
    </a>
    <a href="https://github.com/KAPS-LOCK" target="_blank" rel="noopener" class="header-github" aria-label="KAPS LOCK™ on GitHub">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>
  </div>
</header>`;

const FOOTER = `<footer class="site-footer">
  <div class="wrap">
    <span>KAPS LOCK™</span>
    <span>&copy; <span data-year>2026</span> — all rights reserved</span>
  </div>
</footer>`;

function headMeta({ title, description, url, ogType, ogImage }) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="google-site-verification" content="psQvpSt2m9Rnbs1STJQxu7XLdqvxBg5bWZX3F5JxmNY" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ogImage}" />
<meta name="twitter:card" content="summary" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="../images/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32.png" />
<link rel="apple-touch-icon" href="../images/apple-touch-icon.png" />
<link rel="stylesheet" href="../assets/css/style.css" />`;
}

// ---------- blog page + index templates ----------

function blogPostHtml(p, membersByPenName) {
  const bodyHtml = markdownToHtml(p.body);
  const metaLine = [p.date, p.event, p.tech].filter(Boolean).join(" · ");

  const links = [
    p.github &&
      `<a href="${escapeHtml(p.github)}" target="_blank" rel="noopener">${GITHUB_ICON}<span>source</span></a>`,
    p.live &&
      `<a href="${escapeHtml(p.live)}" target="_blank" rel="noopener">${LIVE_ICON}<span>live</span></a>`,
  ]
    .filter(Boolean)
    .join("\n      ");

  const avatars = p.members
    .map((name) => {
      const m = membersByPenName[name];
      if (!m) return `<span title="${escapeHtml(name)}">${escapeHtml(name.charAt(0).toUpperCase())}</span>`;
      const img = `<img src="${m.photo.startsWith("http") ? m.photo : "../" + m.photo}" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" loading="lazy" />`;
      return m.portfolio
        ? `<a href="${escapeHtml(m.portfolio)}" target="_blank" rel="noopener" title="${escapeHtml(name)}">${img}</a>`
        : img;
    })
    .join("");

  const cover = p.cover
    ? `<div class="post-cover"><img src="../${p.cover}" alt="${escapeHtml(p.title)} cover" /></div>\n\n    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
${headMeta({
    title: `${p.title} — KAPS LOCK™`,
    description: p.summary || "",
    url: `${SITE}/projects/${p.slug}.html`,
    ogType: "article",
    ogImage: p.cover ? `${SITE}/${p.cover}` : `${SITE}/images/og-cover.png`,
  })}
</head>
<body>

${HEADER}

<main class="post-main">
  <div class="wrap">
    <div class="post-wrap">

    <a href="../index.html#projects" class="back-link">&larr; home</a>

    ${cover}<h1 class="post-title">${escapeHtml(p.title)}</h1>
    ${metaLine ? `<p class="post-meta">${escapeHtml(metaLine)}</p>` : ""}
    ${p.rank ? `<p class="post-rank">${escapeHtml(p.rank)}</p>` : ""}
    ${links ? `<div class="post-links">\n      ${links}\n    </div>` : ""}
    ${avatars ? `<div class="post-avatars">${avatars}</div>` : ""}

    <div class="post-body">
    ${bodyHtml}
    </div>

    </div>
  </div>
</main>

${FOOTER}

<script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

function blogIndexHtml(posts) {
  const cards = posts
    .map(
      (p) => `        <a href="${p.slug}.html" class="card">
          <div class="card-photo">
            <img src="../${p.cover || "images/placeholder.png"}" alt="${escapeHtml(p.title)} cover" loading="lazy" />
          </div>
          <div class="card-body">
            <h3 class="pen-name">${escapeHtml(p.title)}</h3>
            <p class="role">${escapeHtml([p.date, p.event].filter(Boolean).join(" · "))}</p>
            <p class="bio">${escapeHtml(p.summary || "")}</p>
          </div>
        </a>`
    )
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
${headMeta({
    title: "Projects — KAPS LOCK™",
    description: "Project write-ups from the KAPS LOCK™ collective.",
    url: `${SITE}/projects/index.html`,
    ogType: "website",
    ogImage: `${SITE}/images/og-cover.png`,
  })}
</head>
<body>

${HEADER}

<main class="member-main">
  <section class="members" id="blog">
    <div class="wrap">
      <div class="members-header">
        <h2>Projects</h2>
        <span class="members-count">${posts.length} write-up${posts.length === 1 ? "" : "s"}</span>
      </div>
      <div class="members-grid">
${cards || "        <!-- no projects yet — add content/projects/<slug>.md -->"}
      </div>
    </div>
  </section>
</main>

${FOOTER}

<script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

// ---------- posts.json + sitemap ----------

function postsJson(posts) {
  return JSON.stringify(
    posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      summary: p.summary || "",
      cover: p.cover || "images/placeholder.png",
      tech: p.tech || "",
      event: p.event || "",
      members: p.members,
      github: p.github || "",
      live: p.live || "",
    })),
    null,
    2
  );
}

function sitemapXml(posts) {
  const urls = [
    `${SITE}/`,
    ...(posts.length ? [`${SITE}/projects/index.html`] : []),
    ...posts.map((p) => `${SITE}/projects/${p.slug}.html`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n")}
</urlset>
`;
}

// ---------- run ----------

function main() {
  const posts = loadContentDir(CONTENT_DIR).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  if (!posts.length && !fs.existsSync(CONTENT_DIR)) {
    console.log("No content/projects/*.md yet — nothing to generate.");
    return;
  }

  const membersByPenName = loadMembers();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const p of posts) {
    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.html`), blogPostHtml(p, membersByPenName));
  }
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), blogIndexHtml(posts));
  fs.writeFileSync(path.join(ROOT, "content", "projects.json"), postsJson(posts));
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapXml(posts));

  console.log(`Generated ${posts.length} project page(s), projects.json, and sitemap.xml.`);
}

main();
