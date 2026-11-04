import { TrackByFunction } from '@angular/core';

/**
 * Context object passed to the item template. Mirrors the shape of the
 * `@for` block locals so switching between the two is friction-free.
 */
export interface ItemListContext<T> {
  $implicit: T;
  index: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
  count: number;
}

/**
 * Application-wide defaults for every `<fy-item-list>`. Provide via
 * {@link provideItemListDefaults} in the root (or a feature) injector.
 */
export interface ItemListDefaults {
  /** Icon class for the built-in empty state, e.g. `"bi bi-inbox"`. */
  emptyIcon?: string;
  /** Primary line of the built-in empty state, when no `*fyItemListEmpty` is given. */
  emptyText?: string;
  /** Secondary line of the built-in empty state, rendered under `emptyText`. */
  emptyDescription?: string;
  /** Whether item enter/leave animations run by default. */
  animated?: boolean;
  /** Placeholder of the search field (`searchable` lists). */
  searchPlaceholder?: string;
  /** `aria-label` of the search field's clear button. */
  searchClearLabel?: string;
  /** Icon class of the built-in "no results" state. */
  noResultsIcon?: string;
  /** Primary line of the built-in "no results" state. */
  noResultsText?: string;
  /** Secondary line of the "no results" state; receives the query. */
  noResultsDescription?: (query: string) => string;
  /** Count under the search field while not filtering, e.g. `12 items`. Omit to hide it. */
  totalSummary?: (total: number) => string;
  /** Count under the search field while filtering, e.g. `Found: 2`. Omit to hide it. */
  searchSummary?: (found: number, total: number) => string;
  /** `aria-label` of the sort button. */
  sortLabel?: string;
  /** Pin the toolbar and hide it on scroll down, show on scroll up. */
  stickyToolbar?: boolean;
  /** Icon class of the error state, shown while `error` is set. */
  errorIcon?: string;
  /** Primary line of the error state. */
  errorText?: string;
  /** Secondary line of the error state. */
  errorDescription?: string;
  /** Button of the error state that loads the list again. */
  retryText?: string;
}

/**
 * One way to order the list. The first option passed to `sortOptions` is the
 * default; `compare` works like `Array.prototype.sort`'s comparator.
 */
export interface ItemListSortOption<T> {
  id: string;
  label: string;
  compare: (a: T, b: T) => number;
}

/** A property name to read the identity from, or a full `TrackByFunction`. */
export type ItemListTrackBy<T> = keyof T | (string & {}) | TrackByFunction<T>;

