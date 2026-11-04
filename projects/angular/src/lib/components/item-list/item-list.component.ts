import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  EventEmitter,
  inject,
  Injector,
  Input,
  isDevMode,
  OnInit,
  Output,
  signal,
  TrackByFunction,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';
import { ItemListEmptyDef, ItemListItemDef, ItemListLoadingDef, ItemListNoResultsDef } from './item-list.directives';
import { ItemListAutoHide } from './item-list.auto-hide';
import { ItemListFlip } from './item-list.flip';
import { ItemListMatcher, PrimitiveItemListMatcher } from './item-list.matcher';
import { ITEM_LIST_SEARCH, ItemListSearchContext } from './item-list.search';
import { ITEM_LIST_DEFAULTS } from './item-list.token';
import { ItemListContext, ItemListSortOption, ItemListTrackBy } from './item-list.types';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

const PRIMITIVE_MATCHER = new PrimitiveItemListMatcher() as ItemListMatcher<any>;

@Component({
  selector: 'fy-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
  imports: [NgTemplateOutlet, EmptyStateComponent, SearchBarComponent, SortMenuComponent, ItemListFlip, ItemListAutoHide],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-item-list',
    '[class.fy-item-list--loading]': 'loading',
    '[class.fy-item-list--empty]': '!loading && isEmpty',
    '[class.fy-item-list--no-results]': '!loading && hasNoResults',
  },
})
export class ItemListComponent<T = unknown> implements OnInit {
  private readonly defaults = inject(ITEM_LIST_DEFAULTS, { optional: true });
  protected readonly labels = inject(FY_LABELS);
  private readonly icons = inject(FY_ICONS);

  /** Rows to render. `null`/`undefined` renders the empty state (or loading, if set). */
  @Input()
  set items(value: readonly T[] | null | undefined) {
    this._items.set(value);
  }
  get items(): readonly T[] | null | undefined {
    return this._items();
  }
  private readonly _items = signal<readonly T[] | null | undefined>([]);

  /** Show the loading state instead of the list. */
  @Input({ transform: booleanAttribute }) loading = false;

  /**
   * The list could not be loaded: shows the error state with a retry button instead of the list, the loading
   * and the empty state. Pressing the button emits `retry`; the caller loads again and clears `error`.
   */
  @Input({ transform: booleanAttribute }) error = false;
  /** Icon class of the error state. */
  @Input() errorIcon = this.defaults?.errorIcon ?? this.icons.error;
  /** Primary line of the error state. */
  @Input() errorText = this.defaults?.errorText ?? '';
  /** Secondary line of the error state. */
  @Input() errorDescription = this.defaults?.errorDescription ?? '';
  /** Text of the error state's button; `retry` of the UI labels when not given. */
  @Input() retryText = this.defaults?.retryText;
  @Output() readonly retry = new EventEmitter<void>();

  /** Run row enter/leave animations. Defaults to the provided value or `true`. */
  @Input({ transform: booleanAttribute }) animated = this.defaults?.animated ?? true;

  // Built-in empty state — all ignored when `*fyItemListEmpty` is supplied; the
  // state renders as soon as any of the three is set.

  /** Icon class for the built-in empty state, e.g. `"bi bi-inbox"`. */
  @Input() emptyIcon = this.defaults?.emptyIcon ?? '';
  /** Primary line of the built-in empty state. */
  @Input() emptyText = this.defaults?.emptyText ?? '';
  /** Secondary line of the built-in empty state, rendered under `emptyText`. */
  @Input() emptyDescription = this.defaults?.emptyDescription ?? '';

  // Search — off unless `searchable` is set. The field is hidden while loading
  // and when there is nothing to search (unless `filtered`). Anything marked
  // `itemListSearchTrailing` is projected at the end of the field.

  /** Show a search field above the list; items that don't match are left out. */
  @Input({ transform: booleanAttribute })
  set searchable(value: boolean) {
    this._searchable.set(value);
  }
  get searchable(): boolean {
    return this._searchable();
  }
  private readonly _searchable = signal(false);

  /** Decides which items match the query. Without it only primitive items are searchable. */
  @Input()
  set matcher(value: ItemListMatcher<T> | null | undefined) {
    this._matcher.set(value ?? PRIMITIVE_MATCHER);
  }
  private readonly _matcher = signal<ItemListMatcher<T>>(PRIMITIVE_MATCHER);

  /**
   * The items are already narrowed by filters outside the list, e.g. a toggle
   * projected with `itemListSearchTrailing`. Keeps the toolbar on screen when
   * they leave nothing, so the filters can still be changed.
   */
  @Input({ transform: booleanAttribute }) filtered = false;

  /** Appended to the item count, e.g. the filters in effect. */
  @Input() summarySuffix = '';

  /** Placeholder of the search field. */
  @Input() searchPlaceholder = this.defaults?.searchPlaceholder ?? '';
  /** Icon class of the built-in "no results" state. */
  @Input() noResultsIcon = this.defaults?.noResultsIcon ?? '';
  /** Primary line of the built-in "no results" state. */
  @Input() noResultsText = this.defaults?.noResultsText ?? '';

  /** Current search query; two-way bindable via `[(query)]`. */
  @Input()
  set query(value: string | null | undefined) {
    this._query.set(value ?? '');
  }
  get query(): string {
    return this._query();
  }
  @Output() readonly queryChange = new EventEmitter<string>();
  private readonly _query = signal('');

  // Sort — off unless `sortOptions` is set; the first option is the default.
  // Shown as a text button under the search field, opposite the item count.

