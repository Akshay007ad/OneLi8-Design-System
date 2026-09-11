# Where this stands

Written 10 September 2026. Everything below is verified by `npm run build`,
which now runs the structure check, 70 token checks, 47 core component checks
and 31 React reference checks.

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

**Choice Chip and Token.** The Soft Hexagon, built the way Figma builds it: a
fixed twelve unit terminal, a rail that grows with the label, and a mirrored
terminal, so a short chip and a long one keep the same shoulder depth and side
angle. The terminals are real paths rather than a polygon, because the contract
rejects approximating their softness with extra vertices. One viewBox serves all
four heights: read from Figma, every terminal path at thirty, thirty six and
forty two shares identical X values and Y values that are the same fractions of
the height, so stretching Y alone is exact. Token draws no silhouette of its
own; it instantiates the chip's, exactly as the Figma component instantiates the
Geometry Owner.

**Ten stylesheets that were built but never shipped.** Text Field, Form Message,
Select, Combobox, Selection Popup, Navigation Badge, Navigation Item, Tabs, Tab
Bar and Segmented Control all had stylesheets in the tree and no import in
either package's `styles.css`, so a consumer loading them got markup with no
rules to paint it. The aggregate is now generated from the directory rather than
maintained by hand, which is the only version of this that cannot fall behind
again.

**The checkbox check was drawn a quarter too small at compact.** The stylesheet
scaled the glyph with its box, on a stated assumption that the eighteen master
is an exact three quarter scale of the twenty four one. Figma says otherwise:
`Icon / Selection / Check` is a governed two size master where Size=Small and
Size=Standard both carry the same 10.2 by 6.9 artwork at the same 1.8 stroke,
centred in their box. Scaling it also dropped the stroke to 1.35, off the 1.8
system. Both are fixed.

## Not built yet

Five sets remain on the Select and Combobox page:

| Figma set | Intended path |
|---|---|
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

**The chip's default size is Standard.** Figma's variant default is Compact, but
that is which variant sits first in the set rather than a statement about the
API, and this contract names no default at all. Standard is what every other
size bearing component in the repository defaults to, so the house convention
wins until you say otherwise.

**The chip's edge uses a non scaling stroke.** It has to: the terminal stretches
on Y only, so an ordinary stroke would come out thicker along the top and bottom
than up the angled ends. The cost is that a CSS `zoom` or `transform: scale()`
applied to a chip will scale the rail's border and not the terminal's edge.
Browser page zoom is unaffected, because that scales CSS pixels and both follow.

**`component.choiceChip.markGap` and `component.choice.gap.standard` are both
nine and mean the same thing.** Figma binds the rail to the second. The first is
authored, unbound and now unused. One of them should go.

## Figma changes I made

All of these name a value that was already there, rather than changing a design.

- `Component / Link / Underline / Current`, aliased to `Border / Width / Strong`,
  bound to all three navigation current markers, which were a raw three.
- `Component / Text Field / Gap / Inline` and `Gap / Requirement`, bound across
  all eighty variants of the four Text Field sets, which were a raw six and three.
- Eighteen navigation component variables, so names that this repository had
  inferred are now names Figma agreed. Tokens with inferred names went from
  fifty three to thirty five.
- The mark moved from leading to trailing in all eight Choice Chip variants,
  which the twenty four Token variants inherit. Figma had drawn it ahead of the
  label, including the Remove cross, which is an unusual place for a remove
  affordance. You called it, so it moved. The whole slot moved rather than the
  cross alone, because splitting it would leave a Check on one side and a cross
  on the other among peer tokens, and the contract asks for one mark treatment
  across an instance. It now matches the anatomy the contract writes down,
  "Label + optional Remove mark".
- `Component / Choice Chip / Mark Target`, a plain twenty four. The Remove mark
  is drawn at eighteen and the contract asks for a reachable target of at least
  twenty four, so the target is expanded around the drawn mark rather than the
  mark being enlarged. This is the one value here that Figma does not draw; it
  was created so the name would be Figma's rather than mine.

## Still open from before

- Thirty five tokens still have inferred names, most of them Choice Chip. Four
  of those, `innerTerminal`, `centerCut`, `innerCenterCut` and `bezelInset`,
  describe a mask based construction that neither Figma nor the code uses, since
  both draw two vectors per terminal instead. They are unreferenced.
- Five Figma variables are defined but not emitted, all superseded `683:*`
  duplicates.
- `data-ol8-type-mode` is inert and has no Figma design behind it.
- The version is still `1.0.0-beta.5`. Nothing is published from this work yet.
