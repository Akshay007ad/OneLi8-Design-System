# The Gem material, as Figma actually builds it

Every number here was read off the Figma nodes named beside it, not inferred.
Three separate chats have re-derived this and got it wrong each time, so it
lives here and `npm run check:docs` gates it.

File `0wRnp6ulIEA8PCV6wqGmAJ`.

## Two things are called "the bezel" and they are not the same

| | inner shadows | angular stroke |
|---|---|---|
| Gem buttons, icon buttons | yes | **no stroke at all** |
| Gem text field controls | yes | yes, 1px INSIDE |
| Gem slab containers | yes | yes |

Gem buttons carry `strokes: []`. Verified on `Button / Primary / Gem`
(`100:4`), `Button / Secondary / Gem` (`100:209`), and the `Visible Surface`
frames inside `Icon Button / Primary / Gem` (`102:80`) and
`Icon Button / Secondary / Gem` (`102:153`). So for a button, the two inner
shadows *are* the whole bezel, and code is complete.

## The inner shadows, on every gem surface

Read off `Button / Primary / Gem :: Size=Compact, State=Default` (`100:4`) and
identical on `Text Field / Filled / Gem` control (`214:132`) and
`Text Field / Outline / Gem` control (`210:112`):

```
BACKGROUND_BLUR  radius 12                      -> Material / Control / Gem / Blur
INNER_SHADOW     offset 0,0  radius 0  spread 1  -> Material / Control / Gem / Rim / Default
INNER_SHADOW     offset 0,2  radius 1  spread 0  -> Material / Control / Gem / Rim / Specular
```

In CSS that is, exactly:

```css
backdrop-filter: blur(var(--ol8-material-control-gem--blur));
box-shadow:
  inset 0 2px 1px 0 var(--ol8-material-control-gem--rim-specular),
  inset 0 0 0 1px var(--_rim);
```

The spread-1 shadow was written `inset 0 0 0 0` for a long time. Spread 0
draws nothing, so the light rim never painted. A zero-spread inset shadow is
not a subtle bug, it is an absent layer.

## The angular stroke, on controls and containers only

`strokeWeight: 1`, `strokeAlign: "INSIDE"`, `gradientTransform` identity, five
stops, symmetric about `0.54`:

```
0.00  High
0.30  Mid
0.54  Low
0.78  Mid
1.00  High
```

The family depends on the appearance, and this is the part that keeps getting
mixed up:

| node | family |
|---|---|
| `Text Field / Filled / Gem` control (`214:132`) | `Material / Gem / Color / Inner Thin Cut / *` |
| `Text Field / Outline / Gem` control (`210:112`) | `Material / Gem / Color / Cut Edge / *` |
| `Light Gem Slab` (`297:617`), `Dark Gem Slab` (`297:743`), `Nested Gem Slab` (`297:870`) | `Material / Gem / Color / Cut Edge / *` |

`Cut Edge / High` is `0.72`. `Cut Edge / Outer High` is `0.93` — a different
token. Do not substitute one for the other.

**This stroke has no CSS implementation yet.** CSS has no gradient border that
follows `border-radius`, so it needs either a masked pseudo-element or a new
DOM node, and on `.ol8-field__control` both pseudo-elements are already spoken
for: `::before` carries the body gradient and the backdrop blur, `::after`
carries the two inner shadows, and `.ol8-field__control-stack::after` is the
focus edge. Adding it is a component-contract decision, not a CSS tweak. Until
it is made, a flat `--_border` colour stands in for the gradient.

## The face is two stacked layers, not one

On `Text Field / Filled / Gem` control (`214:132`), `fills` in paint order:

```
[0] SOLID            -> Material / Gem / Color / Quiet / Stabilized Face
[1] GRADIENT_LINEAR  -> Material / Control / Gem / Secondary / High, Mid, Low
                        at stops 0, 0.48, 1
```

`Text Field / Outline / Gem` (`210:112`) has only the gradient — no quiet face
at all. This is why changing `quiet.stabilizedFace` alone appears to do nothing
to the outline appearance: it is not in the stack.

Light composites to `0.2265 / 0.1755 / 0.201`, which `npm run test:tokens`
pins. Dark holds the previous `0.22 / 0.05 / 0.12` through overrides in
`packages/tokens/src/themes.json`, because a near-white gradient over a dark
environment is the sheen that reads as glass, while over a light one it reads
as milk.

## The gradient angle

Figma bakes a per-instance degree value, and every one of them satisfies
`theta = 90deg + atan(W / H)`, which is exactly CSS's `to bottom right`. Use
the keyword; a baked degree value is only correct at the one width it was
measured at. `proof/gem.html` proves this with a difference blend.

## Content on gem

`Material / Gem / Color / Quiet / Content` is near-white in **both**
appearances and carries no dark override, exactly like `color.icon.onGem`. Gem
sits over imagery of unknown brightness, so the ink cannot follow the app's
appearance.

The halo is `Material / Gem / Color / Quiet / Content Glow` at radius
`Material / Gem / Blur / Content Glow` (6px). It is a style, not a contrast
mechanism: measured over a bright plate it reaches only `1.71:1` at 12px, and a
wider radius makes it weaker, because blur spreads a fixed alpha budget over
more area. `proof/gem-halo-contrast.html` sweeps it. Light gem needs a local
scrim behind content to reach 4.5:1; no halo radius gets there.

## Which nodes take gem ink

Only what sits physically on the face.

- Text field: `.ol8-field__input` and `.ol8-field__affix` — inside the control.
  **Not** `.ol8-field__label`, which lives in `.ol8-field__label-row`, a
  sibling of `.ol8-field__control-stack`, so it sits on the page. Figma agrees:
  `Label Row / Label` is a sibling of `Control Stack`.
- Choice item: label and description both, because `.ol8-choice__surface`
  spans the row beneath them.
- Disabled never takes gem ink in either component; it resolves to the opaque
  equivalent, where the regular disabled ink applies.

## Gem is a variant axis, not a boolean

`Choice Item / Checkbox` (`252:301`), `Choice Item / Radio` (`331:1309`) and
`Choice Item / Switch` (`825:1591`) each expose `Gem: On/Off` as a variant
axis — 48, 32 and 32 variants.

It was a boolean, and a boolean cannot work: Figma can toggle a layer's
visibility from one, but it cannot switch a fill, and there is no "NOT Gem" to
hide the dark label with. An axis gives each gem variant its own component
node, which can bind its label to `Quiet / Content` directly. This also matches
code, where gem is the attribute `data-ol8-material="gem"`.
