# Oneli8 Design System

A design system synced from Figma. The components are framework agnostic: each
one renders an HTML string and hydrates markup that already exists, so there is
no framework to adopt, no virtual DOM and no build step.

```bash
npm install @oneli8/core
```

```js
import { renderButton, hydrateButtons } from '@oneli8/core';
import '@oneli8/core/styles.css';

document.querySelector('#toolbar').innerHTML = renderButton('Save', {
  variant: 'primary',
  leadingIcon: 'add',
});

hydrateButtons();
```

That is the whole pattern. `render*` builds markup, `hydrate*` wires up the
parts that markup alone cannot express.

## What is included

| Tier | Components |
|---|---|
| Atom | Icon, Selection Indicator (checkbox, radio, switch) |
| Molecule | Button, Icon Button, Choice Item, Selection Option |
| Organism | Choice Group (checkbox hierarchy, radio group) |
| Material | Gem, an attribute adapter rather than a tier |

Nothing else is exported. Tokens exist for component families that are not
implemented yet, so a token is never a promise that a component ships.

Install `@oneli8/tokens` on its own if you want the design decisions without the
components. It carries CSS custom properties, a typed JavaScript map, Tailwind
presets for versions 3 and 4, a Figma round trip payload and component status
records.

## Rendering and hydration

`render*` covers everything that can be said in markup. `hydrate*` exists only
for the rest:

* `indeterminate` on a checkbox is a JavaScript property with no HTML
  equivalent, so the Mixed state needs hydration and no other state does.
* A `<button>` with no explicit `type` submits its form. Hydration pins it.
* Links cannot be natively disabled, so they receive `aria-disabled`, leave the
  tab order and have their activation swallowed.

Hydration is idempotent. Running it twice changes nothing.

## Theming

Two independent attributes. Set both and you get both. There is no combined
mode to opt into.

```html
<html data-ol8-color-scheme="dark" data-ol8-primary="orange">
```

| Attribute | Values | Effect |
|---|---|---|
| `data-ol8-color-scheme` | `dark` | Remaps 86 semantic roles onto dark primitives. Omit it for light. |
| `data-ol8-primary` | `blue` (default), `orange`, `green` | Repoints the primary ramp at another family. |

Swapping the family works because semantic roles reference the ramp rather than
baking a colour. Follow the same rule in your own CSS: reach for the semantic
role, not the primitive underneath it, or your interface will not follow the
theme.

## Styles

`@oneli8/core/styles.css` loads the tokens and every component sheet in the
order they need. To take only what you use, import the pieces:

```js
import '@oneli8/tokens/css';
import '@oneli8/core/styles/button.css';
```

Tokens always come first, because every component rule reads them.

## Accessibility is enforced, not suggested

`renderIconButton` throws without an accessible name. `renderButton` throws for
`material: "gem"` on Quiet or Destructive, because Figma approves Gem for
Primary and Secondary only. These are errors rather than review comments by
design.

Test Gem against the backdrop it will actually sit on. Content that is close to
white cannot guarantee readable contrast on its own.

## Component notes

### Icon

Colour is never set on an icon. Every stroke and fill is `currentColor`, and the
component around it supplies the semantic colour.

### Button

Four families: `primary`, `secondary`, `quiet`, `destructive`. Four sizes:
`compact` at 36px, `standard` at 42px, `comfortable` at 48px, `large` at 60px.

**States are not classes.** Figma's six States are visual evidence for review.
In code they are `:hover`, `:active`, `:focus-visible`, `[disabled]` and
`[data-ol8-loading]`. There is no `.ol8-btn--hover`. The Figma component
description says it directly: these "must not become fake visual axes."

### Icon Button

Two boxes, deliberately. The outer element is the protected target at
48/48/48/60, and the inner surface is the visible box at 36/42/48/60. At Compact
the visible box is 36px while the hit area stays 48px. Collapsing the two would
silently break the touch target.

### Gem material

```html
<button type="button" class="ol8-btn ol8-btn--primary"
        data-ol8-material="gem" data-ol8-size="standard">
  <span class="ol8-btn__label">Button</span>
</button>
```

An attribute, not a variant. Geometry, semantics and behaviour all come from the
regular button.

The body uses three stops on `to bottom right`. Figma bakes an angle into each
instance (153.1595° at 83x42, 151.6609° at 89x48, 149.2872° at 101x60), but every
one satisfies `θ = 90° + atan(W/H)`, which is exactly what CSS's corner keyword
computes. The keyword holds at any label width. A baked degree would not.

## Deliberate deviations from the Figma source

These are the only places the code does not mirror Figma. Each one is a defect
in the source, fixed here and recorded in git history.

### Icon Button glyph contrast, WCAG 1.4.11

Figma binds the Icon Button glyph to `--ol8-color-icon-primary` (`#151817`) for
every family. On the dark Primary and Destructive surfaces that measures 1.94:1
and 2.17:1, against a 3:1 minimum for graphical objects.

The glyph now binds to the action's own content role:

