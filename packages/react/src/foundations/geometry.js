/**
 * Framework free rules shared by every component. These are the parts of the
 * system that are decisions rather than markup: which sizes exist, which
 * combinations Figma approves, and which icon size a control carries.
 */
import { OL8_ICONS } from './icons.generated.js';

/** Guard against an invented glyph name reaching a component. */
export const isOl8IconName = (name) => Object.hasOwn(OL8_ICONS, name);

export const OL8_BUTTON_VARIANTS = ['primary', 'secondary', 'quiet', 'destructive'];
export const OL8_BUTTON_SIZES = ['compact', 'standard', 'comfortable', 'large'];
export const OL8_MATERIALS = ['regular', 'gem'];
/** Gem is approved for Primary and Secondary only (Figma 100:3). */
export const GEM_VARIANTS = ['primary', 'secondary'];

export const OL8_ICON_BUTTON_VARIANTS = OL8_BUTTON_VARIANTS;
export const OL8_ICON_BUTTON_SIZES = OL8_BUTTON_SIZES;
export const OL8_ICON_BUTTON_SHAPES = ['rounded', 'circle'];

export const OL8_SELECTION_KINDS = ['checkbox', 'radio', 'switch'];
export const OL8_SELECTION_SIZES = ['compact', 'comfortable'];
export const OL8_SELECTION_STATES = {
  checkbox: ['unchecked', 'checked', 'mixed'],
  radio: ['unselected', 'selected'],
  switch: ['off', 'on'],
};

export const OL8_CHOICE_KINDS = OL8_SELECTION_KINDS;
export const OL8_CHOICE_SIZES = OL8_BUTTON_SIZES;
export const OL8_LINK_FORMS = ['inline', 'standalone', 'navigation'];
export const OL8_LINK_SIZES = ['small', 'standard', 'large'];
export const OL8_LINK_MOTIONS = ['system', 'none'];

export const OL8_TEXT_FIELD_SIZES = OL8_BUTTON_SIZES;
export const OL8_TEXT_FIELD_APPEARANCES = ['outline', 'filled'];
export const OL8_TEXT_FIELD_MATERIALS = OL8_MATERIALS;
/** The four tones a message can carry. Pending is not one of them. */
export const OL8_MESSAGE_TONES = ['critical', 'caution', 'positive', 'informative'];
/** "Pending is a validation process status, not a fifth message tone." */
export const OL8_VALIDATION_STATUSES = ['idle', 'pending', 'resolved'];
/** Soft lets a person overshoot and then correct. Hard is for real technical limits. */
export const OL8_CHARACTER_LIMIT_BEHAVIORS = ['soft', 'hard'];

/** Form Message itself draws all five, because Figma 177:13 enumerates five. */
export const OL8_FORM_MESSAGE_TONES = [...OL8_MESSAGE_TONES, 'pending'];
/** Figma pairs one status icon with each tone (Form Message 177:13). */
export const OL8_FORM_MESSAGE_ICONS = {
  critical: 'critical',
  caution: 'caution',
  positive: 'positive',
  informative: 'informative',
  pending: 'loading',
};

export const OL8_NAVIGATION_SIZES = OL8_BUTTON_SIZES;
export const OL8_TABS_HIERARCHIES = ['primary', 'secondary', 'tertiary'];
export const OL8_TABS_ORIENTATIONS = ['horizontal', 'vertical'];
export const OL8_TABS_ACTIVATIONS = ['automatic', 'manual'];
/** "Declare exactly one behavior." */
export const OL8_SEGMENT_BEHAVIORS = ['single', 'multi', 'momentary'];
/** "Presentation never changes behavior." */
export const OL8_SEGMENT_PRESENTATIONS = [
  'inset-fill', 'line-indicator', 'outlined-selection', 'soft-pill', 'icon-only', 'stacked-label',
];
export const OL8_TAB_BAR_PRESENTATIONS = ['bottom', 'inline', 'sidebar', 'spatial-rail'];

export const OL8_CHIP_SIZES = OL8_BUTTON_SIZES;
export const OL8_TOKEN_SIZES = OL8_CHIP_SIZES;
/** Figma draws the last three; `auto` resolves to one of them in code. */
export const OL8_TOKEN_MARKS = ['auto', 'none', 'check', 'remove'];

