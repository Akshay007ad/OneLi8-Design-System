---
name: oneli8-ui
description: Compose UI using the OneLi8 public beta components and tokens without recreating canonical owners.
---

Locate the extracted public beta bundle and read its README.md, PRINCIPLES.md and
packages/react/src/index.d.ts. If unavailable, obtain it rather than inventing
APIs. Paths here are relative to the bundle root.

Before composition, record the public component, icon identity, semantic color,
material, size and layout responsibility. Import from @oneli8/react; use generated
tokens rather than copied values. Reuse source atoms inside their existing
molecules. A new wrapper does not become a new atom merely because it is small.

Keep optional slots collapsible and parent/child insets intentional. Do not copy
private implementations into a product. For unsupported families, explicitly
separate consumer-owned work from canonical OneLi8; do not claim it is provided.
New canonical patterns need Mobbin visual research, official interaction guidance
and maintainer approval, not copied visual identity.

Gem has two faces and they imply different content. Choosing the wrong pairing
is the most common Gem error, in both directions: near-white ink on a stabilized
face over a light page is invisible, and ordinary dark ink on an environmental
face over daylight scenery is unreadable.

material.gem.color.quiet.environmentalFace is a surface over imagery or the real
world. Its content is material.gem.color.quiet.content, a stable near-white in
BOTH appearances, and it carries the material.gem.color.quiet.contentGlow halo at
material.gem.blur.contentGlow: four stacked shadows for text, three for control
geometry, because 1.4.11 asks 3:1 of a graphical object where 1.4.3 asks 4.5:1 of
text. That means every glyph AND the unselected control boundary and any icon, not
the label alone. Disabled takes material.gem.color.quiet.contentDisabled, one
whitish grey shared by text and control geometry, and no halo.

material.gem.color.quiet.stabilizedFace is the local content plane on app chrome,
including the filled Gem text field, Select and Combobox. Its content is ordinary
color.text.* and takes no halo. Selected and mixed indicators are never restyled
on either face; they fill with the primary action family and carry their own mark.

material.gem.color.quiet.legibilityFace is the reduced-transparency mode. It is
denser, never opaque, because Gem is worn and a solid surface would occlude the
world for the person who needs help reading it. It uses the same content as the
environmental face.

Never thicken a face to win contrast, and never widen the halo: blur spreads a
fixed alpha budget, so a wider halo is a weaker halo. docs/gem-material.md carries
the measured values and the Figma node each was read from.

Check light/dark, Regular/Gem, focus, loading/disabled, accessible names and long
content where applicable. Do not claim screen-reader testing from HTML checks.
Record changed owners and the Figma/code impact; unavailable evidence stays open.
The public beta's smoke tests verify packaging, not downstream UI correctness.
