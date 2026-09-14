# Sheet Nester

A dependency-free browser app for nesting rectangular parts onto stock sheets and exporting part outlines as DXF.

## Features

- Sheet width and height
- mm or inch units
- Edge margin
- Part gap / kerf allowance
- Multiple part sizes and quantities
- Global and per-part 90° rotation controls
- Multi-sheet packing
- Multiple MaxRects packing heuristics and ordering attempts
- SVG preview
- DXF export for the currently shown sheet
- DXF export for all sheets (sheets are offset horizontally)
- DXF contains **part outlines only** — no sheet boundary, labels, dimensions, or text
- Fully client-side; no backend or uploads

## Run locally

Because the app is plain HTML/CSS/JavaScript, you can simply open `index.html` in a browser.

For a local web server, from this folder run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this README to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`, then save.
6. GitHub will publish the site at a `github.io` URL.

## Nesting method

The app uses a MaxRects-style rectangular bin packing algorithm. It tries several part ordering strategies and four placement heuristics, then keeps the best result based primarily on:

1. Fewest sheets used
2. Better use of the final sheet
3. More compact placement

This is a heuristic optimizer: it aims for an excellent layout, but it does not mathematically guarantee the global optimum for every possible set of parts.

## DXF notes

DXF is written as ASCII AutoCAD 2000 (`AC1015`) using closed `LWPOLYLINE` rectangles. The `$INSUNITS` header is set to millimetres or inches according to the UI.

For an all-sheets export, each sheet's parts are shifted horizontally so that separate sheet layouts do not overlap. No sheet outline is added.
