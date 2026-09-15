# Sheet Nester v3.3 — real flag regression release

This build was made against the supplied `New flag concept.DXF` and the failing 120-part export.

**Nesting:** Fine mode now has a dedicated safe sheared-lattice search for repeated copies of one profile. Row offsets accumulate instead of alternating between only two positions, and several horizontal pitches are tested because a slightly wider column pitch can allow much tighter vertical interlocking. The existing full 0.2 mm pairwise clearance audit remains mandatory.

**DXF export:** spline jobs now use a full canonical AutoCAD R2000 document container (HEADER, CLASSES, standard TABLES, BLOCKS, ENTITIES and OBJECTS) rather than the hand-minimal container in v3.2. Generated entities belong to model space. Source SPLINE flags, degree, knots, weights and control points are retained.

The DWG worker/licensing arrangement is unchanged. Upload every file in this package together.
