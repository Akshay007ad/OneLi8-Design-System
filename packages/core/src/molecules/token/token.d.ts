/**
 * Token (MOLECULE) — a committed value. It delegates every bit of geometry to
 * the Choice Chip owner, exactly as the Figma component does, and adds only the
 * Mark axis. A token is content with an optional Remove button, not a control.
 */
import type { Ol8ChipSize } from '../choice-chip/choice-chip.js';

export type Ol8TokenSize = Ol8ChipSize;
/** Figma draws the last three; `auto` resolves to one of them. */
export type Ol8TokenMark = 'auto' | 'none' | 'check' | 'remove';

export declare const OL8_TOKEN_SIZES: readonly Ol8TokenSize[];
export declare const OL8_TOKEN_MARKS: readonly Ol8TokenMark[];

/** Remove for a removable value, Check for a selected one, None otherwise. */
export declare function resolveTokenMark(
  mark: Ol8TokenMark,
  state?: { removable?: boolean; selected?: boolean },
): Exclude<Ol8TokenMark, 'auto'>;

export interface Ol8TokenOptions {
  size?: Ol8TokenSize;
  selected?: boolean;
  mark?: Ol8TokenMark;
  /** A non removable token may not carry a Remove mark. */
  removable?: boolean;
  /** Overrides the default "Remove {label}" accessible name. */
  removeLabel?: string;
  id?: string;
  className?: string;
}

export declare function renderToken(label: string, options?: Ol8TokenOptions): string;
