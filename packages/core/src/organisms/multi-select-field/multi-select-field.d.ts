/**
 * Multi-select Field (ORGANISM) — several committed values in one field.
 * Built from the canonical Text Field, Token and Selection Popup owners, as the
 * Figma organism is. Outline and Filled are one component with an appearance
 * axis, because the two Figma sets differ only by which field owner they use.
 */
import type { Ol8TokenSize } from '../../molecules/token/token.js';

export type Ol8MultiSelectSize = Ol8TokenSize;
export type Ol8MultiSelectAppearance = 'outline' | 'filled';
export type Ol8MultiSelectMaterial = 'regular' | 'gem';
/** Constrained resolves from a known set; suggestive may also author values. */
export type Ol8ValuePolicy = 'constrained' | 'suggestive';

export declare const OL8_MULTI_SELECT_SIZES: readonly Ol8MultiSelectSize[];
export declare const OL8_MULTI_SELECT_APPEARANCES: readonly Ol8MultiSelectAppearance[];
export declare const OL8_MULTI_SELECT_MATERIALS: readonly Ol8MultiSelectMaterial[];
export declare const OL8_VALUE_POLICIES: readonly Ol8ValuePolicy[];

export interface Ol8MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface Ol8MultiSelectFieldOptions {
  label: string;
  id?: string;
  name?: string;
  values?: Array<string | { value: string; label: string }>;
  options?: Ol8MultiSelectOption[];
  valuePolicy?: Ol8ValuePolicy;
  size?: Ol8MultiSelectSize;
  appearance?: Ol8MultiSelectAppearance;
  material?: Ol8MultiSelectMaterial;
  /** Figma's Expanded axis: whether the option collection is showing. */
  expanded?: boolean;
  inputValue?: string;
  placeholder?: string;
  maximumValues?: number;
  allowDuplicates?: boolean;
  showLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  /** Only when tokens and input become noninteractive labelled content. */
  readOnly?: boolean;
  invalid?: boolean;
  instruction?: string;
  message?: string;
  messageTone?: 'critical' | 'caution' | 'positive' | 'informative';
  status?: 'none' | 'loading' | 'empty' | 'error';
  statusText?: string;
  className?: string;
}

export declare function renderMultiSelectField(options: Ol8MultiSelectFieldOptions): string;

/**
 * Binds the keyboard model: Tab enters at the input, arrows walk the committed
 * values, and removal takes two presses. Removal dispatches a cancelable
 * `ol8:removevalue` rather than mutating the DOM.
 */
export declare function hydrateMultiSelectFields(root?: ParentNode): number;
