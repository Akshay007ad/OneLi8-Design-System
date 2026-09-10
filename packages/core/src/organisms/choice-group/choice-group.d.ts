/**
 * Choice Group (ORGANISM) — headless behavior. Aggregate None/Some/All is
 * computed from nested checkboxes; Mixed is never a third preference. The radio
 * group needs almost nothing: native radios already give roving focus, single
 * selection and form submission.
 */
import type { Ol8ChoiceSize } from '../../molecules/choice-item/choice-item.js';

export type Ol8Aggregate = 'none' | 'some' | 'all';
export declare const OL8_AGGREGATE: readonly Ol8Aggregate[];

/** Disabled children are excluded from the tally. */
export declare function computeAggregate(
  children: Iterable<HTMLInputElement> | ArrayLike<HTMLInputElement>,
): Ol8Aggregate;

interface Ol8ChoiceGroupShell {
  legend: string;
  instruction?: string;
  message?: string;
  invalid?: boolean;
  disabled?: boolean;
  size?: Ol8ChoiceSize;
  material?: 'regular' | 'gem';
  id?: string;
  className?: string;
}

export interface Ol8RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface Ol8RadioGroupConfig extends Ol8ChoiceGroupShell {
  /** Required — it is what makes the radios a group. */
  name: string;
  options: Ol8RadioOption[];
  /** The selected option's value. Omit for no default. */
  value?: string;
  orientation?: 'vertical' | 'horizontal';
  required?: boolean;
}

export interface Ol8CheckboxOption {
  label: string;
  value: string;
  /** Checkboxes are independent, so each carries its own state. */
  checked?: boolean;
  description?: string;
  disabled?: boolean;
}

export interface Ol8CheckboxGroupConfig extends Ol8ChoiceGroupShell {
  /** Required — the hierarchy's parent row. */
  parentLabel: string;
  options: Ol8CheckboxOption[];
  /** Shared input name for the children. Optional: checkboxes need no group name. */
  name?: string;
}

/**
 * Native semantics do the work; this only builds the shell.
 * @throws if legend, name or options are missing.
 */
export declare function renderRadioGroup(config: Ol8RadioGroupConfig): string;

/**
 * Checkbox hierarchy: one parent whose state is computed from its children. The
 * parent renders unchecked; hydration derives its real state.
 * @throws if legend, parentLabel or options are missing.
 */
export declare function renderCheckboxGroup(config: Ol8CheckboxGroupConfig): string;

/**
 * Wires every checkbox hierarchy under `root`. Idempotent.
 * Radio groups need no wiring — the browser already owns their behaviour.
 */
export declare function hydrateChoiceGroups(root?: ParentNode): void;
