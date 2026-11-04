import { Directive, inject, Input, TemplateRef } from '@angular/core';
import { ItemListContext } from './item-list.types';

/**
 * Marks the template used to render a single row.
 *
 * ```html
 * <fy-item-list [items]="users">
 *   <user-card *fyItemListItem="let user; items: users" [user]="user" />
 * </fy-item-list>
 * ```
 *
 * The optional `items:` binding is only there for generic type inference — it
 * lets `let user` resolve to the element type of the bound array. Omit it and
 * the row value falls back to `any`.
 */
@Directive({ selector: 'ng-template[fyItemListItem]' })
export class ItemListItemDef<T = any> {
  readonly template = inject<TemplateRef<ItemListContext<T>>>(TemplateRef);

  /** Type-inference anchor for `*fyItemListItem="let row; items: source"`. */
  @Input('fyItemListItemItems') items?: readonly T[] | null;

  static ngTemplateContextGuard<T>(_dir: ItemListItemDef<T>, _ctx: unknown): _ctx is ItemListContext<T> {
    return true;
  }
}

/** Marks the template shown when there are no items. */
@Directive({ selector: 'ng-template[fyItemListEmpty]' })
export class ItemListEmptyDef {
  readonly template = inject<TemplateRef<void>>(TemplateRef);
}

/** Marks the template shown while `[loading]` is `true`. */
@Directive({ selector: 'ng-template[fyItemListLoading]' })
export class ItemListLoadingDef {
  readonly template = inject<TemplateRef<void>>(TemplateRef);
}

/** Marks the template shown when a search matches no items. */
@Directive({ selector: 'ng-template[fyItemListNoResults]' })
export class ItemListNoResultsDef {
  readonly template = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);
}
