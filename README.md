# Oneli8 Design System

OneLi8 means One Light.

It is a design system created by Akshay Dhore, intended for broad human benefit
and conceived as service to Guruji Shrii Arnav, whose teachings inspire it. The
implementation specifications are OneLi8's own work. Service, clarity, harmony,
proportion, restraint and evolution guide its decisions. `PRINCIPLES.md` sets
those out in full.

The practical intention is narrower and easier to check. Most design systems
hand you components and hope you stay inside them. This one hands you the
reasoning as well, so that when you need something it does not ship, you can
build it and it still belongs. The rules travel inside the package, not in a
wiki someone forgets to read.

## Install

Pick by what you are building. All three carry the same design decisions.

```bash
npm install @oneli8/react
```

React and Next.js.

```bash
npm install @oneli8/core
```

Anywhere HTML is produced as a string. Rails, Django, Laravel, Astro, Eleventy,
a CMS theme, or hand written markup.

```bash
npm install @oneli8/tokens
```

Decisions only, no markup. This is also the Tailwind package: a v3 preset at
`@oneli8/tokens/tailwind` and a v4 bridge at `@oneli8/tokens/tailwind.css`.

```jsx
import { Button } from '@oneli8/react';
import '@oneli8/react/styles.css';

<Button variant="primary" leadingIcon="add">Add item</Button>
```

The vanilla equivalent renders a string and then wires up what markup cannot
express on its own.

```js
import { renderButton, hydrateButtons } from '@oneli8/core';
import '@oneli8/core/styles.css';

element.innerHTML = renderButton('Save', { variant: 'primary', leadingIcon: 'add' });
hydrateButtons();
```

Both produce byte identical DOM and read the same stylesheets.

## Naming, and why it reads the way it does

The naming is structural, and the structure is borrowed from Sanskrit grammar
rather than from a CSS convention. Two rules follow from it, and together they
explain every token name in the system.

**A compound that names one thing is written as one word.** Sanskrit joins words
into a compound when they name a single idea, and so does this:

```
--ol8-color-actionprimary-default
--ol8-material-gem-color-cutedge-high
--ol8-focus-ring-innerwidth
```

`actionprimary` is not action plus primary. It is one role. `cutedge` is one
feature of the Gem material. Splitting them into `action-primary` would suggest
two things where there is one.

**A qualifier stays separate from what it qualifies.**

```
--ol8-material-control-gem--primary-hover-start
```

Here `hover` is a state applied to `start`. Two grammatical roles, so they stay
apart. That is why `disabledcontent` is joined while `hover-start` is not, which
looks inconsistent until you read it as grammar instead of formatting.

The hyphens that remain separate levels of the hierarchy, never words inside a
level. Words themselves stay readable: no abbreviations, no truncation, no `btn`
where `button` will do.

Figma is the authority on the result. Every variable there carries an explicit
name for code, and `packages/tokens/src/figma-code-syntax.txt` records all 544
of them verbatim. Nothing is derived from a rule, because a rule would have to
guess, and guessing is how the two drifted apart before.

## What is included

| Tier | Components |
|---|---|
| Atom | Icon, Selection Indicator (checkbox, radio, switch), Navigation Badge |
| Molecule | Button, Icon Button, Link, Text Field, Form Message, Select, Choice Item, Selection Option, Choice Chip, Token |
| Organism | Tabs, Tab Bar, Segmented Control, Choice Group, Selection Popup, Combobox, Multi-select Field, Choice Picker |
| Material | Gem, an attribute adapter rather than a tier |

Twenty one components. Every one of them comes from a component set in the Figma
file, and every component set in that file is now implemented. Nothing else is
exported. Tokens exist for families that are not implemented yet, so a token is
never a promise that a component ships.

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

One 24 unit master serves every size. The Icon Frame Display Proof (418:52) shows
a single `Add` rendered at all eleven: 9, 12, 18, 24, 30, 36, 48, 60, 72, 96 and
108. The code matches it exactly, mapping each onto the named scale from
`size-icon-micro` through `size-icon-landmark`.

