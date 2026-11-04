import { foldSearchText } from './item-list.search';

/**
 * Decides which items of a `searchable` `<fy-item-list>` match the query. Works on
 * data, not on rendered rows, so the list can filter before rendering (and
 * later virtualize).
 *
 * Implement {@link searchText}, or override {@link matches} for rules beyond a
 * substring check:
 *
 * ```ts
 * export class UserMatcher extends ItemListMatcher<User> {
 *   protected searchText(user: User) { return `${user.name} ${user.email}`; }
 * }
 * ```
 *
 * ```html
 * <fy-item-list [items]="users" searchable [matcher]="userMatcher"> … </fy-item-list>
 * ```
 *
 * The folded text of object items is cached per object, so treat items as
 * immutable: a mutated item keeps matching on its old text.
 */
export abstract class ItemListMatcher<T> {
  private readonly cache = new WeakMap<object, string>();

  /** Text the query is matched against. */
  protected abstract searchText(item: T): string | null | undefined;

  /**
   * Whether `item` matches `query` (trimmed, never empty). Default:
   * case-insensitive substring of {@link searchText}, `ё` matching `е`.
   */
  matches(item: T, query: string): boolean {
    return this.foldedText(item).includes(foldSearchText(query));
  }

  /** Folded {@link searchText}, cached for object items. */
  protected foldedText(item: T): string {
    if (typeof item !== 'object' || item === null) {
      return foldSearchText(this.searchText(item) ?? '');
    }
    let text = this.cache.get(item);
    if (text === undefined) {
      text = foldSearchText(this.searchText(item) ?? '');
      this.cache.set(item, text);
    }
    return text;
  }
}

/** Fallback when no `matcher` is given: primitives match on their string form. */
export class PrimitiveItemListMatcher extends ItemListMatcher<unknown> {
  protected searchText(item: unknown): string {
    return item == null || typeof item === 'object' ? '' : String(item);
  }
}
