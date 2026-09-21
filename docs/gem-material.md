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

## The blur is what makes light Gem look opaque, not the tint

`material.gem.blur.environmental` was **18px** while `material.gem.blur.stabilized`
was 12px. That pair was inverted. The environmental face exists so the
environment can be *seen*, so it must blur **less** than the stabilized plane,
which is being read rather than looked through.

At 18px a soft environment flattens into one grey wash and the surface reads as
opaque at any alpha. This is why dropping the quiet face from 0.48 to 0.18
appeared to change nothing on the Gem material adapter slabs: the tint was
already transparent and the blur was destroying the evidence. Verified on
`Light and Dark comparison` (`297:610`) — at 9px the blue and pink environment
reads straight through in Light, and Dark improves too.

    environmental  9px   (Dimension / Scale / 009)
    stabilized    12px   (Dimension / Scale / 012)

## The gradient angle

Figma bakes a per-instance degree value, and every one of them satisfies
`theta = 90deg + atan(W / H)`, which is exactly CSS's `to bottom right`. Use
the keyword; a baked degree value is only correct at the one width it was
measured at. `proof/gem.html` proves this with a difference blend.

## Six stacks: three transparent, three opaque fallback

The Choice Controls page carries two parallel sets of three, and they answer
different questions. Do not make one look like the other.

| | Gem Material (297:607) | Gem Opaque Fallback |
|---|---|---|
| face | `quiet.environmentalFace` | `quiet.opaqueEquivalent` |
| backdrop blur | yes, `blur.environmental` 9px | none |
| content | stable near-white + stacked halo | `Color / Text / Primary` / `Secondary` |
| job | push transparency to the limit | be unconditionally legible |

The fallback is already the WCAG-safe mode by construction: an appearance-aware
solid under appearance-aware text, so Light is a light card with dark text and
Dark is a dark card with light text. It needs no halo and must not be given
near-white ink. Because the fallback covers the conservative case, the
transparent set is free to push.

## The face is nearly free; the halo is the whole constraint

| face | Light | Dark | content on it |
|---|---|---|---|
| `quiet.environmentalFace` | `neutral.030` @ 0.09 | `neutral.930` @ 0.48 | stable near-white |
| `quiet.stabilizedFace` | `neutral.030` @ 0.15 | `neutral.840` @ 0.27 | ordinary dark text |

Measured against near-white ink on the brightest region of a daylight plate, a
0.12 face reads 3.24:1 and a 0.18 face reads 3.18:1. A 0.06 change in tint
moves contrast by 0.06:1 — the face is almost irrelevant to legibility, so it
is free to be as thin as the appearance wants. Light is therefore at 0.09, the
most transparent value on the 0.03 grid.

What legibility actually depends on is the halo, so that is the term to solve.
`quiet.contentGlow` is `neutral.930` @ **0.84**, applied as **four stacked
shadows**. At 0.72 in three stacks the bright plate reads 3.18:1; at 0.84 in
four it reads about 4.9:1, clearing WCAG 1.4.3 for normal text. Stacking is
mandatory: a single shadow spreads a fixed alpha budget, so widening the radius
makes it weaker, while repeating it accumulates — `1 - (1 - a)^n`.

A dark tint belongs to the Dark appearance. Light stays light.
`quiet.opaqueEquivalent` follows its own face: `neutral.030` in Light,
`neutral.840` in Dark.

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

## If you clone a variant, the property references do not come with it

`component.clone()` produces a variant whose every layer has
`componentPropertyReferences: {}`. The layers are there, the fills are there,
and the instance still reports its property values — but nothing is wired, so
the variant renders the baked defaults. Cloning the 56 Gem=On variants left
`Label`, `Description`, `Show Description`, `Hover`, `Pressed`,
`Focus Visible` and `Invalid` all inert, and the slab rows rendered
"Checkbox label" while `componentProperties` still said "Default".

The repair is to copy `componentPropertyReferences` from the Gem=Off twin
layer by layer, in parallel tree order, dropping any reference whose property
no longer exists. 340 references across the three sets.

`Gem Surface` was also absolutely positioned at a fixed 360x48 with MIN/MIN
constraints in every variant, On and Off. It never stretched with the row. That
predates the axis conversion and nobody saw it because the layer was always
hidden; as soon as gem became visible the surface overflowed the row by 105px.
It is `STRETCH/STRETCH` now, on all 112 variants.

## Gem is a variant axis, not a boolean

`Choice Item / Checkbox` (`252:301`), `Choice Item / Radio` (`331:1309`) and
`Choice Item / Switch` (`825:1591`) each expose `Gem: On/Off` as a variant
axis — 48, 32 and 32 variants.

It was a boolean, and a boolean cannot work: Figma can toggle a layer's
visibility from one, but it cannot switch a fill, and there is no "NOT Gem" to
hide the dark label with. An axis gives each gem variant its own component
node, which can bind its label to `Quiet / Content` directly. This also matches
code, where gem is the attribute `data-ol8-material="gem"`.
