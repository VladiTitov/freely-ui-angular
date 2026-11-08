import { Type } from '@angular/core';

/** A rendered example and the code that renders it. */
export interface DocExample {
  title: string;
  description?: string;
  component: Type<unknown>;
  /** The template of `component`, shown under it; the same constant the component uses, so they never drift. */
  code: string;
}

/** One row of an API table: an input, an output or a CSS custom property. */
export interface DocProperty {
  name: string;
  type?: string;
  default?: string;
  description: string;
}

export type DocGroup =
  | 'Actions'
  | 'Forms'
  | 'Data'
  | 'Lists'
  | 'Feedback'
  | 'Overlays'
  | 'Layout'
  | 'Media'
  | 'Charts'
  | 'People'
  | 'Directives'
  | 'Pipes';

/** Order of the groups in the menu; a group with no pages yet is not shown. */
export const DOC_GROUPS: readonly DocGroup[] = [
  'Actions',
  'Forms',
  'Data',
  'Lists',
  'Feedback',
  'Overlays',
  'Layout',
  'Media',
  'Charts',
  'People',
  'Directives',
  'Pipes',
];

/** The page of one component. */
export interface ComponentDoc {
  slug: string;
  title: string;
  group: DocGroup;
  /** One sentence for the list and the page description. */
  summary: string;
  /** What to import and from where. */
  imports: string;
  /** Selectors the page is about, e.g. `button[fyButton]`. */
  selectors: string[];
  examples: DocExample[];
  inputs?: DocProperty[];
  outputs?: DocProperty[];
  cssVars?: DocProperty[];
  /** Keyboard and screen reader behaviour. */
  accessibility?: string[];
}
