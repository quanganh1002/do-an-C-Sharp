# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Despite the repo name (`do-an-C-Sharp`), there is no C# code, solution, or build system. It is a static, front-end-only bakery website (Vietnamese UI) made of plain HTML/CSS/JS with no package manager, bundler, linter, or tests. Open the HTML files directly in a browser (or use a static server such as VS Code Live Server) to view changes.

## Structure

Two independent pages that share nothing:

- `home/` — customer-facing storefront. `homepage.html` + `home.css`; images live in `home/pictures/` (some filenames contain spaces).
- `admin/` — "SweetBake" admin, a single page (`index.html` + `style.css` + `script.js`) with a dark-brown sidebar that switches `<section class="view" id="view-NAME">` panels via `data-view="NAME"` buttons. Views: home (dashboard), pos (sales), report, and CRUD pages for products/customers/staff/invoices (config-driven via the `entities` object in `script.js`, rendered into `.crud[data-entity]` sections). The shop is online-only, so production, ingredients, recipes, cake pre-orders and promotions were deliberately removed. Uses Chart.js, Font Awesome and Google Fonts via CDN. There is no backend: data lives in `localStorage` (keys `sweetbake:*`), seeded with sample data on first load; clear those keys to reset.

## Gotchas

- `script.js` does top-level `getElementById` / `new Chart(...)` without null checks; keep IDs (`revenueChart`, `reportChart`, `productGrid`, `cartBody`, `modal`, etc.) in sync with `index.html`. Any data change should call `refreshAll()` so POS, tables, stats and charts stay consistent.
- Source files contain Vietnamese text; keep them UTF-8 (the JS comments show mojibake when read with the wrong encoding, so don't re-save them in another encoding).
