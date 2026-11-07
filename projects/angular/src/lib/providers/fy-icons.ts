import { InjectionToken, Provider } from '@angular/core';

/**
 * Icons the components draw themselves, as class strings echoed onto an `<i>`.
 * The defaults are Bootstrap Icons classes; the icon font itself is the app's to load.
 */
export interface FyIcons {
  /** Close button of panels and sheets, the clear button of the search field, the cross of a chip. */
  close: string;
  /** Close button of popups and the image viewer. */
  closeLarge: string;
  /** Back button of the nav header. */
  back: string;
  /** Pagination buttons. */
  previous: string;
  next: string;
  /** Leading icon of the search field and the data grid's search button. */
  search: string;
  /** Filter toggle. */
  filters: string;
  /** Sort menu toggle and an unsorted column of the data grid. */
  sort: string;
  /** Column of the data grid sorted ascending / descending. */
  sortAsc: string;
  sortDesc: string;
  /** Sort button of the data grid in a narrow container. */
  sortMenu: string;
  /** Picked option of a menu. */
  check: string;
  /** Mark on a selected tile. */
  selected: string;
  /** Select all button of the data grid. */
  selectAll: string;
  /** Opener of the select field. */
  expand: string;
  add: string;
  edit: string;
  delete: string;
  view: string;
  /** Trend arrows of the badge. */
  trendUp: string;
  trendDown: string;
  /** Error state of the item list. */
  error: string;
  /** Error toast. */
  errorFilled: string;
  /** Avatar stack with nobody in it. */
  people: string;
  /** Button of a revealable password while hidden / shown. */
  reveal: string;
  conceal: string;
}

export const DEFAULT_FY_ICONS: FyIcons = {
  close: 'bi bi-x',
  closeLarge: 'bi bi-x-lg',
  back: 'bi bi-chevron-left',
  previous: 'bi bi-arrow-left',
  next: 'bi bi-arrow-right',
  search: 'bi bi-search',
  filters: 'bi bi-sliders',
  sort: 'bi bi-chevron-expand',
  sortAsc: 'bi bi-arrow-up',
  sortDesc: 'bi bi-arrow-down',
  sortMenu: 'bi bi-arrow-down-up',
  check: 'bi bi-check2',
  selected: 'bi bi-check',
  selectAll: 'bi bi-check2-all',
  expand: 'bi bi-chevron-down',
  add: 'bi bi-plus-lg',
  edit: 'bi bi-pencil',
  delete: 'bi bi-trash3',
  view: 'bi bi-eye',
  trendUp: 'bi bi-arrow-up',
  trendDown: 'bi bi-arrow-down',
  error: 'bi bi-exclamation-circle',
  errorFilled: 'bi bi-exclamation-circle-fill',
  people: 'bi bi-people',
  reveal: 'bi bi-eye',
  conceal: 'bi bi-eye-slash'
};

export const FY_ICONS = new InjectionToken<FyIcons>('FY_ICONS', {
  providedIn: 'root',
  factory: () => DEFAULT_FY_ICONS
});

/**
 * Replaces the built-in icons, e.g. with another icon font; the icons left out stay Bootstrap Icons.
 *
 * ```ts
 * providers: [
 *   provideFyIcons({ close: 'ph ph-x', search: 'ph ph-magnifying-glass' }),
 * ]
 * ```
 */
export function provideFyIcons(icons: Partial<FyIcons>): Provider {
  return { provide: FY_ICONS, useValue: { ...DEFAULT_FY_ICONS, ...icons } };
}
