import type { Ol8IconName } from './icons.generated.js';

export type Ol8IconSize = 9 | 12 | 18 | 24 | 30 | 36 | 48 | 60 | 72 | 96 | 108;
export declare const OL8_ICON_SIZES: readonly Ol8IconSize[];

export interface Ol8IconOptions {
  /** One of the Icon Frame universal sizes. Defaults to the 24px source size. */
  size?: Ol8IconSize;
  /** Accessible name. Omit for decorative icons (the default). */
  label?: string;
  /** Extra classes on the outer box. */
  className?: string;
}

export declare function isOl8IconName(name: string): name is Ol8IconName;
export declare function renderIconSvg(name: Ol8IconName): string;
export declare function renderIcon(name: Ol8IconName, options?: Ol8IconOptions): string;
export declare function hydrateIcons(root?: ParentNode): void;
export { OL8_ICONS, type Ol8IconName } from './icons.generated.js';