| | Figma | Here |
|---|---|---|
| primary | 1.94:1 | **8.81:1** |
| destructive | 2.17:1 | **7.88:1** |

Disabled keeps dark ink, because its surface is light, and still passes at
4.86:1. To restore the Figma exact behaviour, drop the `--_ink` declarations
from `.ol8-icon-btn--primary` and `.ol8-icon-btn--destructive`.

### Button loading with a leading icon

Figma's codegen emits both the leading icon and the spinner while loading. The
measured Loading widths (101/107/122/134, which is default plus spinner plus
gap) come from variants that carry no leading icon, so they cannot settle it.

The default here is that the spinner takes the leading slot: one leading glyph,
predictable width. Figma's literal reading is one flag away.

```js
renderButton('Saving', { leadingIcon: 'add', loading: true,
                         keepLeadingIconWhileLoading: true });
```

`hydrateButtons` honours the same attribute. Icon Button is unaffected, because
it has a single glyph slot and the spinner always replaces it.

### Focus ring band widths

Figma binds `--ol8-focus-ring-outerwidth` to 3, and both focus tokens describe a
band thickness rather than a distance from the edge. This tree carried 6px,
which was correct only for `box-shadow`, where spread accumulates outward. Used
as a border width on Choice Item and Selection Option, the same token painted an
outer ring at twice its intended weight.

Both tokens are now 3px. Icon Button composes its cumulative spread explicitly:

```css
box-shadow:
  0 0 0 var(--ol8-focus-ring-innerwidth) var(--ol8-color-focus-inner),
  0 0 0 calc(var(--ol8-focus-ring-innerwidth) + var(--ol8-focus-ring-outerwidth))
        var(--ol8-color-focus-outer);
```

Icon Button renders exactly as before. The two selection components now render
the ring their own comments describe: 3px dark outside, 3px light inside.

Figma also declares the outer shadow first, and `box-shadow` paints the first
layer on top, so the dark spread would cover the light band entirely and only a
flat dark ring would render. The order is reversed here so both bands show.

## Corrected at the source

Fixed in Figma and in code together, so nothing diverges:

* **Selection controls did not share a language.** The checked Checkbox filled
  its box, the selected Radio drew a ring, and both used Selection Surface for
  every part. The Radio's ring and dot were the same pale colour, measuring
  1.16:1 on the canvas against a 3:1 minimum for graphical objects, so a
  selected Radio was less visible than a disabled one.

  Both are now the primary action pairing, the same one the primary Button uses:
  the boundary drops, the indicator fills with Action Primary Default at 8.81:1,
  and the mark is Action Primary Content at 8.81:1 on that fill. A selected Radio
  is a checked Checkbox in a circle. Six Figma variants were repointed and the
  CSS follows; disabled states keep their own pairing and were not touched.

## Known issues in the Figma source

Reproduced faithfully rather than silently corrected:

* `Icon / Action / Clear` (557:4). Ink spans 3 to 17, centred at (10, 10) in the
  24 unit box instead of (12, 12), and is 14 units wide where the visually
  identical `Close` (894:123) is 12 units centred at (12, 12). Clear reads larger
  and sits above and left of every other master.
* `Icon / Action / Visibility Closed` (440:15). Ink centre y is 13.65. Probably
  intentional, since a closed lid sits low, but flagged for confirmation.
* **Large artwork: the documentation says 36px, the components use 24px.** The
  Iconography note (85:9) states artwork of 18/18/24/36, but the built Large
  components measure a 24px glyph and no `artwork-large` variable exists. Built
  components win.
* **`Icon / Action / Add` at Size=Small (379:2) is documented wrongly.** Its
  description claims an independently drawn 18px optical master with a 1.5px
  rounded stroke. The built asset is an exact 0.75 scale of the 24px master:
  `M12 5V19M5 12H19` at 1.8 becomes `M9 3.75V14.25M3.75 9H14.25` at 1.35. That
  matches Icon Frame's own rule that no per size source or stroke tokens exist,
  and the code follows the built asset.
* `--ol8-component-icon-stroke` reports `1.7999999523162842`, a float32 artifact
  of 1.8. It is normalised to `1.8` in `tokens.json`, matching the documented
  universal optical stroke.

`npm run sync:icons` re runs the optical centre audit on every sync.

## Working on the system itself

```bash
npm install
npm run build          # tokens, adapters, icons, then the structure check
python3 -m http.server 8347
```

Open `/proof/` and pick a page. Each one renders every variant of a component so
a change is visible immediately.

`npm run check` enforces the structural rules on their own: margins belong to
parents rather than components, atoms compose nothing, and every pixel token
sits on the 3px grid.

Tokens are generated. Edit `packages/tokens/src/tokens.json` and rebuild. Never
edit anything under `dist/`.

## For AI agents

Read `llms.txt` first, then `ai-context.json`. Those two files carry the rules,
the Figma node identifiers and the property mappings. This README does not
repeat them.

## Licence

Apache 2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`, and preserve the
attribution notices when redistributing. Nothing here requires a visible badge in
your product, and nothing implies Oneli8 endorsement.
