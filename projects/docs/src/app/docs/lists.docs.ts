import { Component, signal } from '@angular/core';
import {
  AvatarStackComponent,
  ButtonComponent,
  ITEM_LIST,
  ItemCardComponent,
  ItemListMatcher,
  ItemListSortOption,
  PullToRefreshComponent,
  SelectableTile,
  SelectableTileGridComponent,
  SwipeAction,
  SwipeActionsComponent,
  UserAvatarComponent,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN } from './example-styles';

const itemCard = `
<fy-item-card title="Ada Lovelace" subtitle="12 wishes">
  <fy-user-avatar leading fullName="Ada Lovelace" [size]="40" [fontSize]="15" />
  <i trailing class="bi bi-chevron-right"></i>
</fy-item-card>
<fy-item-card title="Book club" subtitle="Default group" accent>
  <fy-avatar-stack trailing [people]="club" [size]="28" />
</fy-item-card>
<fy-item-card title="Just a title" />
`;

@Component({
  selector: 'docs-item-card',
  imports: [ItemCardComponent, UserAvatarComponent, AvatarStackComponent],
  template: itemCard,
  host: COLUMN,
})
class ItemCardExample {
  protected readonly club = [{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }, { name: 'Grace Hopper' }];
}

interface Friend {
  id: number;
  name: string;
  wishes: number;
}

class FriendMatcher extends ItemListMatcher<Friend> {
  protected searchText(friend: Friend): string {
    return friend.name;
  }
}

const itemList = `
<fy-item-list [items]="friends()" [loading]="loading()" searchable searchPlaceholder="Search friends"
  [matcher]="matcher" [sortOptions]="sorts" [(sort)]="sort" ariaLabel="Friends"
  emptyIcon="bi bi-people" emptyText="No friends yet" emptyDescription="Invite someone to see their wishes."
  noResultsIcon="bi bi-search" noResultsText="Nobody found">
  <fy-item-card *fyItemListItem="let friend; items: friends()" [title]="friend.name" [subtitle]="friend.wishes + ' wishes'" />
</fy-item-list>
<div class="buttons">
  <button fyButton type="button" variant="tertiary" size="s" (click)="reload()">Reload</button>
  <button fyButton type="button" variant="tertiary" size="s" (click)="friends.set([])">Empty</button>
</div>
`;

const itemListCode = `${itemList}
// component
class FriendMatcher extends ItemListMatcher<Friend> {
  protected searchText(friend: Friend) {
    return friend.name; // case-insensitive substring
  }
}

protected readonly sorts: ItemListSortOption<Friend>[] = [
  { id: 'name', label: 'By name', compare: (a, b) => a.name.localeCompare(b.name) },
  { id: 'wishes', label: 'Most wishes', compare: (a, b) => b.wishes - a.wishes },
];`;

const FRIENDS: Friend[] = [
  { id: 1, name: 'Ada Lovelace', wishes: 12 },
  { id: 2, name: 'Alan Turing', wishes: 3 },
  { id: 3, name: 'Grace Hopper', wishes: 8 },
  { id: 4, name: 'Linus Torvalds', wishes: 1 },
  { id: 5, name: 'Margaret Hamilton', wishes: 5 },
];

@Component({
  selector: 'docs-item-list',
  imports: [ITEM_LIST, ItemCardComponent, ButtonComponent],
  template: itemList,
  host: COLUMN,
  styles: `.buttons { display: flex; gap: 8px; }`,
})
class ItemListExample {
  protected readonly matcher = new FriendMatcher();
  protected readonly sorts: ItemListSortOption<Friend>[] = [
    { id: 'name', label: 'By name', compare: (a, b) => a.name.localeCompare(b.name) },
    { id: 'wishes', label: 'Most wishes', compare: (a, b) => b.wishes - a.wishes },
  ];
  protected readonly sort = signal<string | null>(null);
  protected readonly friends = signal<Friend[]>(FRIENDS);
  protected readonly loading = signal(false);

  protected reload(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.friends.set(FRIENDS);
      this.loading.set(false);
    }, 1000);
  }
}

const tileGrid = `
<fy-selectable-tile-grid [tiles]="tiles" [selectedIds]="picked()" (toggle)="toggle($event)" />
<p>Picked: {{ names() }}</p>
`;

@Component({ selector: 'docs-tile-grid', imports: [SelectableTileGridComponent], template: tileGrid, host: COLUMN })
class TileGridExample {
  protected readonly tiles: SelectableTile[] = [
    { id: 'ada', label: 'Ada', sublabel: 'Friend' },
    { id: 'alan', label: 'Alan', sublabel: 'Friend' },
    { id: 'grace', label: 'Grace' },
    { id: 'club', label: 'Book club', sublabel: '5 people', icon: 'bi bi-people-fill' },
    { id: 'linus', label: 'Linus' },
  ];
  protected readonly picked = signal<Set<string>>(new Set(['ada']));

