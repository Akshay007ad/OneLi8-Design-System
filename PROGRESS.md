# Where this stands

Written 10 September 2026. Everything below is verified by `npm run build`,
which now runs the structure check, 69 token checks, 34 core component checks
and 23 React reference checks.

## Done and committed

**Link, synced to what Figma actually draws.** Five differences, all resolved in
favour of Figma: the focus ring moved outside the box, the inline padding
dropped from twelve to three, navigation stopped hiding its underline, it
stopped stretching to full width, and the current destination became a thicker
underline in the link colour rather than a bar beside the label in the primary
colour. The size `inherit` was removed because Figma binds each of the three
sizes to a concrete font size variable and a variable cannot resolve to context.

**Text Field, Gem Text Field and Form Message.** Both pages, in core and React,
with the gem material extended to the field control. Figma governed what is
drawn; the Text Field contract governed what the API means.

**The navigation family.** One Navigation Badge atom, one shared internal item
molecule, and the three organisms the contract calls the public surface: Tabs,
Segmented Control and Tab Bar, at the paths the status registry already named.

**Select, Selection Popup and Combobox.** Three of the ten sets on the Select
and Combobox page.

## Not built yet

Seven sets remain on the Select and Combobox page:

| Figma set | Intended path |
|---|---|
| Choice Chip / Soft Hexagon 636:847 | `packages/react/src/molecules/ChoiceChip.js` |
| Molecule / Token 897:2106 | `packages/react/src/molecules/Token.js` |
| Organism / Multi-select Field / Outline 904:2507 | not yet named |
| Organism / Multi-select Field / Filled 978:4472 | not yet named |
| Organism / Choice Picker 906:2898 | not yet named |
| Molecule / Select 875:1778 (the expanded composition) | composed, not yet a variant test |
| Organism / Combobox 883:2159 (the expanded composition) | composed, not yet a variant test |

React references for Selection Popup and Combobox are also still to write; the
core versions exist and are tested.

## Decisions worth your eye

**Where Figma and a contract disagree, I followed Figma for what is drawn and
the contract for what the API means, and did not silently pick a winner.** Three
places where they actually differ:

1. *Leading icon size.* The Text Field contract says Comfortable and Large take
   a 24 unit icon. Figma draws 18 at every size. Code follows Figma.
2. *Icon to value gap.* The contract says nine at Comfortable and Large. Figma
   draws six at every size. Code follows Figma.
3. *Instruction to message gap.* The contract says three. Figma uses one root
   gap of six for the whole vertical stack. Code follows Figma.

**Button and Link draw their focus ring outside the box in Figma; the code drew
it inset.** Link is fixed. Button is not, and it is a wider visual change than
one component, so it is yours to call. Figma's Button focus is also a single
three unit outer ring where the code draws two.

**Figma draws the navigation focus edge at 1.8, which is the icon stroke value.**
Code uses the named `Focus / Ring / Inner Width` of three instead. This looks
like a slip in Figma rather than a decision.

**Coarse pointer targets for Compact and Standard fields are not implemented.**
The contract asks an adapter to expand the activation region. An overlay drawn
in CSS would sit over the value and take the caret away, which is worse than the
shortfall it fixes. It belongs to a platform adapter.

## Figma changes I made

All of these name a value that was already there, rather than changing a design.

- `Component / Link / Underline / Current`, aliased to `Border / Width / Strong`,
  bound to all three navigation current markers, which were a raw three.
- `Component / Text Field / Gap / Inline` and `Gap / Requirement`, bound across
  all eighty variants of the four Text Field sets, which were a raw six and three.
- Eighteen navigation component variables, so names that this repository had
  inferred are now names Figma agreed. Tokens with inferred names went from
  fifty three to thirty five.

## Still open from before

- Thirty five tokens still have inferred names, most of them Choice Chip.
- Five Figma variables are defined but not emitted, all superseded `683:*`
  duplicates.
- `data-ol8-type-mode` is inert and has no Figma design behind it.
- The version is still `1.0.0-beta.5`. Nothing is published from this work yet.
