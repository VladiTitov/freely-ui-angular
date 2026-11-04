import { InjectionToken, Signal } from '@angular/core';

/**
 * Folds a string for matching: lower-cased, `ё` → `е`. Length-preserving for
 * everything the app shows, so indices found in the folded string map straight
 * back onto the original (see {@link splitHighlight}).
 */
export function foldSearchText(value: string): string {
  return value.toLocaleLowerCase().replace(/ё/g, 'е');
}

/** What a searchable `<fy-item-list>` exposes to the rows rendered inside it. */
export interface ItemListSearchContext {
  /** Trimmed search query, `''` when nothing is being searched. */
  readonly query: Signal<string>;
}

/** Provided by `<fy-item-list>` to its rows; absent outside a list. */
export const ITEM_LIST_SEARCH = new InjectionToken<ItemListSearchContext>('ITEM_LIST_SEARCH');