  protected toggle(id: string): void {
    this.picked.update(picked => {
      const next = new Set(picked);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  protected names(): string {
    return this.tiles.filter(tile => this.picked().has(tile.id)).map(tile => tile.label).join(', ') || 'nobody';
  }
}

const swipeActions = `
@for (message of messages(); track message.id) {
  <fy-swipe-actions [startActions]="start" [endActions]="end" (action)="onAction(message.id, $event)">
    <fy-item-card [title]="message.title" [subtitle]="message.read ? 'Read' : 'New'" [accent]="!message.read" />
  </fy-swipe-actions>
}
<p>Last action: {{ last() }}</p>
`;

@Component({ selector: 'docs-swipe-actions', imports: [SwipeActionsComponent, ItemCardComponent], template: swipeActions, host: COLUMN })
class SwipeActionsExample {
  protected readonly start: SwipeAction[] = [{ id: 'read', label: 'Read', icon: 'bi bi-envelope-open' }];
  protected readonly end: SwipeAction[] = [
    { id: 'delete', label: 'Delete', icon: 'bi bi-trash3', tone: 'danger' },
    { id: 'mute', label: 'Mute', icon: 'bi bi-bell-slash', tone: 'neutral' },
  ];
  protected readonly messages = signal([
    { id: 1, title: 'Ada booked your wish', read: false },
    { id: 2, title: 'Alan added a new wish', read: false },
    { id: 3, title: 'Book club starts on Friday', read: true },
  ]);
  protected readonly last = signal('—');

  protected onAction(id: number, action: string): void {
    this.last.set(`${action} #${id}`);
    if (action === 'delete') this.messages.update(list => list.filter(message => message.id !== id));
    if (action === 'read') this.messages.update(list => list.map(message => (message.id === id ? { ...message, read: true } : message)));
  }
}

const pullToRefresh = `
<div class="frame">
  <fy-pull-to-refresh [refreshing]="loading()" (refresh)="load()">
    @for (item of items(); track item) {
      <p class="item">{{ item }}</p>
    }
  </fy-pull-to-refresh>
</div>
`;

const pullToRefreshCode = `${pullToRefresh}
// component
protected readonly loading = signal(false);

load() {
  this.loading.set(true);
  this.service.load().subscribe(items => {
    this.items.set(items);
    this.loading.set(false);
  });
}`;

@Component({
  selector: 'docs-pull-to-refresh',
  imports: [PullToRefreshComponent],
  template: pullToRefresh,
  host: COLUMN,
  styles: `
    .frame { height: 260px; overflow-y: auto; border-radius: var(--fy-radius-lg); background: var(--fy-secondary-background); }
    .item { margin: 0; padding: 12px 16px; border-bottom: 1px solid var(--fy-tertiary-background); }
  `,
})
class PullToRefreshExample {
  protected readonly loading = signal(false);
  protected readonly items = signal(['Pull this list down', 'on a touch screen', 'to load it again']);
  private loads = 0;

  protected load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loads++;
      this.items.update(items => [`Loaded ${this.loads} time${this.loads === 1 ? '' : 's'}`, ...items.slice(-3)]);
      this.loading.set(false);
    }, 1200);
  }
}

