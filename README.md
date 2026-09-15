# Sheet Nester v2.4

Client-only GitHub Pages nester. DXF files remain in the browser.

## v2.4
Fine mode now includes reusable compound-pair nesting. The optimiser searches different DXF types for a compact collision-free A+B relationship, including positions where the parts' bounding boxes overlap. It then packs repeated copies of the best complementary pair as a temporary compound unit, expands every unit back into its two separate original parts, and runs the existing true-profile compaction/pair-mating cleanup.

The compound relationship exists only inside the optimiser. DXF export still writes every original LINE/ARC/CIRCLE/POLYLINE part separately with its own final transform.

The 1200 × 600 default sheet, 1°/2° rotation options, background worker, mixed-file orderings and conservative R12 ASCII DXF export remain in place.
