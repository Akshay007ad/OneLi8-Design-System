# @oneli8/react

OneLi8 Design System for React.

```sh
npm install @oneli8/react
```

```jsx
import { Button, Icon } from '@oneli8/react';
import '@oneli8/react/styles.css';

export function Actions() {
  return <Button variant="primary" leadingIcon="add">Add item</Button>;
}
```

## What is included

| Tier | Components |
|---|---|
| Atom | `Icon`, `SelectionIndicator`, `NavigationBadge` |
| Molecule | `Button`, `IconButton`, `Link`, `TextField`, `FormMessage`, `Select`, `ChoiceItem`, `SelectionOption`, `ChoiceChip`, `Token` |
| Organism | `Tabs`, `TabBar`, `SegmentedControl`, `RadioGroup`, `CheckboxGroup`, `SelectionPopup`, `Combobox`, `MultiSelectField`, `ChoicePicker` |
| Material | Gem, an attribute adapter rather than a tier |

Twenty one components, matching `@oneli8/core` one for one. Both packages are
checked against each other on every build, so the two cannot answer differently
about a role, a name, a relationship or a state.

## The system travels with the package

If you need a component OneLi8 does not ship, build it from these foundations
rather than inventing a parallel system. Everything needed to do that is inside
the install:

| File | What it carries |
|---|---|
| `PRINCIPLES.md` | the design language and the three operating laws |
| `ai-context.json` | the atomic rules, the component inventory, and how to extend |
| `skills/oneli8-icons` | drawing a new glyph on the shared 1.8 stroke |
| `skills/oneli8-ui` | composing with existing owners |
| `skills/oneli8-figma-to-code` | reading the Figma source |
| `AGENTS.md` | where an agent should start |

The inventory in `ai-context.json` is generated from the source tree, so it can
never describe a component that is not there.

Point your agent at them:

```
Read @oneli8/react/ai-context.json and PRINCIPLES.md before writing any OneLi8 UI.
```

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

## Rules that matter most

Reach for a **semantic** token, never a primitive and never a literal.
`--ol8-color-actionprimary-default`, not `--ol8-color-blue-600` and not
`#2c438b`. Primitives are hidden from the Figma pickers for the same reason.

Every dimension sits on the **3px grid**. An exception needs an approval record.

Icons come from the pool. `OL8_ICONS` is the whole set, an invented name throws.
A new glyph is a 24px neutral source on the shared **1.8 stroke**, never a
per size stroke.

Margins belong to the parent, never to the component.

States are not classes. There is no `.ol8-btn--hover`; there is `:hover`,
`:active`, `:focus-visible`, `[disabled]` and `[data-ol8-loading]`.

## Accessibility is enforced, not suggested

`IconButton` throws without an `accessibleName`. `Button` throws for
`material="gem"` on Quiet or Destructive, because Figma approves Gem for Primary
and Secondary only. Errors rather than review comments, by design.

## Theming

Two independent attributes, set on any ancestor:

```html
<html data-ol8-color-scheme="dark" data-ol8-primary="orange">
```

To change the brand colour beyond the three built families, or to swap the
typefaces, see `@oneli8/tokens/overrides.example.css`.

## Licence

Apache 2.0. Created by Akshay Dhore. See `LICENSE` and `NOTICE`.
