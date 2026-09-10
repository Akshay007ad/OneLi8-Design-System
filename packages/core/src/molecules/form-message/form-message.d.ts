/**
 * Form Message (MOLECULE). Figma 177:13. Tone maps to semantic message tone;
 * Pending is the validating state rather than a fifth error tone.
 */
export type Ol8FormMessageTone = 'critical' | 'caution' | 'positive' | 'informative' | 'pending';

export declare const OL8_FORM_MESSAGE_TONES: readonly Ol8FormMessageTone[];
export declare const OL8_FORM_MESSAGE_ICONS: Readonly<Record<Ol8FormMessageTone, string>>;

export interface Ol8FormMessageOptions {
  tone?: Ol8FormMessageTone;
  /** Figma's Show Icon. */
  icon?: boolean;
  /** Give it an id so a field can point aria-describedby at it. */
  id?: string;
  className?: string;
}

/** @throws on an unknown tone. */
export declare function renderFormMessage(message: string, options?: Ol8FormMessageOptions): string;

/** Enforces role and live region on existing `.ol8-form-message` markup. */
export declare function hydrateFormMessages(root?: ParentNode): void;
