/**
 * Choice Chip (MOLECULE) — the Soft Hexagon. A real checkbox wearing the
 * approved quiet chip appearance, so selection is carried by native checked
 * state and a stronger edge, never by colour alone.
 */
export type Ol8ChipSize = 'compact' | 'standard' | 'comfortable' | 'large';

export declare const OL8_CHIP_SIZES: readonly Ol8ChipSize[];

export interface Ol8ChoiceChipOptions {
  size?: Ol8ChipSize;
  /** Figma's Selection axis. Maps to the input's checked state. */
  selected?: boolean;
  /** Figma's Show Mark boolean: the optional Check inside a selected chip. */
  showMark?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
}

export declare function renderChoiceChip(label: string, options?: Ol8ChoiceChipOptions): string;

/** Mirrors each chip's input state onto the attribute the stylesheet reads. */
export declare function hydrateChoiceChips(root?: ParentNode): number;
export declare function syncChip(chip: Element): void;
