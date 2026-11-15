# VOXA. — Digital Product Studio (static site)

![VOXA. homepage preview](docs/preview/homepage.gif)

A native HTML/CSS/JS website (no framework, no build step needed to run it).
The layout, type scale and interactions follow a reference study;
all copy is original, all photos are from Unsplash, the brand and logo are placeholders.

## Run

Open `index.html` in a browser. For best results (fonts + WebGL), serve the folder:

```bash
npx serve .          # or: python -m http.server
```

## Pages

| File                                                                                                    | Notes                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| `index.html`                                                                                            | Fixed 100vh stage, WebGL fluid, scramble intro, industry hover panels                                                               |
| `pillars/think.html` · `design.html` · `develop.html`                                                   | Tinted soft fluid, process strip (← → switch pillar), hover cards, scroll marquee (styled by `css/pillar.css`, no page-specific JS) |
| `manifesto.html`                                                                                        | Animated pixel-grid hero, principle hover with floating images, deliverables + services grids                                       |
| `studio.html`                                                                                           | Video block, blue list card, white icon cards, six-columns row                                                                      |
| `contact.html`                                                                                          | Tabs (`?c=business                                                                                                                  | startup | career`), chips, custom dropdowns, attach, validation |
| `industries/artificial-intelligence.html` · `e-commerce.html` · `mobile-apps.html` · `real-estate.html` | Duotone hero slider (drag/click → next industry), image strip, problem cards, testimonial                                           |

## Structure

```
index.html, manifesto.html, studio.html, contact.html
pillars/            think / design / develop
industries/         four industry pages
css/core.css        tokens, header, cursor, footer, shared blocks (cases, brands, CTA cards)
css/<page>.css      home, pillar, manifesto, studio, contact, industry
js/fluid.js         liquid-chrome WebGL background (raw WebGL, tint lerps between pages)
js/core.js          cursor, clock, nav, page transitions, scramble text, reveal, smooth scroll
js/<page>.js        home, manifesto, studio, contact, industry
assets/img/         Unsplash photos
assets/favicon.svg
```

## Editing content

Edit the HTML files directly. There is no generator or build step; each page is hand-maintained.

## Before going live

- Replace the placeholder brand (`VOXA.`), email, address and client names. They are repeated in every HTML file (header, footer, `<title>`), so search and replace across the project.
- **Videos**: Unsplash has no video. Create `assets/video/`, drop an MP4 in it, and replace the commented-out
  `<source>` inside the `<video>` tags in `studio.html` and `contact.html`. The play button already handles it.
- **Contact form** is a front-end demo: it validates but sends nothing. Hook the `submit`
  handler in `js/contact.js` to your backend or a form service.
- Fonts load from Google Fonts (DM Sans, DM Mono).
