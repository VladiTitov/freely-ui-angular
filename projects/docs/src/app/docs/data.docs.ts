import { Component, computed, signal } from '@angular/core';
import {
  DATA_GRID,
  DataGridColumn,
  DataGridSort,
  EmptyStateComponent,
  FilterToggleComponent,
  PaginationComponent,
  SearchBarComponent,
  SearchPanelComponent,
  SelectFieldComponent,
  SelectFieldOption,
  SortMenuComponent,
  SortMenuOption,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN, ROW } from './example-styles';

interface Member {
  id: number;
  name: string;
  city: string;
  status: 'active' | 'invited' | 'blocked';
  joined: string;
}

const NAMES = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton', 'Dennis Ritchie',
  'Barbara Liskov', 'Ken Thompson', 'Katherine Johnson', 'Tim Berners-Lee', 'Frances Allen', 'Donald Knuth'];
const CITIES = ['London', 'Berlin', 'Warsaw', 'Lisbon', 'Prague', 'Vilnius'];
const STATUSES: Member['status'][] = ['active', 'active', 'invited', 'active', 'blocked'];

/** 48 members, the same on every visit. */
const MEMBERS: Member[] = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ''),
  city: CITIES[(i * 7) % CITIES.length],
  status: STATUSES[(i * 3) % STATUSES.length],
  joined: new Date(Date.UTC(2026, 0, 1 + i * 5)).toISOString().slice(0, 10),
}));

const dataGrid = `
<fy-data-grid class="grid" label="Members" [columns]="columns" [rows]="rows()" [trackBy]="byId"
  [(sort)]="sort" [(page)]="page" [(pageSize)]="pageSize" [total]="found().length" [pageSizeOptions]="[5, 10, 20]">
  <span dataGridSummary>{{ found().length }} members</span>
  <fy-search-panel fyDataGridSearch placeholder="Name or city" [(query)]="query">
    <fy-select-field label="Status" [options]="statuses" [(value)]="status" />
  </fy-search-panel>
  <ng-template fyDataGridCell="status" let-member>
    <span class="status" [attr.data-status]="member.status">{{ member.status }}</span>
  </ng-template>
  <fy-empty-state dataGridEmpty icon="bi bi-search" label="Nobody found" />
</fy-data-grid>
`;

const dataGridCode = `${dataGrid}
// component: the grid shows one page; the page, the sort and the query are yours
protected readonly columns: DataGridColumn<Member>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'city', label: 'City', sortable: true, width: '120px' },
  { id: 'status', label: 'Status', width: '110px' },
  { id: 'joined', label: 'Joined', sortable: true, width: '120px',
    sortLabels: { asc: 'Oldest first', desc: 'Newest first' } },
];
protected readonly sort = signal<DataGridSort | null>({ column: 'joined', direction: 'desc' });
protected readonly page = signal(1);
protected readonly pageSize = signal(5);
protected readonly rows = computed(() => {
  const from = (this.page() - 1) * this.pageSize();
  return this.found().slice(from, from + this.pageSize()); // or ask a server for the page
});`;

@Component({
  selector: 'docs-data-grid',
  imports: [DATA_GRID, SearchPanelComponent, SelectFieldComponent, EmptyStateComponent],
  template: dataGrid,
  styles: `
    .grid { height: 520px; }
    .status { padding: 2px 8px; border-radius: var(--fy-radius-full); background: var(--fy-tertiary-background); font-size: var(--fy-font-size-s); }
    .status[data-status='active'] { color: var(--fy-success); }
    .status[data-status='blocked'] { color: var(--fy-danger); }
  `,
})
class DataGridExample {
  protected readonly columns: DataGridColumn<Member>[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'city', label: 'City', sortable: true, width: '120px' },
    { id: 'status', label: 'Status', width: '110px' },
    { id: 'joined', label: 'Joined', sortable: true, width: '120px', sortLabels: { asc: 'Oldest first', desc: 'Newest first' } },
  ];
  protected readonly statuses: SelectFieldOption[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'invited', label: 'Invited' },
    { value: 'blocked', label: 'Blocked' },
  ];
  protected readonly byId = (member: Member) => member.id;

  protected readonly sort = signal<DataGridSort | null>({ column: 'joined', direction: 'desc' });
  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly query = signal('');
  protected readonly status = signal<string | null>('all');

  protected readonly found = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    const sort = this.sort();
    const found = MEMBERS.filter(member =>
      (!query || member.name.toLowerCase().includes(query) || member.city.toLowerCase().includes(query)) &&
      (!status || status === 'all' || member.status === status));
    if (!sort) return found;
    const key = sort.column as keyof Member;
    const sign = sort.direction === 'asc' ? 1 : -1;
    return [...found].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * sign);
  });

  protected readonly rows = computed(() => {
    const pages = Math.max(1, Math.ceil(this.found().length / this.pageSize()));
    const from = (Math.min(this.page(), pages) - 1) * this.pageSize();
    return this.found().slice(from, from + this.pageSize());
  });
}

