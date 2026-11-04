# item-list

Presentational list component. Renders a projected template per row and ships
built-in **loading** and **empty** states that can each be overridden.

No UIkit, no hard-coded locale, no app services. The sibling dependencies are
`shared/empty-state` (built-in empty state), `shared/search-bar` (optional
search field) and `shared/sort-menu` (optional sort menu, built on
`shared/dropdown-menu`). The selector carries the library prefix: `fy-item-list`.

## Usage

```ts
import { ITEM_LIST } from '@freely-ui/angular';

@Component({ imports: [...ITEM_LIST /* , ... */] })
```

```html
<fy-item-list
  [items]="users()"
  [loading]="loading()"
  emptyIcon="bi bi-people"
  emptyText="No users yet"
  emptyDescription="Invite a teammate to get started.">
  <user-card *fyItemListItem="let user; items: users()" [user]="user" />
</fy-item-list>
```

`items:` in the row template is optional and only drives generic type
inference (`let user` becomes the array element type). Without it the row is `any`.

### Slots

| Slot | How | Purpose |
| --- | --- | --- |
| row | `*fyItemListItem="let item; items: src"` | required; one per item |
| empty | `<ng-template fyItemListEmpty>` | replaces the built-in `<fy-empty-state>` |
| loading | `<ng-template fyItemListLoading>` | replaces the built-in spinner |
| no results | `<ng-template fyItemListNoResults let-query>` | replaces the built-in "nothing found" state |

Row template context: `$implicit`, `index`, `first`, `last`, `even`, `odd`, `count`.


### Inputs

| Input | Type | Default |
| --- | --- | --- |
| `items` | `readonly T[] \| null \| undefined` | `[]` |
| `loading` | `boolean` | `false` |
| `error` / `(retry)` | `boolean` | `false` — error state with a retry button, over loading and empty |
| `errorIcon` / `errorText` / `errorDescription` / `retryText` | `string` | provider value |
| `animated` | `boolean` | `true` (or provider value) |
| `emptyIcon` | `string` | `''` (or provider value) |
| `emptyText` | `string` | `''` (or provider value) |
| `emptyDescription` | `string` | `''` (or provider value) |
| `ariaLabel` | `string` | — |
| `trackBy` | property name `\| TrackByFunction<T>` | `'id'` then index |
| `searchable` | `boolean` | `false` |
| `matcher` | `ItemListMatcher<T>` | primitive items only |
| `sortOptions` | `ItemListSortOption<T>[]` | `[]` |
| `sort` / `(sortChange)` | option id | first option |
| `sortLabel` | `string` | `'Sort'` (or provider value) |
| `query` / `(queryChange)` | `string` | `''` |
| `searchPlaceholder` | `string` | `''` (or provider value) |
| `stickyToolbar` | `boolean` | `false` (or provider value) |
| `noResultsIcon` / `noResultsText` | `string` | `''` (or provider value) |

### Search

`searchable` shows a `<fy-search-bar>` above the rows (hidden while loading and when
the source list is empty). Filtering runs on the data, before rendering, so
non-matching rows leave with the regular row animation. What matches is decided
by an `ItemListMatcher`: implement `searchText`, or override `matches` for a
custom rule.

```ts
import { ItemListMatcher } from '@freely-ui/angular';

export class UserMatcher extends ItemListMatcher<User> {
  // Default rule: case-insensitive substring of this text (`ё` matches `е`).
  protected searchText(user: User) {
    return `${user.name} ${user.email}`;
  }

  // Optional: replace the rule entirely.
  override matches(user: User, query: string) {
    return super.matches(user, query) || user.tags.includes(query);
  }
}
```

```html
<fy-item-list [items]="users" searchable [matcher]="userMatcher">
  <user-card *fyItemListItem="let user; items: users" [user]="user" />
</fy-item-list>
```

Without a `matcher` only primitive items (strings, numbers) are searchable. The
folded text of object items is cached per object, so keep items immutable.
Row components need nothing search-specific; they read the query through DI
(`ITEM_LIST_SEARCH`) only if they want to show it.

Mark matches inside a row with `<fy-item-list-highlight [text]="...">` (part of
`ITEM_LIST`); it picks up the query on its own. `splitHighlight(text, query)`
is exported for custom markup.

When a query matches no row, the `*fyItemListNoResults` template (context: the
query) or the built-in `<fy-empty-state>` with `noResultsIcon` / `noResultsText` /
`noResultsDescription` is shown.

Under the field sits a meta row: the count on the left, the sort menu on the
right. The count comes from the provider: `totalSummary(total)` (e.g.
"Total: 5") normally, `searchSummary(found, total)` (e.g. "Found 2 of 5")
while a query is active. Omit both to leave the left side blank.

### Sort

`sortOptions` adds a text button with the selected option's label and a
chevron (right side of the meta row, under the search field) once there are
two or more options. The first option is the default. Items are
filtered first, then a copy is sorted, so `items` itself is never reordered.

```ts
export const USER_SORTS: ItemListSortOption<User>[] = [
  { id: 'newest', label: 'Newest first', compare: (a, b) => b.createdAt - a.createdAt },
  { id: 'name', label: 'By name', compare: (a, b) => a.name.localeCompare(b.name) },
];
```

```html
<fy-item-list [items]="users" searchable [matcher]="userMatcher" [sortOptions]="sorts" [(sort)]="sortId">
```

Changing the sort slides every row from its old place to the new one (FLIP,
300ms, via the internal `fyItemListFlip` directive). It is off with
`animated="false"` and under `prefers-reduced-motion`.

