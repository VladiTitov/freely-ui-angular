import { InjectionToken, Provider } from '@angular/core';
import { ItemListDefaults } from './item-list.types';

/** Injection token holding the {@link ItemListDefaults} for `<fy-item-list>`. */
export const ITEM_LIST_DEFAULTS = new InjectionToken<ItemListDefaults>('ITEM_LIST_DEFAULTS');

/**
 * Registers app- or feature-wide defaults for `<fy-item-list>`.
 *
 * ```ts
 * providers: [
 *   provideItemListDefaults({ emptyText: 'Nothing here yet', animated: true }),
 * ]
 * ```
 */
export function provideItemListDefaults(defaults: ItemListDefaults): Provider {
  return { provide: ITEM_LIST_DEFAULTS, useValue: defaults };
}
