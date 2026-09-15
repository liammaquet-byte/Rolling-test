# Sheet Nester

A dependency-free browser app for nesting rectangular parts or custom 2D DXF profiles onto stock sheets, then exporting the placed part geometry as DXF.

## Privacy / client data

The app is fully client-side and works on GitHub Pages. DXF files are read with the browser File API and are **not uploaded to a server**. No database, account, API, analytics service, or remote storage is required.

## Features

- Sheet width and height
- mm or inch units
- Edge margin and part gap / kerf allowance
- Rectangle mode with quantities and optional 90° rotation
- DXF mode with multiple imported part files and quantities
- User-selectable DXF rotation increments from 90° down to 5°
- Shape-aware collision testing for concave custom profiles
- Multi-sheet nesting
- SVG preview
- Export current sheet or all sheets as DXF
- DXF output contains part geometry only — no sheet boundary, labels, dimensions, or text

## Geometry-preservation approach

Imported geometry is not simplified for export. The original supported entities are retained and transformed only by translation and rotation when a layout is exported.

Supported design entities:

- `LINE`
- `ARC`
- `CIRCLE`
- `LWPOLYLINE` including bulge arcs
- legacy `POLYLINE` / `VERTEX` including bulge arcs (written back as equivalent `LWPOLYLINE` geometry)

For nesting/collision checks only, curves are sampled into temporary points using the **Curve collision tolerance** setting. Those temporary points are never substituted for the original curve geometry in the exported DXF.

The largest closed `LWPOLYLINE`, closed `POLYLINE`, or `CIRCLE` in each file is treated as that part's outer nesting boundary. Other supported geometry in the file (for example holes or internal lines/arcs) is preserved in the output but is not treated as free space for placing another part. This is deliberately conservative.

Potentially design-critical geometry that this version cannot faithfully transform, such as `SPLINE`, `ELLIPSE`, `INSERT`, `REGION`, or 3D entities, causes the import to be rejected rather than silently altered. Text, dimensions, hatches, points and leaders are ignored because the output is intentionally geometry-only.

## Nesting method

Rectangle mode uses a multi-strategy MaxRects heuristic.

DXF mode uses polygon collision tests with multiple part orderings and candidate contact placements. It is a heuristic nester rather than a mathematical global optimizer. Lower rotation increments can find tighter layouts, but require more computation.

For DXF jobs, profile area utilisation is based on the detected outer boundary. Internal holes are not subtracted from the utilisation statistic.

## Run locally

Open `index.html` directly, or run a local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js`, and this README to the repository root.
3. Open **Settings → Pages** in GitHub.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`, then save.

No build step or backend is required.


## iPad / Safari deployment note

`index.html` is now fully self-contained: CSS and JavaScript are embedded in the page. This avoids GitHub Pages path/caching issues where `app.js` or `styles.css` may fail to load. If the status pill remains **Loading app…**, JavaScript did not execute.


## DXF boundary update
The importer now recognises closed profiles made from connected LINE, ARC, and open polyline entities as well as closed polylines/circles. Original CAD entities are preserved for DXF export; curve sampling is used only for nesting collision calculations.
