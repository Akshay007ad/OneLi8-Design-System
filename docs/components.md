# Components

[Back to OneLi8](../README.md) · [Themes and Gem](theming.md) · [AI and Figma](ai-and-figma.md)

Use `@oneli8/react` exports. Shared internal owners are deliberately not public
imports. These examples describe the shipped beta, not future components.

## Button — perform an action

```jsx
import {Button, Icon} from '@oneli8/react';

<Button leadingIcon={<Icon name="add" />} onClick={addItem}>Add item</Button>
<Button variant="secondary" size="compact">Cancel</Button>
<Button material="gem" loading={saving}>Save changes</Button>
```

| Property | Values | Default |
| --- | --- | --- |
| `variant` | `primary`, `secondary`, `quiet`, `destructive` | `primary` |
| `size` | `compact`, `standard`, `comfortable`, `large` | `comfortable` |
| `material` | `regular`, `gem` | `regular` |
| `loading`, `disabled`, `fullWidth` | boolean | `false` |
| `pressed` | boolean for an actual toggle | unset |
| `leadingIcon`, `trailingIcon` | React node | absent |
| `iconMotion` | `none`, `rotate`, `forward`, `backward` | `none` |
| `type` | native button type | `button` |

Use primary for the main action, secondary for supporting actions, quiet for
low-emphasis actions and destructive for destructive intent. Supply handlers;
the component does not save data or open dialogs on its own. Inside a form, set
`type="submit"` explicitly when needed.

Hover, pressed-pointer and keyboard focus come from real interactions—not fake
`state` props. `pressed` represents toggle semantics, not a mouse-down preview.
Disabled uses the native disabled attribute. Loading exposes `aria-busy` and
`aria-disabled`, blocks clicks and retains focus unless also disabled. Keep a
meaningful label; announce significant application outcomes in your own UI.

## IconButton — an action without visible text

```jsx
import {IconButton, Icon} from '@oneli8/react';

<IconButton accessibleName="Search" icon={<Icon name="search" />} />
<IconButton accessibleName="Add item" shape="circle" material="gem"
  icon={<Icon name="add" />} />
```

`accessibleName` is required. `icon` is required unless loading. Shares Button's
variant/size/material/loading/disabled/pressed behavior; variant defaults to
`quiet`. `shape` is `rounded` (default) or `circle`; `motion` is `system` or `none`.
Do not rely on a tooltip as the only accessible name. Prefer a labeled Button
when an icon's meaning would be unclear.

## Link — navigate to a destination

```jsx
import {Link} from '@oneli8/react';

<Link href="/help">Read the guide</Link>
<Link href="/settings" form="navigation" current="page">Settings</Link>
```

`href` is required. `form`: `inline` (default), `standalone`, `navigation`.
`size`: `small`, `standard` (default), `large`, `inherit`.
`current` supplies native `aria-current`; `motion` is `system` or `none`.
Use descriptive link text and trusted destinations. Visited appearance is managed
by browser history. Link does not have a Gem or disabled prop. A navigation-form
Link is not the unreleased NavigationList component.

## Icon — reuse the pool

```jsx
import {Icon, iconNames} from '@oneli8/react';
// iconNames is the authoritative list; do not invent names.
<Icon name="forward" />
```

17 identities: add, forward, critical, visibility-open, visibility-closed,
loading, caution, positive, informative, chevron-down, chevron-up, search, clear,
close, selection-check, selection-mixed, selection-dot.

Each identity has one 24×24 source, inherits currentColor and is decorative
(`aria-hidden`). Buttons own the shared icon presentation size. The public Icon
API exposes `name` and `className`, not a size prop. A standalone meaningful icon
needs an accessible parent/text equivalent. Unknown names currently render nothing.

## Before shipping your product

Test keyboard access, long labels, actual backgrounds, zoom, theme, reduced motion,
forced colors and assistive technology. OneLi8 provides native semantics and
state styling; your page structure, content and behavior still need testing.
