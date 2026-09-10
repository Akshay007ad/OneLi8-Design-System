# @oneli8/tokens

OneLi8 Design System — design tokens compiled from Figma.

```sh
npm install @oneli8/tokens
```

```js
import '@oneli8/tokens/css';        // :root custom properties + .ol8-type-* classes
import { tokens } from '@oneli8/tokens';  // flat { 'color-text-primary': '#151817', ... }
```

Every value is generated from `src/tokens.json`, which is verified against the
Figma file rather than hand-maintained. Do not edit `dist/` — edit the source and
rebuild.

## What the vocabulary contains

99 colour primitives across 9 ramps, 68 semantic colour roles, 45 Gem material
roles, 27 control-material roles, a 3px-atomic dimension scale, 9 radii, 9
composite typography roles and 5 elevations.

Two rules matter when consuming it:

- **Use semantic roles, not primitives.** `color-blue-600` is a swatch;
  `color-actionprimary-default` is a decision. Primitives are hidden from Figma
  pickers for the same reason.
- **Use the `.ol8-type-<role>` class, not individual font variables.** Typography
  is composite in Figma — a role bundles family, size, line height, weight and
  tracking — and the class applies all of them together.

## Theming

Three independent axes, each an attribute. They compose — set two at once and you
get both; there is no Cartesian product of pre-baked modes.

```html
<html data-ol8-color-scheme="dark" data-ol8-primary="orange">
```

| Attribute | Values | Effect |
|---|---|---|
| `data-ol8-color-scheme` | `dark` | Remaps 86 semantic roles onto dark primitives. Omit for light. |
| `data-ol8-primary` | `blue` (default), `orange`, `green` | Repoints the `color-primary-*` ramp at another family. |

Family swapping works because semantic roles are emitted as *references*
(`--ol8-color-actionprimary-default: var(--ol8-color-primary-600)`), never as
baked hex. Repoint the ramp and every role that reads it repaints. Anything you
author yourself should follow the same rule: reference the semantic role, not a
primitive, or your UI will not follow the theme.

Not yet ported from the Figma theme source: the `typographyViewport` axis
(`medium` / `expanded`), which needs `font.size.090`, `font.line.096` and a
`font.tracking.*` scale this tree has never synced; dark overrides for the five
`elevation-*` composites; and dark link-state and icon-button-surface roles,
which have no token in this vocabulary yet.

## Licence

Apache-2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`.
