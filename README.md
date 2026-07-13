# KAPS LOCK — static site

Plain HTML/CSS/JS, zero npm dependencies. **Members** are pure data — edit a
JSON file and refresh, no build step. **Projects** are one Markdown file each;
a tiny dependency-free Node script (`tools/generate.js`) turns them into pages,
and Vercel runs that script automatically on deploy — you never run it yourself.

## Running it locally

The member grid and Projects carousel fetch JSON at runtime, so opening
`index.html` by double-clicking it (`file://...`) will not work — it needs a
real server.

**Easiest way:** install the **Live Server** extension in VS Code, then
right-click `index.html` → **"Open with Live Server."** It opens the site in
your browser and reloads automatically whenever you save a file. No terminal,
no commands.

Alternatives if you don't use VS Code:
```
python -m http.server 8000      # then open http://127.0.0.1:8000/
npx serve .                      # or this, if you have Node
```
These don't send cache headers, so if an edit doesn't seem to show up, hard
refresh (`Ctrl+Shift+R`) or open DevTools → Network → check "Disable cache."

## Adding or editing a member

Edit `content/members.json` directly. Each entry looks like:

```json
{
  "order": 8,
  "photo": "images/members/yourhandle.jpg",
  "penName": "yourhandle",
  "realName": "Your Name",
  "role": "Your role",
  "bio": "A one-line teaser for your member card.",
  "portfolio": "https://your-site.example"
}
```

- `order` controls position in the members grid — change the numbers to reorder members.
- `photo` can be a local path (drop the image in `images/members/`) or any image URL (e.g. a GitHub avatar).
- `realName` is optional — omit or set to `null` to hide it on the card.
- `portfolio` is your personal site link; the whole card links there. Set it to `null` if you don't have one yet — the card just won't be clickable.

Save, refresh the page (Live Server does this for you) — no generator to run, nothing else to build.

## Adding a project

1. Copy `content/projects/_template.md` to `content/projects/<slug>.md`.
2. Fill in the frontmatter and write the body in Markdown.
3. Push. **You never run a build script yourself** — Vercel runs `tools/generate.js` on deploy and the project goes live.

Frontmatter:

```
---
title: Lockpick
date: 2026-06-21
summary: One-liner shown on the carousel card and in link previews.
cover: images/covers/lockpick.png
tech: Node.js, React
event: HackX 2026
rank: Ranked #3
members: Sujatx, WINTYR
github: https://github.com/KAPS-LOCK/lockpick
live: https://lockpick.example
---
```

- Only `title` and `date` are required — `cover`, `tech`, `event`, `rank`, `members`, `github`, `live` are all optional, and anything missing just doesn't render.
- `cover` is a repo-relative path (drop the image in `images/covers/`).
- `members` is a comma-separated list of pen names from `members.json`; their photos become the overlapping avatar row on the card and the write-up.
- The body is Markdown: paragraphs, `## headings`, standalone `![alt](../images/foo.png)` image lines, **bold**, *italic*, [links](…).

On deploy the generator produces `projects/<slug>.html`, the `projects/index.html` listing, `content/projects.json` (which the homepage carousel reads), and `sitemap.xml` — all gitignored build output, never edited or committed by hand.

**Want to preview a project before pushing?** Run `node tools/generate.js` once, then reload with Live Server as usual.

## Structure

```
index.html               → hero + Active Members grid + Projects carousel (both filled in at runtime)
assets/
  css/style.css          → all styles for every page
  js/main.js             → footer year + hero typewriter effect
  js/members.js          → fetches content/members.json and renders the member cards
  js/projects.js         → fetches content/projects.json and renders the Projects carousel
content/                 → the only files you hand-edit
  members.json           → one array, one object per member — SOURCE OF TRUTH
  projects/*.md          → one file per project write-up (copy _template.md to start)
tools/generate.js        → content/projects/*.md → projects/*.html + projects/index.html
                           + content/projects.json + sitemap.xml
vercel.json              → tells Vercel to run tools/generate.js on every deploy
```

## Viewing it

https://kaps-lock.vercel.app/

## Notes

- Fonts (Instrument Serif, Inter, JetBrains Mono) load from Google Fonts —
  you'll need an internet connection for them to appear; otherwise the
  page falls back to system fonts.
- Member photos live in `images/members/` (or are external URLs); project
  covers in `images/covers/`; `images/placeholder.png` is the fallback cover
  for a project with none set.
