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

Check light/dark, Regular/Gem, focus, loading/disabled, accessible names and long
content where applicable. Do not claim screen-reader testing from HTML checks.
Record changed owners and the Figma/code impact; unavailable evidence stays open.
The public beta's smoke tests verify packaging, not downstream UI correctness.