/** The contract's resolution, stated once so both packages agree. */
export function resolveTokenMark(mark, { removable = true, selected = false } = {}) {
  if (mark !== 'auto') return mark;
  if (removable) return 'remove';
  return selected ? 'check' : 'none';
}

export const OL8_OPTION_SIZES = ['standard', 'large'];
export const OL8_POPUP_WIDTHS = ['content', 'anchor', 'wide'];
export const OL8_POPUP_SIZES = OL8_OPTION_SIZES;
export const OL8_MULTI_SELECT_SIZES = OL8_BUTTON_SIZES;
export const OL8_MULTI_SELECT_APPEARANCES = ['outline', 'filled'];
export const OL8_MULTI_SELECT_MATERIALS = OL8_MATERIALS;
/** Constrained resolves from a known set; suggestive may also author values. */
export const OL8_VALUE_POLICIES = ['constrained', 'suggestive'];

export const OL8_COMBOBOX_SIZES = OL8_BUTTON_SIZES;
export const OL8_COMBOBOX_APPEARANCES = ['outline', 'filled'];
export const OL8_COMBOBOX_MATERIALS = OL8_MATERIALS;
export const OL8_AUTOCOMPLETE_MODES = ['none', 'list-manual', 'list-automatic'];
export const OL8_FILTER_SOURCES = ['local', 'remote', 'external'];

export const OL8_PICKER_SIZES = OL8_BUTTON_SIZES;
export const OL8_PICKER_MATERIALS = OL8_MATERIALS;
export const OL8_COMMIT_BEHAVIORS = ['immediate', 'apply'];
export const OL8_PICKER_PRESENTATIONS = ['inline', 'popup'];
/** One treatment across an instance; peers never mix Check and None. */
export const OL8_PICKER_MARKS = ['check', 'none'];

export const OL8_POPUP_STATUSES = ['none', 'loading', 'empty', 'error'];
export const OL8_AGGREGATE = ['none', 'some', 'all'];

/** Compact and Standard take the 18px icon; Comfortable and Large take 24px. */
export const iconSizeForButton = (size) =>
  size === 'comfortable' || size === 'large' ? 24 : 18;

/** Artwork sizes as BUILT in Figma: 18 / 18 / 24 / 24. */
export const artworkSizeForIconButton = iconSizeForButton;

/** The molecule's four sizes map onto the atom's two. */
export const indicatorSizeFor = (size) =>
  size === 'comfortable' || size === 'large' ? 'comfortable' : 'compact';

/** Figma's Selection axis, derived from native input state. */
export function selectionStateFor(kind, { checked = false, mixed = false } = {}) {
  if (kind === 'checkbox') return mixed ? 'mixed' : checked ? 'checked' : 'unchecked';
  if (kind === 'radio') return checked ? 'selected' : 'unselected';
  return checked ? 'on' : 'off';
}

/** Disabled children are excluded from the tally. */
export function computeAggregate(children) {
  const boxes = [...children].filter((c) => !c.disabled);
  if (boxes.length === 0) return 'none';
  const checked = boxes.filter((c) => c.checked).length;
  if (checked === 0) return 'none';
  return checked === boxes.length ? 'all' : 'some';
}

export function assertVariant(variant, size, material) {
  if (!OL8_BUTTON_VARIANTS.includes(variant)) throw new Error(`[ol8] unknown button variant "${variant}"`);
  if (!OL8_BUTTON_SIZES.includes(size)) throw new Error(`[ol8] unknown button size "${size}"`);
  if (!OL8_MATERIALS.includes(material)) throw new Error(`[ol8] unknown material "${material}"`);
  if (material === 'gem' && !GEM_VARIANTS.includes(variant)) {
    throw new Error(`[ol8] Gem has no approved treatment for "${variant}" — Figma 100:3 says Quiet and Destructive use the regular material.`);
  }
}

let seq = 0;
/** Stable within a render pass; React 18+ callers should pass their own useId. */
export const autoId = (prefix) => `${prefix}-${(seq++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;
