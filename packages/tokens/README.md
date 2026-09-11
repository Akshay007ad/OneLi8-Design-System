# @oneli8/tokens

[![npm](https://img.shields.io/npm/v/@oneli8/tokens?color=2c438b&label=npm)](https://www.npmjs.com/package/@oneli8/tokens)
[![licence](https://img.shields.io/npm/l/@oneli8/tokens?color=2c438b)](https://github.com/Akshay007ad/OneLi8-Design-System/blob/main/LICENSE)

**OneLi8 means One Light.**

A design system created by Akshay Dhore, intended for broad human benefit and
conceived as service to Guruji Shrii Arnav, whose teachings inspire it. Service,
clarity, harmony, proportion, restraint and evolution guide its decisions.

This package is the decisions on their own, with no markup: the vocabulary every
OneLi8 component reads. It is also the Tailwind package, with a version 3 preset
and a version 4 bridge.

```sh
npm install @oneli8/tokens
```

```js
import '@oneli8/tokens/css';             // every token as a :root custom property
import { tokens } from '@oneli8/tokens'; // flat { 'color-text-primary': '#151817', ... }
```

The names follow a grammar, and the grammar is borrowed from Sanskrit rather
than from a CSS convention. A compound that names one thing is written as one
word, and a qualifier stays separate from what it qualifies. That is the whole
rule, and the Naming section below works through it.

Figma is the authority on the result. Every variable there carries an explicit
code syntax, recorded verbatim in `src/figma-code-syntax.txt`, so a component
reads the spelling the designer set rather than one re-derived from the grammar.
Where the file spells two siblings differently, this package reproduces both
rather than tidying one. The grammar is the rule; the record is the spelling.

The vocabulary is authored across `src/primitive.json`, `src/semantic.json`,
`src/component.json` and `src/themes.json`, each value carrying its own
description. Everything under `build/` is generated, so edit the source and
rebuild rather than the output.

## What the vocabulary contains

601 tokens in three tiers: 170 primitives, 270 semantic roles and 161 component
roles. Nine colour ramps, a 3px atomic dimension scale, nine radii, nine
composite typography roles, five elevation surfaces and the Gem material.

The tiers are not decoration. A primitive is a value, a semantic role is a
decision, and a component role is that decision applied to one part of one
component. Each tier may only reference the tier above it, and the build refuses
a component token that reaches straight for a primitive.

Two rules matter when consuming it:

- **Use semantic roles, not primitives.** `color-blue-600` is a swatch;
  `color-actionprimary-default` is a decision. Primitives are hidden from Figma
  pickers for the same reason.
- **Use a whole typography role, not loose font variables.** Typography is
  composite in Figma: a role bundles family, size, line height, weight and
  tracking, and those five belong together. Nine roles ship, each as five
  custom properties.

```css
.article-lead {
  font-family:     var(--ol8-typography-body-large-font-family);
  font-size:       var(--ol8-typography-body-large-font-size);
  font-weight:     var(--ol8-typography-body-large-font-weight);
  line-height:     var(--ol8-typography-body-large-line-height);
  letter-spacing:  var(--ol8-typography-body-large-letter-spacing);
}
```

  The roles are `display-large`, `display-medium`, `display-small`,
  `title-large`, `title-medium`, `title-small`, `body-large`, `body-medium` and
  `body-small`. This package ships custom properties and no class names, so
  nothing here can collide with your own stylesheet.

## Entry points

| Import | What it gives you |
|---|---|
| `@oneli8/tokens` | flat `{ name: value }` map, with a literal union key type |
| `@oneli8/tokens/css` | every token as a CSS custom property |
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
