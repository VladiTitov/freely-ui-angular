import { ItemListComponent } from './item-list.component';
import { ItemListEmptyDef, ItemListItemDef, ItemListLoadingDef, ItemListNoResultsDef } from './item-list.directives';
import { ItemListHighlightComponent } from './item-list.highlight';

export { ItemListComponent } from './item-list.component';
export { ItemListItemDef, ItemListEmptyDef, ItemListLoadingDef, ItemListNoResultsDef } from './item-list.directives';
export { ItemListHighlightComponent, splitHighlight } from './item-list.highlight';
export type { ItemListHighlightPart } from './item-list.highlight';
export { ItemListMatcher } from './item-list.matcher';
export { ITEM_LIST_SEARCH } from './item-list.search';
export type { ItemListSearchContext } from './item-list.search';
export { ITEM_LIST_DEFAULTS, provideItemListDefaults } from './item-list.token';

export type { ItemListContext, ItemListDefaults, ItemListSortOption, ItemListTrackBy } from './item-list.types';

export const ITEM_LIST = [
  ItemListComponent,
  ItemListItemDef,
  ItemListEmptyDef,
  ItemListLoadingDef,
  ItemListNoResultsDef,
  ItemListHighlightComponent,
] as const;