export const LIST_DOCS: ComponentDoc[] = [
  {
    slug: 'swipe-actions',
    title: 'Swipe actions',
    group: 'Lists',
    summary: 'Buttons under a list row revealed by swiping it sideways; a full swipe runs the outer one.',
    imports: `import { SwipeAction, SwipeActionsComponent } from '@freely-ui/angular';`,
    selectors: ['fy-swipe-actions'],
    examples: [{
      title: 'Messages',
      description: 'Swipe a row left for Delete and Mute, right for Read; swipe it all the way to run the outer button. With a mouse, drag the row.',
      component: SwipeActionsExample,
      code: swipeActions,
    }],
    inputs: [
      { name: 'startActions', type: 'SwipeAction[]', default: '[]', description: 'Revealed by swiping toward the end of the line; the first sits at the outer edge.' },
      { name: 'endActions', type: 'SwipeAction[]', default: '[]', description: 'Revealed by swiping toward the start; the first sits at the outer edge.' },
      { name: 'actionWidth', type: 'number', default: '76', description: 'Width of one button in px.' },
      { name: 'fullSwipe', type: 'boolean', default: 'true', description: 'Swiping past 60% of the row runs its outer action.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'The row does not move.' },
    ],
    outputs: [{ name: 'action', type: 'string', description: 'The id of the action pressed or swiped; the row closes.' }],
    cssVars: [
      { name: '--fy-swipe-actions-radius', default: 'var(--fy-radius-xl)', description: 'Corner radius; matches the item card.' },
      { name: '--fy-swipe-actions-accent / -danger / -neutral', description: 'Fill of the buttons by tone.' },
      { name: '--fy-swipe-actions-color', default: '#fff', description: 'Text and icon colour of the buttons.' },
    ],
    accessibility: [
      'The buttons are real buttons named by their label; focusing one opens its side, so it is in view.',
      'Esc and a tap anywhere else close the row; one row is open at a time.',
      'The click that ends a swipe, and a tap on an open row, do not reach the row itself.',
    ],
  },
  {
    slug: 'pull-to-refresh',
    title: 'Pull to refresh',
    group: 'Lists',
    summary: 'Pulling the content down from the top of its scroll loads it again.',
    imports: `import { PullToRefreshComponent } from '@freely-ui/angular';`,
    selectors: ['fy-pull-to-refresh'],
    examples: [{
      title: 'A list',
      description: 'Touch only. Released past the threshold it emits refresh and spins while refreshing is true; a load the page starts on its own shows nothing.',
      component: PullToRefreshExample,
      code: pullToRefreshCode,
    }],
    inputs: [
      { name: 'refreshing', type: 'boolean', default: 'false', description: 'The load the pull started is running.' },
      { name: 'threshold', type: 'number', default: '64', description: 'How far, in px, the content has to move to refresh.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Ignores the pull.' },
    ],
    outputs: [{ name: 'refresh', type: 'void', description: 'Pulled past the threshold and let go; set refreshing for the time of the load.' }],
    cssVars: [
      { name: '--fy-pull-to-refresh-color', default: 'var(--fy-secondary-text)', description: 'Colour of the arrow and the spinner.' },
      { name: '--fy-pull-to-refresh-icon-size', default: '20px', description: 'Size of the arrow.' },
    ],
    accessibility: [
      'aria-busy while it spins; the spinner is named Refreshing (refreshing of the UI labels).',
      'A gesture only: give keyboard and mouse users a refresh button of their own where it matters.',
      'In a Telegram Mini App the platform adapter turns off the swipe that closes the app, so the pull is the page’s.',
    ],
  },
  {
    slug: 'item-card',
    title: 'Item card',
    group: 'Lists',
    summary: 'The default list row: a rounded surface with a title, a subtitle and slots at both ends.',
    imports: `import { ItemCardComponent } from '@freely-ui/angular';`,
    selectors: ['fy-item-card'],
    examples: [{
      title: 'With an avatar, a stack and plain',
      description: 'Slots: [leading] and [trailing]. Inside a searchable item list the title and the subtitle mark what matches the query.',
      component: ItemCardExample,
      code: itemCard,
    }],
    inputs: [
      { name: 'title', type: 'string', default: "''", description: 'The main line.' },
      { name: 'subtitle', type: 'string | null', description: 'The second line, smaller and muted.' },
      { name: 'accent', type: 'boolean', default: 'false', description: 'Accent border and subtitle, e.g. for a default or selected row.' },
    ],
    cssVars: [
      { name: '--fy-item-card-trailing-inset', default: '17px', description: 'Space between the trailing slot and the end edge.' },
    ],
    accessibility: ['A plain surface with no role: wrap it in a link or a button, or put one into a slot, when the row does something.'],
  },
  {
    slug: 'item-list',
    title: 'Item list',
    group: 'Lists',
    summary: 'Rows from a template with loading, empty, error and no-results states, an optional search and sort, and animated rows.',
    imports: `import { ITEM_LIST, ItemListMatcher, ItemListSortOption } from '@freely-ui/angular';`,
    selectors: [
      'fy-item-list',
      'ng-template[fyItemListItem]',
      'ng-template[fyItemListEmpty]',
      'ng-template[fyItemListLoading]',
      'ng-template[fyItemListNoResults]',
      'fy-item-list-highlight',
    ],
    examples: [{
      title: 'Friends with a search and a sort',
      description: 'Search and sort run on the data, so leaving rows animate out and a new order slides every row to its place. A matcher says what to search; without one only strings and numbers are searchable. App-wide texts come from provideItemListDefaults.',
      component: ItemListExample,
      code: itemListCode,
    }],
    inputs: [
      { name: 'items', type: 'T[] | null', default: '[]', description: 'The rows; null or empty shows the empty state.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'A spinner, or the fyItemListLoading template, instead of the rows.' },
      { name: 'error', type: 'boolean', default: 'false', description: 'An error state with a retry button, over loading and empty.' },
      { name: 'errorIcon, errorText, errorDescription, retryText', type: 'string', description: 'Texts of the error state.' },
      { name: 'emptyIcon, emptyText, emptyDescription', type: 'string', default: "''", description: 'The built-in empty state, shown once any of them is set.' },
      { name: 'searchable', type: 'boolean', default: 'false', description: 'A search field above the rows.' },
      { name: 'matcher', type: 'ItemListMatcher<T>', description: 'What a query matches; implement searchText or override matches.' },
      { name: 'query', type: 'string', default: "''", description: 'The query, also as [(query)].' },
      { name: 'searchPlaceholder', type: 'string', default: "''", description: 'Placeholder of the search field.' },
      { name: 'noResultsIcon, noResultsText', type: 'string', default: "''", description: 'The built-in state for a query that matches nothing.' },
      { name: 'filtered', type: 'boolean', default: 'false', description: 'Items are narrowed outside the list; keeps the toolbar when nothing is left.' },
      { name: 'summarySuffix', type: 'string', default: "''", description: 'Appended to the item count, e.g. the filters in effect.' },
      { name: 'sortOptions', type: 'ItemListSortOption<T>[]', default: '[]', description: 'Orders, as { id, label, compare }; the button shows from two on.' },
      { name: 'sort', type: 'string | null', default: 'null', description: 'Id of the order, also as [(sort)]; null is the first.' },
      { name: 'sortLabel', type: 'string', description: 'Name of the sort button; sort of the UI labels by default.' },
      { name: 'stickyToolbar', type: 'boolean', default: 'false', description: 'Pins the search and the sort to the top of the scroll; it slides away scrolling down.' },
      { name: 'animated', type: 'boolean', default: 'true', description: 'Row enter, leave and reorder animations.' },
      { name: 'trackBy', type: 'string | TrackByFunction<T>', default: "'id'", description: 'Property or function giving a row its identity.' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the list.' },
    ],
    outputs: [
      { name: 'queryChange', type: 'string', description: 'The query was typed or cleared.' },
      { name: 'sortChange', type: 'string', description: 'Another order was picked.' },
      { name: 'retry', type: 'void', description: 'The retry button of the error state was pressed.' },
    ],
    cssVars: [
      { name: '--fy-item-list-gap', description: 'Space between the rows.' },
      { name: '--fy-item-list-status-padding', description: 'Padding of the loading, empty and error states.' },
      { name: '--fy-item-list-spinner-size / -color / -track', description: 'The built-in spinner.' },
      { name: '--fy-item-list-search-gap', description: 'Space under the search field.' },
      { name: '--fy-item-list-summary-size / -color', description: 'The item count.' },
      { name: '--fy-item-list-toolbar-top', description: 'Where a sticky toolbar pins, e.g. under a page header.' },
      { name: '--fy-item-list-toolbar-bg', description: 'Fill of a sticky toolbar; make it opaque.' },
      { name: '--fy-item-list-toolbar-z-index', default: '9', description: 'Layer of a sticky toolbar.' },
      { name: '--fy-item-list-highlight-bg / -color', description: 'The mark of a match.' },
    ],
    accessibility: [
      'role="list" with a listitem per row, named by ariaLabel.',
      'Loading and the empty and no-results states are polite status regions; the error state is an alert.',
      'The item count under the search is read by a polite live region; animations stop under prefers-reduced-motion.',
    ],
  },
  {
    slug: 'selectable-tile-grid',
    title: 'Selectable tile grid',
    group: 'Lists',
    summary: 'Avatars to pick several of, e.g. friends and groups a wish is shown to.',
    imports: `import { SelectableTile, SelectableTileGridComponent } from '@freely-ui/angular';`,
    selectors: ['fy-selectable-tile-grid'],
    examples: [{
      title: 'Who sees the wish',
      description: 'Pass selectedIds and handle toggle, or bind an array of ids with ngModel or a form control, and it toggles them itself.',
      component: TileGridExample,
      code: tileGrid,
    }],
    inputs: [
      { name: 'tiles', type: 'SelectableTile[]', default: '[]', description: 'The tiles, as { id, label, sublabel?, icon?, imageUrl? }.' },
      { name: 'selectedIds', type: 'Set<string>', default: 'new Set()', description: 'The picked ids while no form control is bound.' },
    ],
    outputs: [{ name: 'toggle', type: 'string', description: 'The id of the tile pressed.' }],
    accessibility: ['Every tile is a button named by its label and sublabel; disabled with its form control.'],
  },
];
