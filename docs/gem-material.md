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

## Six stacks over one photograph, and why the fallback is not opaque

Gem is worn. The background is the real world, so every stack is judged against
the same photograph — all six, both modes. A flat surface behind a glass
demonstration proves nothing, and two different plates make the two appearances
incomparable. The plate's regions run from `rgb(9,9,9)` to `rgb(229,226,223)`,
so one image covers the best and worst case at once.

| | Gem Material (297:607) | Gem Reduced Transparency (306:825) |
|---|---|---|
| face | `quiet.environmentalFace` | `quiet.legibilityFace` |
| Light / Dark | 0.09 light tint / 0.09 dark tint | 0.72 dark, both appearances |
| backdrop blur | `blur.environmental` 9px | none |
| content | stable near-white + 4 stacked halos | identical |
| scene still visible | 91% in both | 28% |
| worst region measured | 4.67:1 Light, 5.32:1 Dark, AA | 7.70:1, AAA |

**The reduced mode is not an opaque panel, and that is the whole point.** A
solid surface would occlude the street for the person who needs help reading
the interface most — the same hazard as blurring the view during a sprint. So
the reduced mode is *denser*, not solid: 0.72 keeps 28% of the scene reaching
the eye and still measures 7.70:1 against near-white ink in the worst region of
the plate, with no credit taken for the halo. That is AAA while remaining
background-aware.

It is the same value in both appearances, because when legibility is the
priority there is one answer rather than a light preference and a dark one.

`quiet.opaqueEquivalent` still exists for conventional screens, where the
platform's `prefers-reduced-transparency` genuinely means remove the effect. On
a head-mounted display that flag should resolve to `legibilityFace` instead.
`.ol8-gem[data-ol8-transparency="reduced"]` is the per-surface opt-in, because
a media query cannot tell a phone from a lens.

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

Both appearances are equally transparent at 0.09 and differ only in hue — a
near-white tint in Light, a near-black one in Dark. Dark was 0.48, which made
it half as see-through as Light for no reason contrast could justify: measured
with the four-stack halo, a dark face at 0.09 reads **5.32:1** in the worst
region, *better* than the light face at the same alpha (4.67:1), because a dark
tint helps near-white ink rather than fighting it. A dark tint still belongs to
the Dark appearance; it just does not need to be thicker.

`quiet.opaqueEquivalent` follows its own face: `neutral.030` in Light,
`neutral.840` in Dark.

## Eight stacks, not six

The Radio proof carries its own pair — `Light Gem Slab` (`343:1181`) and
`Dark Gem Slab` (`343:1201`) under `Template Proof / Radio / Gem Material`.
They were on flat `Surface / Raised` with pastel blob rectangles and dark text
long after the Checkbox stacks moved to a photograph, which is the drift that
comes from treating one proof as the canonical one. Both now sit over the same
plate with the same ink and halo. Radio has no Reduced Transparency
counterpart; Checkbox is the only family with all six.

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

## One glow, shared by glyphs and control geometry

Content on Gem means **all** content. A near-white label beside a dark
checkbox outline is the material half-applied, and it was: the unselected
indicator boundary bound `Color / Border / Strong`, dark in the Light
appearance, long after the labels went near-white.

The rule, in both directions:

- the **unselected** control boundary takes `quiet.content`, the same ink as
  the label, because an empty checkbox is a glyph rather than chrome
- **selected** and **mixed** indicators are left alone — they fill with the
  primary action family and carry their own white mark, which already reads on
  glass
- iconography takes `color.icon.onGem`, which already exists for exactly this
  and is already stable across appearances
- **disabled takes none of it**, in either mode: it resolves to the opaque
  equivalent where the regular disabled ink applies, so no gem ink and no halo

Text takes four repetitions, control geometry takes **three**. WCAG 1.4.11 asks
3:1 of a graphical object where 1.4.3 asks 4.5:1 of text, so the boundary does
not need the fourth — and leaving it off is what keeps the indicator blended
into the glass rather than ringed. At 3px: text in four stacks is 5.06:1, the
boundary in three is 3.75:1.

A softer "white yet grey" ink was measured and does not survive. Diluting the
boundary to 0.84, 0.72 or 0.66 alpha reads 1.18:1, 1.15:1 and 1.14:1 against
the brightest region — the stroke simply disappears into bright sky. The ink
stays at full `quiet.content` and the softness comes from the glass beneath it
and the tight halo around it, not from thinning the paint.

The halo is one definition, expressed in two syntaxes because the platform
forces it. Text can take `text-shadow`; an SVG stroke cannot, so control
geometry takes the identical halo through chained `drop-shadow()` filters:

```css
--_gem-glow: 0 0 var(--ol8-material-gem-blur-contentglow)
             var(--ol8-material-gem-color-quiet-contentglow);
--_gem-glow-filter:
  drop-shadow(var(--_gem-glow)) drop-shadow(var(--_gem-glow))
  drop-shadow(var(--_gem-glow)) drop-shadow(var(--_gem-glow));
```

Both are built from the same two tokens, which is what makes a label's glow and
a control's glow read as one field instead of two near-misses. Change the
radius or the colour and both follow. The definitions live on every Gem surface
— button, icon button, field control, `.ol8-gem` and the Choice Item — because
descendants read them.

The radius is `dimension.scale.003`, the tightest on the scale, and it is both
the crispest and the strongest. In four stacks a 3px halo reads 5.06:1 on the
brightest region against 4.74:1 at 6px and 4.16:1 at 9px. Wider is weaker
because blur spreads a fixed alpha budget, and wider also reads as fog rather
than as an edge — so the tight radius is what stops a Gem surface looking
over-glowed while giving the most headroom.

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
