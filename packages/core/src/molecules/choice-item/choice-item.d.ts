/**
 * Choice Item (MOLECULE) — headless behavior around a real <input>. It does not
 * reimplement toggling, focus or form participation; the native input does all
 * of it. `indeterminate` is the one thing markup cannot express, which is why
 * the Mixed state needs hydration and the other states do not.
 */
import type { Ol8IconName } from '../../atoms/icon/icons.generated.js';
import type { Ol8Selection, Ol8SelectionSize } from '../../atoms/selection-indicator/selection-indicator.js';

export type Ol8ChoiceKind = 'checkbox' | 'radio' | 'switch';
export type Ol8ChoiceSize = 'compact' | 'standard' | 'comfortable' | 'large';

export declare const OL8_CHOICE_KINDS: readonly Ol8ChoiceKind[];
export declare const OL8_CHOICE_SIZES: readonly Ol8ChoiceSize[];

/** The molecule's four sizes map onto the atom's two. */
export declare function indicatorSizeFor(size: Ol8ChoiceSize): Ol8SelectionSize;

/** Figma's Selection axis, derived from native input state. */
export declare function selectionStateFor(
  kind: Ol8ChoiceKind,
  state?: { checked?: boolean; mixed?: boolean },
): Ol8Selection;

export interface Ol8ChoiceItemOptions {
  size?: Ol8ChoiceSize;
  checked?: boolean;
  /** Checkbox only. Renders Mixed; the real indeterminate flag is set on hydrate. */
  mixed?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Associated with aria-describedby, kept out of the accessible name. */
  description?: string;
  name?: string;
  value?: string;
  required?: boolean;
  id?: string;
  material?: 'regular' | 'gem';
  className?: string;
}

export declare function renderChoiceItem(
  kind: Ol8ChoiceKind,
  label: string,
  options?: Ol8ChoiceItemOptions,
): string;

/** Applies the JS-only indeterminate flag to Mixed rows. Idempotent. */
export declare function hydrateChoiceItems(root?: ParentNode): void;

/** Repaints one row's indicator from its input's current state. */
export declare function syncIndicator(row: Element): void;

export declare function setChoiceMixed(row: Element, mixed: boolean): void;