There are no per size masters and no per size stroke. The 1.8 stroke is shared,
so a glyph drawn at 24 is correct at 9 and at 108 without being redrawn. That is
the rule when adding an icon: draw one neutral 24 unit source, and nothing else.

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

### Text Field

Four sizes, two appearances, and Gem available on both. The counter counts
grapheme clusters rather than code units, so a family emoji is one character and
not eleven. There is no native `maxlength`, because that counts code units and
would cut a cluster in half.

`validationStatus` is Idle, Pending or Resolved, and Pending is a status rather
than a fifth message tone. A read only field cannot be invalid: nobody can act
on the message, so the combination throws instead of rendering.

### Choice Chip and Token

The Soft Hexagon. Two fixed twelve unit terminals with a centre rail that grows
with the label, so a short chip and a long one keep the same shoulder depth and
side angle. Ends that scale with the text are prohibited, and the softness at
the shoulders is drawn rather than approximated with extra vertices, which would
read as an octagon.

A Choice Chip is a real checkbox wearing that appearance, so selection is
carried by native checked state and a stronger edge rather than by colour alone.
A Token is a committed value: ordinary content whose only interactive part is an
optional Remove button. Token delegates every bit of geometry to the chip, the
way the Figma component instantiates the chip as its geometry owner.

The mark follows the label. Check and Remove share that one position, so peer
tokens never put a tick on one side and a cross on the other.

### Multi-select Field

One component for both the Outline and Filled Figma sets, because the two differ
only by which field owner they instantiate. Committed values and the editable
input share one wrapping run, and the field grows as they wrap rather than
compressing tokens to preserve one nominal row.

Tab enters the composite at the input. Tokens are not tab stops, so a field
holding twenty values does not put twenty stops in the page: the arrow keys walk
them instead. Removal takes two presses, because one stray Backspace should not
silently drop a value. Escape cancels the preview and never clears the field.

A constrained field cannot hold a value that is not an option, and a value given
as a bare string shows that option's label rather than its value.

### Choice Picker

Search over a wrapping matrix of choices, where every option is a real checkbox
wearing the chip appearance. It is an accessible group rather than a dialog
pretending to be a listbox, because the surface holds search, many independent
choices and actions at once.

Apply mode holds a pending selection and says what is pending; Enter commits it
and Escape restores the last committed set without closing or moving focus. A
composing input method is left alone, since Enter there is choosing a candidate
rather than applying a selection. Immediate mode commits each toggle and omits
the apply action entirely, rather than showing one that would be a lie.

### Combobox

A native single line text input does the editing, so caret, selection,
composition, dictation, undo and paste all keep working. Focus never leaves that
input: the active option is a virtual cursor carried by `aria-activedescendant`,
and no popup descendant is a second tab stop.

Current value, active option and keyboard focus are three distinct states.
Escape closes the popup without committing the preview and restores the prior
committed value. Clearing is an explicit named action rather than an unlabelled
cross, and a required value is not clearable, since clearing it would leave
something the form cannot accept.

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
  and the code follows the built asset. The Icon Frame Display Proof (418:52)
  settles it: one master is shown at all eleven sizes, so an independently drawn
  18px master would contradict the system's own demonstration.
* **A Token's two marks are drawn at different spans.** The Check is a governed
  small master that keeps its 10.2 by 6.9 artwork at both 18 and 24, while the
  Remove cross is an Icon Frame instance at 18, so its artwork comes out 9 by 9.
  The two sit in the same slot and read as slightly different sizes. Code
  follows Figma. Equalising them would mean restructuring the chip, because the
  mark lives inside the Choice Chip geometry owner instance and Figma refuses
  size overrides that deep.
* **The Choice Picker's commitment line carries raw type.** Its summary and
  apply text are a literal 12 and 18 rather than bound to `Font / Size / 012`
  and `Font / Line / 018`, which every other text in the file uses. The values
  are right, so code reads the tokens and the rendering matches.
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
