/**
 * Link (MOLECULE) — headless behavior. Figma's five States are visual evidence
 * for review, never classes: :hover, :active, :focus-visible, :visited and
 * [aria-current] carry them. Icons are intentionally parked.
 */
export type Ol8LinkForm = 'inline' | 'standalone' | 'navigation';
/** Figma defines three. `inherit` is a code addition for links inside body copy. */
export type Ol8LinkSize = 'small' | 'standard' | 'large' | 'inherit';
export type Ol8LinkMotion = 'system' | 'none';

export declare const OL8_LINK_FORMS: readonly Ol8LinkForm[];
export declare const OL8_LINK_SIZES: readonly Ol8LinkSize[];
export declare const OL8_LINK_MOTIONS: readonly Ol8LinkMotion[];

export interface Ol8LinkOptions {
  form?: Ol8LinkForm;
  size?: Ol8LinkSize;
  /** Navigation only. `true` emits aria-current="page"; a string names the kind. */
  current?: boolean | string;
  motion?: Ol8LinkMotion;
  className?: string;
}

/** @throws without an href, on an unknown form or size, or for current outside navigation. */
export declare function renderLink(label: string, href: string, options?: Ol8LinkOptions): string;

/** Enforces the runtime contract on existing `.ol8-link` markup. Returns the count of elements that are not anchors with an href. */
export declare function hydrateLinks(root?: ParentNode): number;
