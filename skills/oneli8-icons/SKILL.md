---
name: oneli8-icons
description: Reuse or propose additions to the OneLi8 public beta neutral 24px icon pool with shared presentation and color.
---

Locate the public beta bundle. Read PRINCIPLES.md, packages/react/src/atoms/Icon.js,
packages/react/src/foundations/icons.generated.js and packages/react/src/styles/icon.css.
Icon owns drawing AND presentation: its `size` prop plus that stylesheet set the
frame, so there is no separate IconFrame module and no Icon.d.ts — types live in
index.d.ts and foundations/icons.generated.d.ts. These are the actual owners, not
templates to copy into controls.

Search OL8_ICONS first; isOl8IconName guards a name. Existing meaning uses its existing identity. For a missing
meaning, propose one neutral 24×24 source definition in the pool and update the
IconName type; no size-, color-, Gem- or consumer-specific duplicate masters.
Follow adjacent approved geometry and the shared semantic stroke token. Icons
scale GEOMETRICALLY from the 24px source, so the 1.8 stroke scales with the
artwork: 1.35 at 18px, 1.8 at 24px, 3.6 at 48px. Verified against Figma — the
Icon Frame Size=48 variant exports stroke-width 3.6 in a 48 viewBox (3.6/48 =
1.8/24), and the Icon Frame's own description states that no per-size source or
stroke tokens exist. The token set agrees: every stroke token is 1.8 and all 29
stroked paths in the pool are 1.8; there is no 1.2/2.4 step scale.

Do not put non-scaling-stroke on an icon. That belongs to Choice Chip
terminals, which stretch unevenly under preserveAspectRatio="none" and need a
constant edge; an icon scales uniformly and must not fight it. Filled marks
have no outline. Do not invent per-size stroke values.

Color follows currentColor and the consumer's semantic state. Button and
IconButton already own their IconFrame sizing. A new icon is a candidate until
Akshay approves it; an AI-generated candidate is not automatically canonical.
This skill is guidance, not an autonomous icon-generation program.

Test multi-part paths, clipping and color at 9, 12, 24 and a large display size;
test swaps in light/dark and Regular/Gem. Compare Figma geometry/instance behavior
when authorized access exists. Record unavailable checks instead of claiming sync.
