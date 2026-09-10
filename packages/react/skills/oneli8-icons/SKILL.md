---
name: oneli8-icons
description: Reuse or propose additions to the OneLi8 public beta neutral 24px icon pool with shared presentation and color.
---

Locate the public beta bundle. Read PRINCIPLES.md, packages/react/src/atoms/Icon.js,
packages/react/src/atoms/IconFrame.js and packages/react/src/Icon.d.ts. These are
the actual drawing and presentation owners, not templates to copy into controls.

Search iconNames first. Existing meaning uses its existing identity. For a missing
meaning, propose one neutral 24×24 source definition in the pool and update the
IconName type; no size-, color-, Gem- or consumer-specific duplicate masters.
Follow adjacent approved geometry and the shared semantic stroke token. The
shipped outlined paths use non-scaling-stroke; filled dots have no outline.
Do not substitute historic proportional stroke rules or invent per-size values.

Color follows currentColor and the consumer's semantic state. Button and
IconButton already own their IconFrame sizing. A new icon is a candidate until
Akshay approves it; an AI-generated candidate is not automatically canonical.
This skill is guidance, not an autonomous icon-generation program.

Test multi-part paths, clipping and color at 9, 12, 24 and a large display size;
test swaps in light/dark and Regular/Gem. Compare Figma geometry/instance behavior
when authorized access exists. Record unavailable checks instead of claiming sync.
