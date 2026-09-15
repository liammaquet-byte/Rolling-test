# Sheet Nester v3.4 — mixed-part optimisation + UI cleanup

This release keeps the v3.3 CAD export and clearance-safety fixes and focuses on mixed part jobs and the nesting workflow.

## Mixed CAD jobs

Fine mode now protects the strongest repeating part family instead of immediately breaking it apart when other part types are present. It builds a safe dense shear-lattice band for the dominant repeated profile, then places the other part types into available space around it using true-profile collision checks. The candidate is still compared against the ordinary mixed packing, pair and lattice candidates, so fewest sheets remains the first priority.

The final whole-sheet clearance audit remains mandatory and DXF export is still blocked if an overlap is detected.

## Interface changes

- Curve collision tolerance is no longer exposed in the UI. It remains fixed internally at **0.05 mm**; original CAD geometry is still preserved for export.
- The completed layout summary is simplified to part count, sheet count and clearance status.
- While CAD nesting is running, the imported-file table fades and becomes non-interactive.
- A compact progress card is displayed over the file list with a thin progress bar, current stage, best sheet count and Cancel control.

## Defaults

- Sheet: 1200 × 600 mm
- Edge margin: 0 mm
- Part gap / kerf: 0.2 mm
- Rotation increment: 1°
- Optimisation: Fine
- Internal curve collision tolerance: 0.05 mm

DWG decoding remains local in the browser using the packaged WebAssembly/LibreDWG integration. See `THIRD_PARTY_NOTICES.md` and `GPL-3.0.txt`.
