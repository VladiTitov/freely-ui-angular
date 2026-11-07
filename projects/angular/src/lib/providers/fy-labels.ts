import { computed, InjectionToken, Provider } from '@angular/core';

/** Texts the components carry themselves, mostly accessible names. */
export interface FyLabels {
  /** Close button of popups, panels, sheets and the image viewer. */
  close: string;
  /** Back button of the nav header. */
  back: string;
  /** Accessible name of a loader that was given none. */
  loading: string;
  /** Button of the item list's error state. */
  retry: string;
  /** Clear button of the search field. */
  clear: string;
  /** Cross of a removable chip. */
  remove: string;
  /** Buttons of the data grid. */
  add: string;
  edit: string;
  delete: string;
  view: string;
  /** Caption of a row's buttons in the data grid. */
  actions: string;
  /** Button that shows the data grid's search in a narrow container. */
  search: string;
  /** Sort button of the sort menu, the item list and the data grid. */
  sort: string;
  /** Filter toggle and panel of the search panel. */
  filters: string;
  /** Button that returns the search panel's filters to their first options. */
  resetFilters: string;
  /** Landmark of the navigation dock and drawer. */
  navigation: string;
  /** Pagination landmark and its buttons. */
  pagination: string;
  previousPage: string;
  nextPage: string;
  /** Caption of the data grid's page size picker. */
  rowsPerPage: string;
  /** Same in a narrow container, so the picker and the pages share a row; empty hides it. */
  rowsPerPageShort: string;
  /** Shown rows of the data grid, as in "1–20 of 64". */
  range: (from: number, to: number, total: number) => string;
  /** Checked rows of the data grid, as in "Selected 2 of 20". */
  selectedCount: (count: number, total: number) => string;
  selectAll: string;
  clearSelection: string;
  /** Checkbox of a data grid row. */
  selectRow: string;
  /** Accessible name of the full-screen image viewer. */
  imageViewer: string;
  /** Remove button of an image in the image grid. */
  removeImage: string;
  /** Why a picked image is left out before uploading (see `ImagePicker`). The limits come from `FY_IMAGE_RULES`. */
  imageUnsupportedType: string;
  imageTooLarge: (maxMb: number) => string;
  imageTooMany: (max: number) => string;
  /** Accessible name of the date picker while empty and once a date is picked. */
  pickDate: string;
  changeDate: string;
  /** Buttons of the slide sheet. */
  slideNext: string;
  slideDone: string;
  slideSkip: string;
  /** Placeholders and names of the two fields of the range field. */
  rangeFrom: string;
  rangeTo: string;
  /** Button of a revealable password. */
  showPassword: string;
  hidePassword: string;
}

export const DEFAULT_FY_LABELS: FyLabels = {
  close: 'Close',
  back: 'Back',
  loading: 'Loading',
  retry: 'Retry',
  clear: 'Clear',
  remove: 'Remove',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  view: 'View',
  actions: 'Actions',
  search: 'Search',
  sort: 'Sort',
  filters: 'Filters',
  resetFilters: 'Reset',
  navigation: 'Navigation',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  rowsPerPage: 'Rows per page',
  rowsPerPageShort: '',
  range: (from, to, total) => `${from}–${to} of ${total}`,
  selectedCount: (count, total) => `Selected ${count} of ${total}`,
  selectAll: 'Select all',
  clearSelection: 'Clear selection',
  selectRow: 'Select row',
  imageViewer: 'Image viewer',
  removeImage: 'Remove image',
  imageUnsupportedType: 'JPEG, PNG, WebP, GIF and BMP are supported.',
  imageTooLarge: maxMb => `The image must be ${maxMb} MB or smaller.`,
  imageTooMany: max => `You can add up to ${max} images.`,
  pickDate: 'Pick a date',
  changeDate: 'Change the date',
  slideNext: 'Next',
  slideDone: 'Got it',
  slideSkip: 'Skip',
  rangeFrom: 'From',
  rangeTo: 'To',
  showPassword: 'Show password',
  hidePassword: 'Hide password'
};

/** Read on every render, so the labels may come from a signal and follow a language switch. */
export const FY_LABELS = new InjectionToken<() => FyLabels>('FY_LABELS', {
  providedIn: 'root',
  factory: () => () => DEFAULT_FY_LABELS
});

/**
 * Replaces the built-in English labels, e.g. with translated ones; the labels left out stay English.
 * `factory` runs in an injection context. The result is a `computed`, so a changing set must come from a signal.
 *
 * ```ts
 * providers: [
 *   provideFyLabels(() => {
 *     const i18n = inject(I18n);
 *     return () => i18n.t().ui;
 *   }),
 * ]
 * ```
 */
export function provideFyLabels(factory: () => () => Partial<FyLabels>): Provider {
  return {
    provide: FY_LABELS,
    useFactory: () => {
      const labels = factory();
      return computed(() => ({ ...DEFAULT_FY_LABELS, ...labels() }));
    }
  };
}
