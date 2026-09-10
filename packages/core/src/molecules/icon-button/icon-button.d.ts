/**
 * Icon Button (MOLECULE) — headless behavior. An accessible name is mandatory
 * and enforced here rather than left to reviewers.
 */
import type { Ol8IconName } from '../../atoms/icon/icons.generated.js';

export type Ol8IconButtonVariant = 'primary' | 'secondary' | 'quiet' | 'destructive';
export type Ol8IconButtonSize = 'compact' | 'standard' | 'comfortable' | 'large';
export type Ol8IconButtonShape = 'rounded' | 'circle';

export declare const OL8_ICON_BUTTON_VARIANTS: readonly Ol8IconButtonVariant[];
export declare const OL8_ICON_BUTTON_SIZES: readonly Ol8IconButtonSize[];
export declare const OL8_ICON_BUTTON_SHAPES: readonly Ol8IconButtonShape[];

/** Artwork sizes as BUILT in Figma: 18 / 18 / 24 / 24. */
export declare function artworkSizeForIconButton(size: Ol8IconButtonSize): 18 | 24;

export interface Ol8IconButtonOptions {
  variant?: Ol8IconButtonVariant;
  size?: Ol8IconButtonSize;
  shape?: Ol8IconButtonShape;
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
  type?: 'button' | 'submit' | 'reset';
  material?: 'regular' | 'gem';
  className?: string;
}

/**
 * @param icon  registry name, e.g. "add"
 * @param label accessible name — REQUIRED, throws if empty
 */
export declare function renderIconButton(
  icon: Ol8IconName,
  label: string,
  options?: Ol8IconButtonOptions,
): string;

export declare function hydrateIconButtons(root?: ParentNode): void;
