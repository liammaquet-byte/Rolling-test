# Sheet Nester v2

Static, client-only GitHub Pages app. No DXF is uploaded or stored.

## DXF v2 changes
- DXF optimisation runs in a Web Worker so the UI remains responsive.
- Sheet count is the primary packing objective.
- MaxRects-based packing works from a corner and tries multiple orderings/heuristics.
- Rotation defaults to 90 degrees; 45/30/15/10/5 are optional.
- Original LINE, ARC, CIRCLE and polyline geometry is preserved for output.
- Export is conservative AutoCAD R12 ASCII DXF (AC1009), using LINE/ARC/CIRCLE/POLYLINE/VERTEX/SEQEND entities only.
- A structural validation pass runs before each DXF download.

For irregular profiles the optimiser uses the profile's rotated bounding box for guaranteed non-overlap. This is intentionally conservative: it prioritises reliable sheet-count reduction and responsiveness over deep interlocking of concave shapes.
