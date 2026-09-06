# Oneli8 Design System

Vanilla, headless, AI-native. Synced from Figma without Code Connect.

```bash
npm run build      # tokens + icons
python3 -m http.server 8347   # then open /proof/icons.html
```

## Atoms

### `ol8-icon`

```html
<link rel="stylesheet" href="packages/tokens/dist/tokens.css">
<link rel="stylesheet" href="packages/core/src/icon/icon.css">

<!-- decorative (default) -->
<span data-ol8-icon="add" data-ol8-icon-size="24"></span>

<!-- meaningful: promoted to role="img" + aria-label -->
<span data-ol8-icon="close" data-ol8-icon-label="Dismiss"></span>

<script type="module">
  import { hydrateIcons } from './packages/core/src/icon/icon.js';
  hydrateIcons();
</script>
```

Or render to a string at build time:

```js
import { renderIcon } from '@oneli8/core/icon';
renderIcon('forward', { size: 36 });
```

17 masters: 14 neutral sources from `Icon Library / Masters` plus three
selection glyphs (`check`, `mixed`, `selected-dot`) that live outside that
frame.

**Sizes** — 9, 12, 18, 24, 30, 36, 48, 60, 72, 96, 108.
Scaling is *geometric*: the 1.8-unit source stroke scales with the box
(48px icon renders a 3.6px stroke), exactly as the Figma Icon Frame does.

**Color** — never set on the icon. Every stroke and fill is `currentColor`;
the consuming component supplies semantic color.

### `ol8-btn`

```html
<button type="button" class="ol8-btn ol8-btn--primary" data-ol8-size="standard">
  <span class="ol8-btn__label">Button</span>
</button>
```

Four families — `primary`, `secondary`, `quiet`, `destructive`.
Four sizes — `compact` 36px, `standard` 42px, `comfortable` 48px, `large` 60px.

**States are not classes.** Figma's six States are visual evidence for review;
in code they are `:hover`, `:active`, `:focus-visible`, `[disabled]` and
`[data-ol8-loading]`. There is no `.ol8-btn--hover`. The Figma component
description says so directly: these "must not become fake visual axes."

```js
import { renderButton, hydrateButtons, setButtonLoading } from '@oneli8/core/button';
renderButton('Save', { variant: 'primary', size: 'large', leadingIcon: 'add' });
```

### `ol8-icon-btn`

```html
<button type="button" class="ol8-icon-btn ol8-icon-btn--primary"
        data-ol8-size="standard" aria-label="Add item">
  <span class="ol8-icon-btn__surface">
    <span data-ol8-icon="add"></span>
  </span>
</button>
```

Two boxes, deliberately: the outer element is the **protected target**
(48/48/48/60), the inner surface is the **visible box** (36/42/48/60). At
Compact the visible box is 36px but the hit area stays 48px. Collapsing them
would silently break the touch target.

Accessible name is mandatory — `renderIconButton` throws without one and
`hydrateIconButtons` reports any unnamed button in the DOM.

### Gem material

```html
<button type="button" class="ol8-btn ol8-btn--primary"
        data-ol8-material="gem" data-ol8-size="standard">
  <span class="ol8-btn__label">Button</span>
</button>
```

An attribute, not a variant — geometry, semantics and behavior all come from
the regular button. Primary and Secondary only; `renderButton` throws for
Quiet and Destructive, matching Figma's "until a distinct Gem treatment is
explicitly approved".

The three-stop body uses `to bottom right`. Figma bakes a per-instance angle
(153.1595° at 83x42, 151.6609° at 89x48, 149.2872° at 101x60), but every one
satisfies `θ = 90° + atan(W/H)` — precisely CSS's corner keyword. The keyword
holds at any label width; a baked degree would not.

## Deliberate deviations from the Figma source

These are the only places the code does not mirror Figma. Each is a defect in
the source, fixed here and recorded in git history.

### Icon Button glyph contrast — WCAG 1.4.11

Figma binds the Icon Button glyph to `--ol8-color-icon-primary` (`#151817`)
for every family. On the dark Primary and Destructive surfaces that measures
**1.94:1** and **2.17:1**, against the 3:1 minimum for graphical objects.

The glyph now binds to the action's own content role:

| | Figma | here |
|---|---|---|
| primary | 1.94:1 | **8.81:1** |
| destructive | 2.17:1 | **7.88:1** |

Disabled keeps dark ink — its surface is light — and still passes at 4.86:1.
To restore the Figma-exact behaviour, drop the `--_ink` declarations from
`.ol8-icon-btn--primary` and `.ol8-icon-btn--destructive`.

### Button loading + leading icon — ambiguous source, now explicit

Figma's codegen emits **both** the leading icon and the spinner while loading.
The measured Loading widths (101/107/122/134 = default + spinner + gap) come
from variants that carry no leading icon, so they cannot settle it.

The default here is that the spinner **takes** the leading slot: one leading
glyph, predictable width. Figma's literal reading is one flag away:

```js
renderButton('Saving', { leadingIcon: 'add', loading: true,
                         keepLeadingIconWhileLoading: true });
```

```html
<button class="ol8-btn ol8-btn--primary"
        data-ol8-loading="true" data-ol8-loading-keep-icon="true"> … </button>
```

`hydrateButtons` honours the same attribute. Icon Button is unaffected — it
has a single glyph slot, so the spinner always replaces it.

### Icon Button focus ring — occluded inner band

Figma emits `0 0 0 6px focus-outer, 0 0 0 3px focus-inner`. `box-shadow`
paints the first layer on top, so the 6px dark spread completely covers the
3px light one and only a flat dark band renders — confirmed by sampling the
Figma export, which is uniform `#101b3a` at every perimeter position and at
both 2px and 4px depth.

The declaration order is reversed here, so both bands show: light from the
edge to 3px, dark from 3px to 6px — the ring the two tokens describe. Swap
the two lines back for the Figma-exact single band.

## Known Figma-source issues

Reproduced faithfully, **not** silently corrected:

- `Icon / Action / Clear` (557:4) — ink spans 3→17, centred at (10, 10) in the
  24-unit box instead of (12, 12), and is 14 units wide where the visually
  identical `Close` (894:123) is 12 units centred at (12, 12). Clear reads
  larger and sits up-left of every other master.
- `Icon / Action / Visibility Closed` (440:15) — ink centre y = 13.65. Likely
  intentional (a closed lid sits low), flagged for confirmation.

- **Large artwork: docs say 36px, components use 24px.** The Iconography note
  (85:9) states artwork 18/18/24/36, but the built Large components measure a
  24px glyph and no `artwork-large` variable exists. Built components win.
- **`Icon / Action / Add` Size=Small (379:2) is documented wrong.** Its
  description claims an "independently drawn 18px optical master; 1.5px
  rounded stroke". The built asset is an exact 0.75x geometric scale of the
  24px master — `M12 5V19M5 12H19` @1.8 becomes `M9 3.75V14.25M3.75 9H14.25`
  @1.35 — matching `Icon Frame`'s own rule that "no per-size source or stroke
  tokens exist". The code follows the built asset.
- `--ol8-component-icon-stroke` reports `1.7999999523162842` — a float32 artifact
  of 1.8. Normalized to `1.8` in `tokens.json`, matching the documented universal
  optical stroke.

`npm run sync:icons` re-runs the optical-centre audit on every sync.
