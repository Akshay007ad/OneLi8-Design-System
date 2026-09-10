# @oneli8/tokens

OneLi8 Design System, design tokens compiled from Figma.

```sh
npm install @oneli8/tokens
```

```js
import '@oneli8/tokens/css';        // :root custom properties + .ol8-type-* classes
import { tokens } from '@oneli8/tokens';  // flat { 'color-text-primary': '#151817', ... }
```

Every value is generated from `src/tokens.json`, which is verified against the
Figma file rather than maintained by hand. Do not edit `dist/`, edit the source and
rebuild.

## What the vocabulary contains

99 colour primitives across 9 ramps, 68 semantic colour roles, 45 Gem material
roles, 27 control material roles, a 3px atomic dimension scale, 9 radii, 9
composite typography roles and 5 elevations.

Two rules matter when consuming it:

- **Use semantic roles, not primitives.** `color-blue-600` is a swatch;
  `color-actionprimary-default` is a decision. Primitives are hidden from Figma
  pickers for the same reason.
- **Use the `.ol8-type-<role>` class, not individual font variables.** Typography
  is composite in Figma, a role bundles family, size, line height, weight and
  tracking, and the class applies all of them together.

## Entry points

| Import | What it gives you |
|---|---|
| `@oneli8/tokens` | flat `{ name: value }` map, with a literal union key type |
| `@oneli8/tokens/css` | the custom properties and `.ol8-type-*` classes |
| `@oneli8/tokens/tailwind` | Tailwind v3 preset |
| `@oneli8/tokens/tailwind.css` | Tailwind v4 `@theme` bridge |
| `@oneli8/tokens/figma` | round trip payload: collections, theme modes, type and elevation styles |
| `@oneli8/tokens/status` | component maturity records |
| `@oneli8/tokens/source` | the editable `tokens.json` |

```js
// tailwind.config.js (v3)
import ol8 from '@oneli8/tokens/tailwind';
export default { presets: [ol8], content: ['./src/**/*'] };
```

```css
/* Tailwind v4 */
@import "@oneli8/tokens/css";
@import "@oneli8/tokens/tailwind.css";
```

Both adapters emit `var(--ol8-*)` references rather than resolved values, so
Tailwind classes follow the theme attributes exactly like the raw custom
properties do. `bg-ol8-actionprimary-default` repaints when you switch the
primary family; it does not bake a blue at build time.

The JS map is the exception: it holds resolved literals, because code that reads
it wants an actual colour, not a `var()` string.

## Why this exists

OneLi8 means One Light. It was created by Akshay Dhore, intended for broad human
benefit and conceived as service to Guruji Shrii Arnav, whose teachings inspire
it. Service, clarity, harmony, proportion, restraint and evolution guide its
decisions. `PRINCIPLES.md` ships inside this package and sets them out in full.

The practical intention: most design systems hand you components and hope you
stay inside them. This one hands you the reasoning too, so when you need
something it does not ship you can build it and have it still belong.

## Naming

The structure is borrowed from Sanskrit grammar rather than a CSS convention.

**A compound naming one thing is one word.** `actionprimary` is not action plus
primary, it is a single role. `cutedge` is one feature of the Gem material.

**A qualifier stays separate from what it qualifies.** In
`--ol8-material-control-gem--primary-hover-start`, `hover` is a state applied to
`start`, so it keeps its hyphen. That is why `disabledcontent` is joined and
`hover-start` is not.

Hyphens separate levels of the hierarchy, never words inside a level. The words
themselves stay readable: no abbreviations and no truncation.

## Theming

Three independent axes, each an attribute. They compose, set two at once and you
get both; there is no Cartesian product of pre baked modes.

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
`elevation-*` composites; and dark link state and icon button surface roles,
which have no token in this vocabulary yet.

## Licence

Apache 2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`.
