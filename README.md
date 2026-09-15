# Sheet Nester v3.0.1

Hotfix for v3.0 DWG/DXF import.

- Restores the `readTolerance()` helper that was accidentally dropped while the combined DXF/DWG importer was added.
- Resets the status indicator correctly after an import error.
- DWG adapter and the v2.9 lattice nesting engine are otherwise unchanged.
- Default sheet 1200 x 600 mm, edge margin 0 mm, gap/kerf 0.2 mm, 1 degree rotation, Fine optimisation.
