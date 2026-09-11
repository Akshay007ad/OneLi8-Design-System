/**
 * Choice Picker (ORGANISM) — search over a wrapping matrix of choices.
 * The inline composition is canonical: an accessible group holding a search
 * field, real checkboxes wearing the Choice Chip appearance, and, in Apply
 * mode, a commitment line. It is deliberately not a dialog pretending to be a
 * listbox, because the surface holds search, many choices and actions.
 */
export type Ol8PickerSize = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8PickerMaterial = 'regular' | 'gem';
export type Ol8CommitBehavior = 'immediate' | 'apply';
export type Ol8PickerPresentation = 'inline' | 'popup';
/** One treatment across an instance; peers never mix Check and None. */
export type Ol8PickerMark = 'check' | 'none';

export declare const OL8_PICKER_SIZES: readonly Ol8PickerSize[];
export declare const OL8_PICKER_MATERIALS: readonly Ol8PickerMaterial[];
export declare const OL8_COMMIT_BEHAVIORS: readonly Ol8CommitBehavior[];
export declare const OL8_PICKER_PRESENTATIONS: readonly Ol8PickerPresentation[];
export declare const OL8_PICKER_MARKS: readonly Ol8PickerMark[];

export interface Ol8PickerOption {
  value: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

export interface Ol8ChoicePickerOptions {
  /** Names the search. Kept associated even when visually hidden. */
  label: string;
  id?: string;
  name?: string;
  options?: Ol8PickerOption[];
  /** Apply holds a pending set; immediate commits each toggle at once. */
  commitBehavior?: Ol8CommitBehavior;
  presentation?: Ol8PickerPresentation;
  mark?: Ol8PickerMark;
  size?: Ol8PickerSize;
  material?: Ol8PickerMaterial;
  inputValue?: string;
  placeholder?: string;
  showLabel?: boolean;
  selectedSummary?: string;
  /** Apply mode only. Immediate mode rejects it rather than drawing a lie. */
  applyHint?: string;
  showClearAll?: boolean;
  clearAllLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  status?: 'none' | 'loading' | 'empty' | 'error';
  statusText?: string;
  className?: string;
}

export declare function renderChoicePicker(options: Ol8ChoicePickerOptions): string;

/**
 * Apply mode only. Enter commits the pending set, Escape restores the last
 * committed one without closing or moving focus, and a composing IME is left
 * alone. Both dispatch events rather than mutating state.
 */
export declare function hydrateChoicePickers(root?: ParentNode): number;
