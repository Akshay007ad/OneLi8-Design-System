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

## Licence

Apache-2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`.