  /** Ways to order the list; the button appears when there is more than one. */
  @Input()
  set sortOptions(value: readonly ItemListSortOption<T>[] | null | undefined) {
    this._sortOptions.set(value ?? []);
  }
  get sortOptions(): readonly ItemListSortOption<T>[] {
    return this._sortOptions();
  }
  private readonly _sortOptions = signal<readonly ItemListSortOption<T>[]>([]);

  /** Id of the selected sort option; two-way bindable via `[(sort)]`. `null` = first option. */
  @Input()
  set sort(value: string | null | undefined) {
    if ((value ?? null) !== this._sort()) this.flip()?.prepare();
    this._sort.set(value ?? null);
  }
  get sort(): string | null {
    return this._sort();
  }
  @Output() readonly sortChange = new EventEmitter<string>();
  private readonly _sort = signal<string | null>(null);

  /** `aria-label` of the sort button; `sort` of the UI labels when not given. */
  @Input() sortLabel = this.defaults?.sortLabel;

  /**
   * Pin the search/sort toolbar to the top of the scroll area; it slides away
   * while scrolling down and returns on a short scroll up.
   */
  @Input({ transform: booleanAttribute }) stickyToolbar = this.defaults?.stickyToolbar ?? false;

  /** `aria-label` for the list container. */
  @Input() ariaLabel?: string;

  /** Property name to read the row identity from, or a full `TrackByFunction`. */
  @Input()
  set trackBy(value: ItemListTrackBy<T>) {
    this._trackBy =
      typeof value === 'function'
        ? (value as TrackByFunction<T>)
        : (index, item) => (item as Record<string, unknown>)?.[value as string] ?? index;
  }
  get trackBy(): TrackByFunction<T> {
    return this._trackBy;
  }
  private _trackBy: TrackByFunction<T> = (index, item) =>
    (item as Record<string, unknown> | null)?.['id'] ?? index;

  @ContentChild(ItemListItemDef) protected itemDef?: ItemListItemDef<T>;
  @ContentChild(ItemListEmptyDef) protected emptyDef?: ItemListEmptyDef;
  @ContentChild(ItemListLoadingDef) protected loadingDef?: ItemListLoadingDef;
  @ContentChild(ItemListNoResultsDef) protected noResultsDef?: ItemListNoResultsDef;

  protected readonly searchClearLabel = this.defaults?.searchClearLabel;

  /** Trimmed query, `''` when nothing is being searched. */
  protected readonly activeQuery = computed(() => (this._searchable() ? this._query().trim() : ''));

  /** Sort option in effect: the selected one, else the first. */
  private readonly activeSort = computed(() => {
    const options = this._sortOptions();
    return options.find(option => option.id === this._sort()) ?? options[0];
  });

  /** Items left after applying the search query, in the selected order. */
  protected readonly visibleItems = computed<readonly T[]>(() => {
    let items = this._items() ?? [];
    const query = this.activeQuery();
    if (query) {
      const matcher = this._matcher();
      items = items.filter(item => matcher.matches(item, query));
    }
    const sort = this.activeSort();
    return sort ? [...items].sort(sort.compare) : items;
  });

  private readonly flip = viewChild(ItemListFlip);

  /** Lets rows (e.g. `<fy-item-list-highlight>`) read the query through DI. */
  protected readonly rowInjector = Injector.create({
    providers: [{ provide: ITEM_LIST_SEARCH, useValue: { query: this.activeQuery } satisfies ItemListSearchContext }],
    parent: inject(Injector),
  });

  get isEmpty(): boolean {
    return !this.items || this.items.length === 0;
  }

  protected get hasSort(): boolean {
    return this.sortOptions.length > 1;
  }

  protected get showToolbar(): boolean {
    return (this.searchable || this.hasSort) && !this.loading && !this.error && (!this.isEmpty || this.filtered);
  }

  /** A query is active and filtered every item out. */
  protected get hasNoResults(): boolean {
    return !this.isEmpty && this.visibleItems().length === 0;
  }

  protected get noResultsDescription(): string {
    return this.defaults?.noResultsDescription?.(this.activeQuery()) ?? '';
  }

  /** Left of the sort button: the total count, or what was found while searching. */
  protected get summary(): string {
    const summary = this.countSummary();
    return this.summarySuffix && summary ? `${summary} · ${this.summarySuffix}` : summary || this.summarySuffix;
  }

  private countSummary(): string {
    const total = this.items?.length ?? 0;
    if (this.activeQuery()) {
      return this.defaults?.searchSummary?.(this.visibleItems().length, total) ?? '';
    }
    return this.defaults?.totalSummary?.(total) ?? '';
  }

  protected onSortChange(id: string | null): void {
    if (id === null) return;
    this.sort = id;
    this.sortChange.emit(id);
  }

  protected onQueryChange(value: string): void {
    this._query.set(value);
    this.queryChange.emit(value);
  }

  /** Whether the built-in empty state has anything to show. */
  protected get hasBuiltInEmpty(): boolean {
    return !!(this.emptyIcon || this.emptyText || this.emptyDescription);
  }

  ngOnInit(): void {
    if (isDevMode() && !this.itemDef) {
      console.warn(
        '<fy-item-list> has no row template. Add `<ng-template fyItemListItem let-item>` ' +
          '(or `*fyItemListItem="let item"`) to render rows.',
      );
    }
  }

  protected trackItem: TrackByFunction<T> = (index, item) => this._trackBy(index, item);

  protected context(item: T, index: number, count: number): ItemListContext<T> {
    return {
      $implicit: item,
      index,
      first: index === 0,
      last: index === count - 1,
      even: index % 2 === 0,
      odd: index % 2 === 1,
      count,
    };
  }
}