const dataGridActions = `
<fy-data-grid class="grid" label="Cities" [columns]="columns" [rows]="cities()" [trackBy]="byName"
  [pageSizeOptions]="[]" [total]="cities().length"
  (add)="add()" (edit)="last.set('Edit ' + $event.name)" (remove)="remove($event)" (view)="last.set('View ' + $event.name)" />
<p>Last action: {{ last() }}</p>
`;

@Component({
  selector: 'docs-data-grid-actions',
  imports: [DATA_GRID],
  template: dataGridActions,
  styles: `.grid { height: 380px; } p { margin: 12px 0 0; }`,
})
class DataGridActionsExample {
  protected readonly columns: DataGridColumn<{ name: string; country: string }>[] = [
    { id: 'name', label: 'City' },
    { id: 'country', label: 'Country' },
  ];
  protected readonly byName = (city: { name: string }) => city.name;
  protected readonly cities = signal([
    { name: 'London', country: 'United Kingdom' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Warsaw', country: 'Poland' },
    { name: 'Lisbon', country: 'Portugal' },
  ]);
  protected readonly last = signal('—');
  private added = 0;

  protected add(): void {
    this.added++;
    this.cities.update(cities => [...cities, { name: `New city ${this.added}`, country: '—' }]);
    this.last.set('Add');
  }

  protected remove(rows: readonly { name: string }[]): void {
    const names = new Set(rows.map(row => row.name));
    this.cities.update(cities => cities.filter(city => !names.has(city.name)));
    this.last.set(`Delete ${rows.length}`);
  }
}

const searchPanel = `
<fy-search-panel placeholder="Search wishes" [(query)]="query" (filtersReset)="resets.set(resets() + 1)">
  <fy-select-field label="Price" [options]="prices" [(value)]="price" />
  <fy-select-field label="Booked" [options]="booked" [(value)]="bookedBy" />
</fy-search-panel>
<p>Query: “{{ query() }}”, price: {{ price() }}, booked: {{ bookedBy() }}, resets: {{ resets() }}</p>
`;

@Component({ selector: 'docs-search-panel', imports: [SearchPanelComponent, SelectFieldComponent], template: searchPanel, host: COLUMN })
class SearchPanelExample {
  protected readonly query = signal('');
  protected readonly prices: SelectFieldOption[] = [
    { value: 'any', label: 'Any price' },
    { value: 'cheap', label: 'Up to 50' },
    { value: 'dear', label: 'Over 50' },
  ];
  protected readonly booked: SelectFieldOption[] = [
    { value: 'any', label: 'Anyone' },
    { value: 'free', label: 'Not booked' },
    { value: 'taken', label: 'Booked' },
  ];
  protected readonly price = signal<string | null>('any');
  protected readonly bookedBy = signal<string | null>('any');
  protected readonly resets = signal(0);
}

const searchBar = `
<fy-search-bar placeholder="Search friends" [(value)]="query" />
<fy-search-bar placeholder="No delay, no icon" icon="" [debounce]="0" [(value)]="instant" />
<p>Debounced: “{{ query() }}”, instant: “{{ instant() }}”</p>
`;

@Component({ selector: 'docs-search-bar', imports: [SearchBarComponent], template: searchBar, host: COLUMN })
class SearchBarExample {
  protected readonly query = signal('');
  protected readonly instant = signal('');
}

const pagination = `
<fy-pagination [(page)]="page" [pageCount]="20" />
<fy-pagination [(page)]="page" [pageCount]="20" [siblings]="2" label="Pages, two on each side" />
<p>Page {{ page() }} of 20</p>
`;

@Component({ selector: 'docs-pagination', imports: [PaginationComponent], template: pagination, host: COLUMN })
class PaginationExample {
  protected readonly page = signal(7);
}

const sortMenu = `
<fy-sort-menu [options]="sorts" [(value)]="sort" />
<span>Sorted by: {{ sort() ?? 'the first option' }}</span>
`;

@Component({ selector: 'docs-sort-menu', imports: [SortMenuComponent], template: sortMenu, host: ROW })
class SortMenuExample {
  protected readonly sorts: SortMenuOption[] = [
    { id: 'newest', label: 'Newest first' },
    { id: 'oldest', label: 'Oldest first' },
    { id: 'price', label: 'Cheapest first' },
  ];
  protected readonly sort = signal<string | null>(null);
}

const filterToggle = `
<button fyFilterToggle type="button" aria-label="Filters" (click)="count.set((count() + 1) % 4)"></button>
<button fyFilterToggle type="button" [count]="count()" [attr.aria-label]="'Filters: ' + count()"
  (click)="count.set((count() + 1) % 4)"></button>
<button fyFilterToggle type="button" icon="bi bi-sliders" [count]="2" aria-label="Settings: 2"></button>
<span>Click a toggle to count up</span>
`;

@Component({ selector: 'docs-filter-toggle', imports: [FilterToggleComponent], template: filterToggle, host: ROW })
class FilterToggleExample {
  protected readonly count = signal(1);
}

/** Labels of the grid and the search come from the UI labels; this note says so once. */
const LABELS_NOTE = 'Each text not given comes from the UI labels (provideFyLabels).';

export const DATA_DOCS: ComponentDoc[] = [
  {
    slug: 'data-grid',
    title: 'Data grid',
    group: 'Data',
    summary: 'A table of one page of rows with sortable columns, a search, a page size picker and pages; it turns into cards when narrow.',
    imports: `import { DATA_GRID, DataGridColumn, DataGridSort } from '@freely-ui/angular';`,
    selectors: ['fy-data-grid', 'ng-template[fyDataGridCell]', '[fyDataGridSearch]', '[dataGridSummary]', '[dataGridEmpty]'],
    examples: [{
      title: 'Search, filter, sort and pages',
      description: 'The grid only presents: it gets the rows of the current page and reports the sort, the page and the page size, so all of it can be done by a server. Narrow the window to see the rows turn into cards and the search and the sort hide behind buttons.',
      component: DataGridExample,
      code: dataGridCode,
    }, {
      title: 'Add, edit, delete and view',
      description: 'An action is offered only when its event is listened to. Listening to edit or remove puts a checkbox in every row; the form and the confirmation stay yours. An empty pageSizeOptions hides the size picker.',
      component: DataGridActionsExample,
      code: dataGridActions,
    }],
    inputs: [
      { name: 'columns', type: 'DataGridColumn<T>[]', description: 'Required. { id, label, sortable?, sortLabels?, width?, value? } for each column.' },
      { name: 'rows', type: 'T[]', description: 'Required. The rows of the current page.' },
      { name: 'trackBy', type: '(row: T) => unknown', default: 'row => row', description: 'Identity of a row; keeps the check marks across reloads.' },
      { name: 'sort', type: 'DataGridSort | null', default: 'null', description: 'The order, { column, direction }, also as [(sort)].' },
      { name: 'page', type: 'number', default: '1', description: 'The current page, 1-based, also as [(page)].' },
      { name: 'pageSize', type: 'number', default: '20', description: 'Rows per page, also as [(pageSize)]; picking another size returns to page 1.' },
      { name: 'pageSizeOptions', type: 'number[]', default: '[10, 20, 50, 100]', description: 'Sizes in the picker; an empty list hides it.' },
      { name: 'total', type: 'number | null', default: 'null', description: 'Rows on all pages; gives the "1–20 of 64" range and the page count.' },
      { name: 'pageCount', type: 'number | null', default: 'null', description: 'Page count when the total is not known.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Skeleton rows before the first page, dimmed rows during a reload.' },
      { name: 'skeletonRows', type: 'number', default: '5', description: 'How many skeleton rows to show.' },
      { name: 'label', type: 'string', default: "''", description: 'Name of the table.' },
      { name: 'sortLabel, searchLabel, pageSizeLabel, pageSizeShortLabel', type: 'string', description: `Texts of the narrow toolbar and the size picker. ${LABELS_NOTE}` },
      { name: 'paginationLabel, previousLabel, nextLabel', type: 'string', description: `Texts of the pages. ${LABELS_NOTE}` },
      { name: 'viewLabel, addLabel, editLabel, removeLabel, actionsLabel', type: 'string', description: `Texts of the action buttons. ${LABELS_NOTE}` },
      { name: 'selectAllLabel, clearSelectionLabel, selectRowLabel', type: 'string', description: `Texts of the checkboxes. ${LABELS_NOTE}` },
    ],
    outputs: [
      { name: 'add', type: 'void', description: 'The Add button was pressed; listening shows the button.' },
      { name: 'edit', type: 'T', description: 'The row to edit: the one checked, or the one whose button was pressed.' },
      { name: 'remove', type: 'T[]', description: 'The rows to delete: the checked ones, or the one whose button was pressed.' },
      { name: 'view', type: 'T', description: 'The row whose view button was pressed, e.g. to open the whole record.' },
    ],
    cssVars: [
      { name: '--fy-data-grid-gap', default: '14px', description: 'Space between the toolbar, the table and the footer.' },
      { name: '--fy-data-grid-font-size', default: 'var(--fy-font-size-m)', description: 'Size of the cells.' },
      { name: '--fy-data-grid-radius', default: 'var(--fy-radius-md)', description: 'Corner radius of the table.' },
      { name: '--fy-data-grid-border-color', default: 'var(--fy-tertiary-background)', description: 'Lines between the rows.' },
      { name: '--fy-data-grid-row-background', default: 'var(--fy-secondary-background)', description: 'Fill of a row card when narrow.' },
      { name: '--fy-data-grid-row-selected-background', description: 'Fill of a checked row.' },
      { name: '--fy-data-grid-row-radius', default: '16px', description: 'Corner radius of a row card when narrow.' },
      { name: '--fy-data-grid-label-width', default: '88px', description: 'Width of the labels in a row card when narrow.' },
      { name: '--fy-data-grid-action-height', default: '36px', description: 'Height of the toolbar buttons.' },
      { name: '--fy-data-grid-action-radius', default: 'var(--fy-radius-md)', description: 'Corner radius of the toolbar buttons.' },
    ],
    accessibility: [
      'role="table" with rows, column headers and cells; a sortable header is a button and carries aria-sort.',
      'aria-busy while loading; the row count and the "Selected 2 of 20" summary are read by a polite live region.',
      'Every checkbox and icon button is named by the labels above; checked rows carry aria-selected.',
      'Only the rows scroll: give the grid a bounded height, e.g. as a flex child with min-height: 0.',
    ],
  },
  {
    slug: 'filter-toggle',
    title: 'Filter toggle',
    group: 'Data',
    summary: 'A round icon button that opens filters, with a badge of how many are in effect.',
    imports: `import { FilterToggleComponent } from '@freely-ui/angular';`,
    selectors: ['button[fyFilterToggle]'],
    examples: [{
      title: 'Idle, counting and with an icon of its own',
      description: 'Sized to sit at the end of a search bar, marked searchBarTrailing; the search panel uses it that way. The type, the name, aria-expanded and the click are yours.',
      component: FilterToggleExample,
      code: filterToggle,
    }],
    inputs: [
      { name: 'count', type: 'number', default: '0', description: 'Filters in effect; above zero it shows the badge and colours the icon.' },
      { name: 'icon', type: 'string', description: 'Icon class; filters of the icons by default.' },
    ],
    cssVars: [
      { name: '--fy-filter-toggle-size', default: '30px', description: 'Size of the button.' },
      { name: '--fy-filter-toggle-color', default: 'inherit', description: 'Colour of the icon.' },
      { name: '--fy-filter-toggle-accent', default: 'currentColor', description: 'Colour of the icon and the badge while active.' },
      { name: '--fy-filter-toggle-badge-color', default: 'var(--fy-on-accent)', description: 'Text of the badge.' },
      { name: '--fy-filter-toggle-idle-opacity', default: '0.6', description: 'Opacity of the icon while nothing is in effect.' },
      { name: '--fy-filter-toggle-hover-bg', description: 'Fill on hover.' },
    ],
    accessibility: ['The badge is hidden from screen readers: put the count into the aria-label, e.g. "Filters: 2".'],
  },
  {
    slug: 'pagination',
    title: 'Pagination',
    group: 'Data',
    summary: 'Arrows and numbered pages, the first and the last always shown and the gaps as an ellipsis.',
    imports: `import { PaginationComponent } from '@freely-ui/angular';`,
    selectors: ['fy-pagination'],
    examples: [{
      title: 'Twenty pages',
      description: 'Pages are 1-based; a single page still shows, with both arrows disabled.',
      component: PaginationExample,
      code: pagination,
    }],
    inputs: [
      { name: 'page', type: 'number', default: '1', description: 'The current page, also as [(page)].' },
      { name: 'pageCount', type: 'number', description: 'Required. How many pages there are.' },
      { name: 'siblings', type: 'number', default: '1', description: 'Pages shown on each side of the current one.' },
      { name: 'label', type: 'string', description: 'Name of the navigation; pagination of the UI labels by default.' },
      { name: 'previousLabel', type: 'string', description: 'Name of the left arrow; previousPage of the UI labels by default.' },
      { name: 'nextLabel', type: 'string', description: 'Name of the right arrow; nextPage of the UI labels by default.' },
    ],
    cssVars: [
      { name: '--fy-pagination-size', default: '32px', description: 'Size of a page button.' },
      { name: '--fy-pagination-gap', default: 'var(--fy-space-xs)', description: 'Space between the buttons.' },
      { name: '--fy-pagination-background', default: 'var(--fy-secondary-background)', description: 'Fill of a page button.' },
      { name: '--fy-pagination-color', default: 'var(--fy-primary-text)', description: 'Text of a page button.' },
      { name: '--fy-pagination-current-background', default: 'var(--fy-primary-text)', description: 'Fill of the current page.' },
      { name: '--fy-pagination-current-color', default: 'var(--fy-primary-background)', description: 'Text of the current page.' },
    ],
    accessibility: [
      'A nav landmark named by label; the current page carries aria-current="page".',
      'The arrows are named by their labels; the ellipsis is hidden from screen readers.',
    ],
  },
  {
    slug: 'search-bar',
    title: 'Search bar',
    group: 'Data',
    summary: 'A search field with an icon and a clear button; typing is debounced, clearing is not.',
    imports: `import { SearchBarComponent } from '@freely-ui/angular';`,
    selectors: ['fy-search-bar'],
    examples: [{
      title: 'Debounced and instant',
      description: 'Bind it with [(value)], ngModel or a form control. Anything marked searchBarTrailing goes after the clear button.',
      component: SearchBarExample,
      code: searchBar,
    }],
    inputs: [
      { name: 'value', type: 'string', default: "''", description: 'The query, also as [(value)]; written debounce ms after typing stops.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder, and the name when there is no ariaLabel.' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the input.' },
      { name: 'clearLabel', type: 'string', description: 'Name of the clear button; clear of the UI labels by default.' },
      { name: 'icon', type: 'string', description: 'Leading icon class; search of the icons by default, empty hides it.' },
      { name: 'debounce', type: 'number', default: '150', description: 'Delay in ms; 0 writes every keystroke.' },
    ],
    cssVars: [
      { name: '--fy-search-bar-height', default: '40px', description: 'Height of the field.' },
      { name: '--fy-search-bar-bg', description: 'Fill of the field.' },
      { name: '--fy-search-bar-border-color', description: 'Border of the field.' },
      { name: '--fy-search-bar-radius', default: '9999px', description: 'Corner radius.' },
      { name: '--fy-search-bar-font-size', default: '15px', description: 'Size of the text.' },
      { name: '--fy-search-bar-padding-x', default: '14px', description: 'Space at the sides.' },
      { name: '--fy-search-bar-icon-size', default: '16px', description: 'Size of the leading icon.' },
      { name: '--fy-search-bar-focus-color', default: 'currentColor', description: 'Colour of the focus ring.' },
      { name: '--fy-search-bar-placeholder-opacity', default: '0.6', description: 'Opacity of the placeholder.' },
    ],
    accessibility: ['The input is named by ariaLabel or the placeholder; the clear button is named by clearLabel and returns the focus to the input.'],
  },
  {
    slug: 'search-panel',
    title: 'Search panel',
    group: 'Data',
    summary: 'A search field with filters: select fields put inside open from a toggle that counts the ones in effect.',
    imports: `import { SearchPanelComponent, SelectFieldComponent } from '@freely-ui/angular';`,
    selectors: ['fy-search-panel'],
    examples: [{
      title: 'Search with two filters',
      description: 'A filter is in effect when it differs from its first option; the reset button returns all of them to it. Without select fields inside it is a plain search field.',
      component: SearchPanelExample,
      code: searchPanel,
    }],
    inputs: [
      { name: 'query', type: 'string', default: "''", description: 'The query, also as [(query)]; debounced like the search bar.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Placeholder of the field.' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the input; the placeholder by default.' },
      { name: 'clearLabel', type: 'string', description: 'Name of the clear button; clear of the UI labels by default.' },
      { name: 'debounce', type: 'number', default: '150', description: 'Delay in ms before a typed query is written.' },
      { name: 'width', type: 'string', default: "'320px'", description: 'Width of the field, never wider than its container.' },
      { name: 'filtersLabel', type: 'string', description: 'Name of the toggle and the panel; filters of the UI labels by default.' },
      { name: 'resetLabel', type: 'string', description: 'Text of the reset button; resetFilters of the UI labels by default.' },
      { name: 'filtersIcon', type: 'string', description: 'Icon of the toggle; filters of the icons by default.' },
      { name: 'activeFilters', type: 'number', description: 'Count on the toggle; counted from the select fields when not given.' },
    ],
    outputs: [{ name: 'filtersReset', type: 'void', description: 'The reset button returned the filters to their first options.' }],
    cssVars: [
      { name: '--fy-search-panel-width', description: 'Overrides width, e.g. to stretch the field on a phone.' },
      { name: '--fy-search-panel-panel-width', default: '280px', description: 'Width of the filters panel.' },
      { name: '--fy-search-panel-bg', default: 'var(--fy-secondary-background)', description: 'Fill of the panel.' },
      { name: '--fy-search-panel-border-color', description: 'Border of the panel.' },
      { name: '--fy-search-panel-radius', default: '18px', description: 'Corner radius of the panel.' },
      { name: '--fy-search-panel-shadow', default: 'var(--fy-shadow-m)', description: 'Shadow of the panel.' },
      { name: '--fy-search-panel-accent', default: 'currentColor', description: 'Colour of the toggle while filters are in effect.' },
      { name: '--fy-search-panel-z-index', default: 'var(--fy-z-popover)', description: 'Layer of the panel.' },
    ],
    accessibility: [
      'The toggle has aria-haspopup="dialog", aria-expanded and aria-controls; its name carries the count, e.g. "Filters: 2".',
      'Opening the panel moves the focus into it; Escape closes it and returns the focus to the toggle, a click outside closes it.',
      'Inside a data grid, mark it fyDataGridSearch: when narrow it hides behind a search button with a dot while a query or a filter is in effect.',
    ],
  },
  {
    slug: 'sort-menu',
    title: 'Sort menu',
    group: 'Data',
    summary: 'A text button showing the order in effect that opens a menu of all the orders.',
    imports: `import { SortMenuComponent, SortMenuOption } from '@freely-ui/angular';`,
    selectors: ['fy-sort-menu'],
    examples: [{
      title: 'Orders of a list',
      description: 'The first option is the default: a null value, or one missing from the options, means it.',
      component: SortMenuExample,
      code: sortMenu,
    }],
    inputs: [
      { name: 'options', type: 'SortMenuOption[]', default: '[]', description: 'The orders, as { id, label }.' },
      { name: 'value', type: 'string | null', default: 'null', description: 'Id of the order picked, also as [(value)].' },
      { name: 'label', type: 'string', description: 'Name of the button and the menu; sort of the UI labels by default.' },
      { name: 'icon', type: 'string', description: 'Icon after the label; sort of the icons by default.' },
    ],
    cssVars: [
      { name: '--fy-sort-menu-font-size', default: '12px', description: 'Size of the label.' },
      { name: '--fy-sort-menu-icon-size', default: '12px', description: 'Size of the icon.' },
      { name: '--fy-sort-menu-accent', default: 'currentColor', description: 'Colour of the button.' },
    ],
    accessibility: ['The button is named like "Sort: Newest first"; the menu is the dropdown menu, with the order in effect checked.'],
  },
];
