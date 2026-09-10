/**
 * Button (MOLECULE) — headless behavior. Native semantics, disabled, loading,
 * pressed and fullWidth live here, never as visual-only axes.
 */
import type { Ol8IconName } from '../../atoms/icon/icons.generated.js';

export type Ol8ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type Ol8ButtonSize = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8Material = 'regular' | 'gem';
/** Gem is approved for Primary and Secondary only (Figma 100:3). */
export type Ol8GemVariant = 'primary' | 'secondary';

export declare const OL8_BUTTON_VARIANTS: readonly Ol8ButtonVariant[];
export declare const OL8_BUTTON_SIZES: readonly Ol8ButtonSize[];
export declare const OL8_MATERIALS: readonly Ol8Material[];
export declare const GEM_VARIANTS: readonly Ol8GemVariant[];

/** Compact+Standard take the 18px icon; Comfortable+Large take 24px. */
export declare function iconSizeForButton(size: Ol8ButtonSize): 18 | 24;

export interface Ol8ButtonOptions {
  variant?: Ol8ButtonVariant;
  size?: Ol8ButtonSize;
  leadingIcon?: Ol8IconName;
  trailingIcon?: Ol8IconName;
  disabled?: boolean;
  loading?: boolean;
  /** Emits aria-pressed. Omit entirely for a non-toggle button. */
  pressed?: boolean;
  fullWidth?: boolean;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  /** Ignored when href is set. Defaults to "button", never a stray submit. */
  type?: 'button' | 'submit' | 'reset';
  /** Throws for quiet and destructive: Gem has no approved treatment there. */
  material?: Ol8Material;
  /**
   * By default the spinner takes the leading slot so the button never shows two
   * competing glyphs. Set true for Figma's literal reading (icon AND spinner).
   */
  keepLeadingIconWhileLoading?: boolean;
  className?: string;
}

/** @throws if variant, size or material is unknown, or Gem is asked for on quiet/destructive. */
export declare function renderButton(label: string, options?: Ol8ButtonOptions): string;

/** Enforces the runtime contract on existing `.ol8-btn` markup. Idempotent. */
export declare function hydrateButtons(root?: ParentNode): void;

export declare function setButtonLoading(el: Element, loading: boolean): void;
