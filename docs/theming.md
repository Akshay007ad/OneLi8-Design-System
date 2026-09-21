# Themes, tokens and Gem Morphism

[Back to OneLi8](../README.md) · [Gem material, measured](gem-material.md) · [Components](components.md)

Import `@oneli8/react/styles.css` once; it also imports the token stylesheet.
Choose independent theme axes on an ancestor:

```jsx
<main data-ol8-color-scheme="dark" data-ol8-primary="orange">
  <Button>Save</Button>
</main>
```

Current preset axes: light/dark; blue/orange/green primary; compact/medium/expanded
typography via `data-ol8-type-mode`. Blue is a default, not a required brand color.
Custom palettes require editing the semantic theme mappings and rebuilding—not
passing an arbitrary new color name as an attribute.

## OneLi8 Modularity

Primitive palette → semantic purpose → component role → component.
Change the upstream role once rather than recoloring individual components.
Edit source JSON in `packages/tokens/src`, not generated files. From a repository
checkout, `npm run build` regenerates outputs. Run token tests afterward; repack
and reinstall your customized package. Do not edit node_modules for lasting changes.

The complete 586-token vocabulary is shipped to preserve references. Tokens for
an unexported component do not mean that component is available in the beta.

## Gem Morphism is a material, not a second component

```jsx
<Button material="gem">Continue</Button>
```

Gem shares the approved anatomy, size and behavior of Regular controls. Its Cut,
Color, Clarity and Carat/weight principles come from OneLi8's philosophy. Preserve
the bezel, semantic tint and near-white content. Do not substitute local gradients
or make every transparent surface faceted.

Gem does not dynamically sample the background and flip its text color. Test
the actual backdrop; transparency and near-white content alone do not guarantee
contrast. XR is a design direction, not physical-device certification.

Which content a Gem surface carries depends on which face it uses, and getting
that pairing wrong is the most common Gem mistake in both directions:

| face | where it is used | its content |
|---|---|---|
| `quiet.environmentalFace` | over imagery or the real world | stable near-white `quiet.content` plus the stacked `quiet.contentGlow` halo; disabled takes `quiet.contentDisabled` with no halo |
| `quiet.stabilizedFace` | app chrome, including the filled field, Select and Combobox | ordinary `color.text.*`, no halo |
| `quiet.legibilityFace` | reduced transparency — denser, never opaque | same content as the environmental face |

Near-white ink on a stabilized face over a light page is invisible; ordinary
dark ink on an environmental face over daylight scenery is unreadable. The
reduced mode is deliberately not opaque, because Gem is worn and a solid
surface would occlude the world for the person who needs help reading it.

[docs/gem-material.md](gem-material.md) carries the measured values, the Figma
node each was read from, and why widening a halo makes it weaker.

## Tailwind adapters

Tailwind 3 preset (keep your own content paths):

```js
import oneli8 from '@oneli8/tokens/tailwind';
export default {content: ['./src/**/*.{js,jsx,ts,tsx}'], presets: [oneli8]};
```

Tailwind 4 CSS:

```css
@import "tailwindcss";
@import "@oneli8/tokens/tailwind.css";
@import "@oneli8/react/styles.css";
```

Tailwind supplies utility access; it does not replace canonical component styles.
See the token package README for the generated CSS, JavaScript and Figma data
entry points. Typography tokens do not download fonts: load your chosen licensed
font in your application, or accept the configured fallback.
