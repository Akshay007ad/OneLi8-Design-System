/**
 * Text Field (MOLECULE). Figma 182:33 Outline, 186:53 Filled, 211:36 and
 * 215:226 Gem.
 *
 * Figma's five Conditions are review evidence, never options. Default, Hover,
 * Invalid, Read-only and Disabled are :hover, aria-invalid, readOnly and
 * disabled on the native input. Gem changes token bound material only.
 */
export type Ol8TextFieldSize = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8TextFieldAppearance = 'outline' | 'filled';
export type Ol8TextFieldMaterial = 'regular' | 'gem';
/** Pending is a validation process status, not a fifth message tone. */
export type Ol8MessageTone = 'critical' | 'caution' | 'positive' | 'informative';
export type Ol8ValidationStatus = 'idle' | 'pending' | 'resolved';
export type Ol8CharacterLimitBehavior = 'soft' | 'hard';

export declare const OL8_TEXT_FIELD_SIZES: readonly Ol8TextFieldSize[];
export declare const OL8_TEXT_FIELD_APPEARANCES: readonly Ol8TextFieldAppearance[];
export declare const OL8_TEXT_FIELD_MATERIALS: readonly Ol8TextFieldMaterial[];
export declare const OL8_MESSAGE_TONES: readonly Ol8MessageTone[];
export declare const OL8_VALIDATION_STATUSES: readonly Ol8ValidationStatus[];
export declare const OL8_CHARACTER_LIMIT_BEHAVIORS: readonly Ol8CharacterLimitBehavior[];

export interface Ol8TextFieldOptions {
  /** Required. A field nobody can name is a field nobody can fill. */
  label: string;
  name?: string;
  id?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  size?: Ol8TextFieldSize;
  appearance?: Ol8TextFieldAppearance;
  material?: Ol8TextFieldMaterial;
  /** False keeps the label as the accessible name without showing it, which needs a documented exception. */
  showLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Correction is required. Never set without also exposing a Critical message. */
  invalid?: boolean;
  leadingIcon?: string;
  prefix?: string;
  suffix?: string;
  trailingAction?: { icon: string; label: string };
  instruction?: string;
  message?: string;
  messageTone?: Ol8MessageTone;
  messageIcon?: boolean;
  /** Pending shows the loader; it never freezes typing. */
  validationStatus?: Ol8ValidationStatus;
  /** Counted in graphemes, so an emoji counts as one. */
  characterLimit?: number;
  /** Soft lets a person overshoot and then correct. Hard is for real technical limits. */
  characterLimitBehavior?: Ol8CharacterLimitBehavior;
  className?: string;
}

/** @throws without a label, on an unknown size, appearance, material, tone or status, or when a read only field is marked invalid. */
export declare function renderTextField(options: Ol8TextFieldOptions): string;

/** Enforces the runtime contract on existing `.ol8-field` markup. Returns the count of fields with no native input. */
export declare function hydrateTextFields(root?: ParentNode): number;

/** Counts what a reader would call characters. */
export declare function countGraphemes(value: unknown): number;

/** Keeps the first `limit` graphemes, so a cluster is never cut in half. */
export declare function clipToGraphemes(value: unknown, limit: number): string;
