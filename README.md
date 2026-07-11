# Segfault — static site

Plain HTML/CSS/JS. No build step, no dependencies. Open `index.html` in a
browser, or serve the folder with anything that serves static files.

## Structure

```
index.html            → hero + Active Roster (the whole landing page)
style.css              → all styles for every page
script.js               → tiny script, just fills in the footer's year
members/
  rho.html
  8bit.html
  vellichor.html
  kernel.html
  moth.html
  ferro.html
  juniper.html
  template.html        → blank starting point for a new member
```

## Adding or editing a member

1. Copy `members/template.html`, rename it to `members/<username>.html`.
2. Fill in the photo, pen name, real name (optional), role, joined year,
   and intro at the top of the page.
3. Add a matching card to the `roster-grid` in `index.html`, linking to
   `members/<username>.html`.

Each member's own page has a "blank canvas" section at the bottom, meant
to be replaced with whatever they want — project write-ups, links, images.
Nothing else on the page needs to change for that.

## Viewing it

Double-clicking `index.html` works fine for browsing. If you want the
member links and relative paths to behave exactly like a real deployment,
serve the folder locally instead, e.g. from inside this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Notes

- Fonts (Instrument Serif, Inter, JetBrains Mono) load from Google Fonts —
  you'll need an internet connection for them to appear; otherwise the
  page falls back to system fonts.
- Member photos are placeholder images from pravatar.cc — swap the `src`
  in each member page and roster card for real photos whenever ready.
