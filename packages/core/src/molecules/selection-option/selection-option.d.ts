/**
 * Selection Option (MOLECULE) — headless. The option is NEVER focusable: a
 * listbox moves a virtual cursor with aria-activedescendant while real focus
 * stays on the controlling combobox input.
 */
import type { Ol8IconName } from '../../atoms/icon/icons.generated.js';

export type Ol8OptionSize = 'standard' | 'large';
export declare const OL8_OPTION_SIZES: readonly Ol8OptionSize[];

export interface Ol8SelectionOptionOptions {
  value?: string;
  size?: Ol8OptionSize;
  selected?: boolean;
  /** The listbox's virtual cursor, not DOM focus. */
  active?: boolean;
  /** Options cannot be natively disabled, so this emits aria-disabled. */
  disabled?: boolean;
  /** Associated with aria-describedby, kept out of the accessible name. */
  description?: string;
  leadingIcon?: Ol8IconName;
  id?: string;
  focusRing?: boolean;
  className?: string;
}

export declare function renderSelectionOption(
  label: string,
  options?: Ol8SelectionOptionOptions,
): string;

export declare function setOptionSelected(option: Element, selected: boolean): void;

/**
 * Moves the virtual cursor within a listbox: marks one option active and points
 * the controller's aria-activedescendant at it. Real focus is never moved.
 */
export declare function setActiveOption(
  listbox: Element,
  option: Element,
  controller: Element,
): void;
