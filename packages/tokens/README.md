# @oneli8/tokens

The canonical machine-readable source for Oneli8. Authored DTCG-compatible
files live in `src/`; everything under `build/` is generated.

## Build

```sh
npm run build
npm test
```

When building a distributed token package without the development repository,
use `node scripts/build.mjs --standalone` (or `node scripts/test.mjs --standalone`).
This skips only external contract-file existence checks. Token references,
schema-related checks and generated values are unchanged. The historical status
registry is not proof that those components are included in a scoped distribution.

## Delivery adapters

- CSS: `@oneli8/tokens/css`
- TypeScript/JavaScript: `@oneli8/tokens`
- Tailwind CSS v3 preset: `@oneli8/tokens/tailwind`
- Tailwind CSS v4 theme bridge: `@oneli8/tokens/tailwind.css`
- Figma importer data: `@oneli8/tokens/figma`
- Component maturity registry: `@oneli8/tokens/status`

Tailwind is an adapter. It never becomes the source of Oneli8 values.
Its spacing keys preserve the familiar 3px-indexed utilities: `1 = 3px`,
`2 = 6px`, `4 = 12px`, `8 = 24px`, through `36 = 108px`.
Semantic colors are exposed as utilities such as
`bg-ol8-background-canvas`, `text-ol8-text-primary`, and
`bg-ol8-action-primary-default`. Product interfaces should not assign
meaning with raw Candidate 03 palette steps.

## Color modes

Color Scheme and Primary Family are independent attributes. They can be
combined without selecting a prebuilt Cartesian-product theme:

```html
<main data-ol8-color-scheme="dark" data-ol8-primary="orange">
  ...
</main>
```

- `data-ol8-color-scheme="light|dark"`
- `data-ol8-primary="blue|orange|green"`
- `data-ol8-type-mode="compact|medium|expanded"`

The CSS keeps Semantic color references live through custom-property aliases,
so changing the Primary family updates its Default, Hover, Pressed, content,
link, and qualified focus roles together.

## Elevation and Gem material

Five visual elevation roles and five independent stacking tiers are generated
for CSS, Tailwind, TypeScript, and Figma. Tailwind examples include
`shadow-ol8-raised`, `shadow-ol8-overlay`, and `z-ol8-modal`.

Gem material colors preserve their Candidate 03 references and governed alpha.
They are optional environmental-material roles, not replacements for
`Color / Surface`, feedback, selection, focus, or action semantics. Reduced
Transparency resolves through each recipe's opaque equivalent.

### Tailwind CSS v3

```js
import oneli8 from "@oneli8/tokens/tailwind";

export default {
  presets: [oneli8],
};
```

### Tailwind CSS v4

```css
@import "tailwindcss";
@import "@oneli8/tokens/tailwind.css";
@import "@oneli8/tokens/css";
```

The current encoding contains approved Dimension, Spacing, Sizing, Shape,
Border, Focus, Typography, Motion, Candidate 03 Color, Semantic Light/Dark
color modes, Blue/Orange/Green Primary families, Elevation, stacking order,
approved Gem material geometry and colors, plus 125 approved Component geometry
recipes and ten evidence-backed maturity records. The Navigation slice adds
shared recipes for Tabs, Segmented Control, and Tab Bar without creating
component-private foundation scales.

Thin agent adapters live in `../agent/`. A browser example that consumes the
generated CSS, ESM tokens, and maturity registry without copying values lives
in `../../examples/web-token-consumer/`.
