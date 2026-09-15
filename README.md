# Sheet Nester v3.2 — public/free release

Fixes two issues found in the 120-flag stress test.

- **DXF export:** spline jobs now emit one coherent AutoCAD R2000 DXF structure for every entity, including model-space ownership, entity handles and R2000 subclass records. The previous build changed the file version for SPLINE but left other entities in the older R12-style form.
- **Clearance safety:** compound/lattice candidates are whole-sheet validated before selection; the final result is validated again; export is blocked if any overlap is detected. Actual preview collisions are highlighted red.
- **Curve tolerance:** default reduced from 0.1 mm to 0.05 mm for better safety with the default 0.2 mm laser gap.

At normal zoom a 0.2 mm clearance is often less than one screen pixel, so dark preview outlines can appear to touch even when the geometric audit reports zero overlaps.

The v3.1 DWG worker/licensing arrangement is unchanged. Upload all files together.