`<fy-sort-menu>` (`shared/sort-menu`) is standalone as well:
`<fy-sort-menu [options]="[{ id, label }]" [(value)]="id" label="Sort" />`.
The trigger is styled via `--fy-sort-menu-*`: `accent` (text colour), `icon-size`,
`font-size`; the popup is a `<fy-dropdown-menu>` (see below).

`<fy-dropdown-menu>` (`shared/dropdown-menu`, import `DROPDOWN_MENU`) is the
reusable popup: mark the trigger with `fyDropdownTrigger`, entries with
`fyDropdownItem` (`[checked]` makes it radio-style and reveals a child
`.fy-dropdown-menu__check`), separators with `fyDropdownDivider`.

```html
<fy-dropdown-menu label="Actions">
  <button fyDropdownTrigger type="button"><i class="bi bi-three-dots"></i></button>
  <button fyDropdownItem type="button" (click)="edit()">Edit</button>
  <hr fyDropdownDivider />
  <button fyDropdownItem type="button" (click)="remove()">Delete</button>
</fy-dropdown-menu>
```

Inputs: `label`, `align` (`'end'` | `'start'`), `keepOpen`; outputs `opened`,
`closed`. Closes on item click, outside click and Escape (focus returns to the
trigger); ↑/↓/Home/End move between items. Styled via `--fy-dropdown-menu-*`:
`color`, `accent`, `offset`, `panel-bg`, `panel-width`, `panel-radius`,
`panel-shadow`, `item-hover-bg`, `divider-color`, `font-size`, `z-index`.

`<fy-search-bar>` (`shared/search-bar`) works on its own too:
`<fy-search-bar [(value)]="query" placeholder="Search" />`. Inputs: `placeholder`,
`ariaLabel`, `clearLabel` (default `clear` of `FY_LABELS`), `icon` (default
`search` of `FY_ICONS`), `debounce` (ms,
default 150). Escape clears. Styled via `--fy-search-bar-*`: `bg`, `color`,
`muted-color`, `border-color`, `focus-color` (border, glow and icon on focus),
`clear-bg`, `radius` (pill), `height` (40px), `padding-x`, `gap`, `icon-size`
(16px), `font-size` (15px), `clear-size`, `placeholder-opacity`.

Loading state resolves to the `*fyItemListLoading` template if present, otherwise
the built-in CSS spinner.

### Sticky toolbar

With `stickyToolbar` the search/sort toolbar sticks to the top of the nearest
scrollable ancestor at `--fy-item-list-toolbar-top` (the app maps it to
`--fy-page-sticky-height`, the live height of `<fy-page>`'s pinned header). While
scrolling down it slides away after 24px; a scroll up of 8px brings it back. It
never hides before it gets pinned or while focus is inside it. Under
`prefers-reduced-motion` it toggles without the slide. Give it an opaque
`--fy-item-list-toolbar-bg` so rows passing underneath are hidden; the page header
must stack above it (`--fy-item-list-toolbar-z-index`, default 9).

### Built-in empty state

When no `*fyItemListEmpty` template is given, `<fy-item-list>` renders
`<fy-empty-state>` (from `shared/empty-state`) as soon as any of `emptyIcon` /
`emptyText` / `emptyDescription` is set. That component lives in its own folder
and can be used on its own:

```ts
import { EmptyStateComponent } from '@freely-ui/angular';
```

```html
<fy-empty-state icon="bi bi-inbox" label="Nothing here" description="Add an item." />
```

It ships no icon font — pass a ready-made class string (`icon="bi bi-people"`).
Tune the look with `--fy-empty-state-*` custom properties: `--fy-empty-state-gap`,
`--fy-empty-state-padding`, `--fy-empty-state-color`, `--fy-empty-state-icon-size`,
`--fy-empty-state-icon-bg`, `--fy-empty-state-icon-color`, `--fy-empty-state-icon-font-size`,
`--fy-empty-state-label-size`, `--fy-empty-state-label-color`,
`--fy-empty-state-description-size`, `--fy-empty-state-description-color`,
`--fy-empty-state-description-width`, `--fy-empty-state-description-opacity`.

### App-wide defaults

```ts
providers: [
  provideItemListDefaults({
    emptyIcon: 'bi bi-inbox',
    emptyText: 'Nothing here yet',
    animated: true,
    searchPlaceholder: 'Search',
    noResultsIcon: 'bi bi-search',
    noResultsText: 'Nothing found',
    noResultsDescription: query => `Nothing matches "${query}".`,
    totalSummary: total => `Total: ${total}`,
    searchSummary: (found, total) => `Found ${found} of ${total}`,
    sortLabel: 'Sort',
  }),
]
```

### Styling

Layout only — no scrolling, padding or header. Tune via CSS custom properties:
`--fy-item-list-gap`, `--fy-item-list-status-padding`, `--fy-item-list-spinner-size`,
`--fy-item-list-spinner-color`, `--fy-item-list-spinner-track`, `--fy-item-list-search-gap`,
`--fy-item-list-summary-size`, `--fy-item-list-summary-color`,
`--fy-item-list-toolbar-gap`, plus the
`--fy-empty-state-*` set above. Host classes: `fy-item-list`, `fy-item-list--loading`,
`fy-item-list--empty`, `fy-item-list--no-results`. The mark is tuned with
`--fy-item-list-highlight-bg` / `--fy-item-list-highlight-color`.
