import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  Output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DROPDOWN_MENU } from '../dropdown-menu';
import { PaginationComponent } from '../pagination/pagination.component';
import { SelectFieldComponent, SelectFieldOption } from '../select-field/select-field.component';
import { SortMenuOption } from '../sort-menu/sort-menu.component';
import { DataGridCell, DataGridSearch } from './data-grid.directives';
import { DataGridColumn, DataGridSort, DataGridSortDirection } from './data-grid.types';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/**
 * Table of rows with sortable columns and numbered pages. It only presents: the
 * rows of the current page, the sort, the page and its size come from the
 * caller, which reloads the data when they change — so all of it can be done by
 * a server.
 *
 * Above the table sit the caller's `dataGridSummary` (e.g. a row count) and
 * `fyDataGridSearch` (e.g. a `<fy-search-panel>`); below it the page size picker, the
 * range of shown rows and the pages. Only the rows scroll: give the grid a
 * bounded height (e.g. as a flex child with `min-height: 0`) and the header and
 * the footer stay in place.
 *
 * A column is ordered by a click on its header when it is `sortable`; a second
 * click flips the direction. In a narrow container every row turns into a card
 * of "label — value" lines, and the actions, the search and the sort share one
 * row of icon buttons: the search button opens the search under that row, the
 * sort button a menu of the orders.
 *
 * Add, edit and delete are opt-in: the toolbar button of an action shows only
 * when the caller listens to its event (`add`, `edit`, `remove`). Listening to
 * `edit` or `remove` also puts a checkbox in every row and a button for the
 * action at its end; the toolbar's "Edit" works on one checked row, "Delete" on
 * all of them. The grid only reports the rows — the form and the confirmation
 * are the caller's. The check marks belong to the shown page: rows that leave it
 * lose them.
 *
 * Viewing is opt-in the same way: listening to `view` puts a button at the end
 * of every row that reports it, e.g. to open the whole record in a dialog when
 * the cells cut it short. It needs no checkboxes.
 *
 * ```html
 * <fy-data-grid [columns]="columns" [rows]="rows()" [(sort)]="sort" [(page)]="page" [(pageSize)]="pageSize"
 *   [total]="total()" [loading]="loading()">
 *   <span dataGridSummary>{{ total() }} records</span>
 *   <fy-search-panel fyDataGridSearch [(query)]="query" />
 *   <ng-template fyDataGridCell="message" let-row><code>{{ row.message }}</code></ng-template>
 *   <fy-empty-state dataGridEmpty icon="bi bi-search" label="Nothing found" />
 * </fy-data-grid>
 *
 * <fy-data-grid [columns]="columns" [rows]="rows()" (add)="create()" (edit)="open($event)" (remove)="confirm($event)" />
 *
 * <fy-data-grid [columns]="columns" [rows]="rows()" (view)="show($event)" />
 * ```
 *
 * Tune the look with the `--fy-data-grid-*` custom properties.
 */
@Component({
  selector: 'fy-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  imports: [DROPDOWN_MENU, HapticFeedbackDirective, NgTemplateOutlet, PaginationComponent, SelectFieldComponent, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-data-grid',
    '[style.--_data-grid-columns]': 'tracks()',
  },
})
export class DataGridComponent<T> {
  protected readonly HapticImpact = HapticImpact;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly columns = input.required<readonly DataGridColumn<T>[]>();
  /** Rows of the current page. */
  readonly rows = input.required<readonly T[]>();
  /** Identity of a row for change tracking; defaults to the row object itself. */
  readonly trackBy = input<(row: T) => unknown>(row => row);
  readonly sort = model<DataGridSort | null>(null);
  /** 1-based number of the current page. */
  readonly page = model(1);
  /** Rows per page. Picking another size returns to the first page. */
  readonly pageSize = model(20);
  /** Sizes offered in the footer; an empty list hides the picker. */
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 50, 100]);
  /** Rows on all pages; gives the shown range and the page count. `null` while unknown. */
  readonly total = input<number | null>(null);
  /** Page count when `total` is not given. */
  readonly pageCount = input<number | null>(null);
  /** Shows placeholders before the first rows arrive and dims the rows during a reload. */
  readonly loading = input(false);
  /** How many placeholder rows to show while the first page is loading. */
  readonly skeletonRows = input(5);

  /** `aria-label` of the table. */
  readonly label = input('');

  // Texts of the grid itself; each one not given comes from the UI labels (see `FyLabels`),
  // which also give the "1–20 of 64" range and the "Selected 2 of 20" summary.

  /** `aria-label` of the sort menu shown in a narrow container. */
  readonly sortLabel = input<string>();
  /** `aria-label` of the button that shows the search in a narrow container. */
  readonly searchLabel = input<string>();
  /** Caption of the page size picker. */
  readonly pageSizeLabel = input<string>();
  /** Caption of the page size picker in a narrow container, so the picker and the pages share a row. */
  readonly pageSizeShortLabel = input<string>();
  readonly paginationLabel = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();
  readonly viewLabel = input<string>();
  readonly addLabel = input<string>();
  readonly editLabel = input<string>();
  readonly removeLabel = input<string>();
  readonly selectAllLabel = input<string>();
  readonly clearSelectionLabel = input<string>();
  /** `aria-label` of a row's checkbox. */
  readonly selectRowLabel = input<string>();
  /** Caption of the row's buttons in a narrow container. */
  readonly actionsLabel = input<string>();

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);
  protected readonly texts = computed(() => {
    const labels = this.labels();
    return {
      sort: this.sortLabel() ?? labels.sort,
      search: this.searchLabel() ?? labels.search,
      rowsPerPage: this.pageSizeLabel() ?? labels.rowsPerPage,
      rowsPerPageShort: this.pageSizeShortLabel() ?? labels.rowsPerPageShort,
      pagination: this.paginationLabel() ?? labels.pagination,
      previousPage: this.previousLabel() ?? labels.previousPage,
      nextPage: this.nextLabel() ?? labels.nextPage,
      view: this.viewLabel() ?? labels.view,
      add: this.addLabel() ?? labels.add,
      edit: this.editLabel() ?? labels.edit,
      remove: this.removeLabel() ?? labels.delete,
      selectAll: this.selectAllLabel() ?? labels.selectAll,
      clearSelection: this.clearSelectionLabel() ?? labels.clearSelection,
      selectRow: this.selectRowLabel() ?? labels.selectRow,
      actions: this.actionsLabel() ?? labels.actions
    };
  });

  // EventEmitter rather than `output()`: its `observed` tells whether the caller
  // listens, which decides if the action is offered at all.
  /** The row whose view button was pressed. */
  @Output() readonly view = new EventEmitter<T>();
  /** The "Add" button was pressed. */
  @Output() readonly add = new EventEmitter<void>();
  /** The row to edit: the one checked, or the one whose own button was pressed. */
  @Output() readonly edit = new EventEmitter<T>();
  /** The rows to delete: the checked ones, or the one whose own button was pressed. */
  @Output() readonly remove = new EventEmitter<readonly T[]>();

  private readonly cells = contentChildren(DataGridCell);
  private readonly search = contentChild(DataGridSearch);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  protected readonly templates = computed(
    () => new Map(this.cells().map(cell => [cell.column(), cell.template])),
  );
  protected readonly tracks = computed(() => {
    const tracks = this.columns().map(column => column.width ?? 'minmax(0, 1fr)');
    if (this.selectable) tracks.unshift('24px');
    const buttons = this.rowButtons;
    if (buttons) tracks.push(`${buttons * 32 + (buttons - 1) * 4}px`);
    return tracks.join(' ');
  });

  /** Keys (`trackBy`) of the checked rows; a new page keeps only the rows still on it. */
  private readonly checked = linkedSignal<readonly T[], ReadonlySet<unknown>>({
    source: this.rows,
    computation: (rows, previous) => {
      if (!previous?.value.size) return new Set();
      const track = untracked(this.trackBy);
      return new Set(rows.map(track).filter(key => previous.value.has(key)));
    },
  });
  protected readonly selectedRows = computed(() => {
    const checked = this.checked();
    const track = this.trackBy();
    return this.rows().filter(row => checked.has(track(row)));
  });
  protected readonly allSelected = computed(() =>
    this.rows().length > 0 && this.selectedRows().length === this.rows().length,
  );
  /** "Selected 2 of 20" while rows are checked; empty otherwise. */
  protected readonly selectionSummary = computed(() => {
    const count = this.selectedRows().length;
    return count ? this.labels().selectedCount(count, this.rows().length) : '';
  });
  protected readonly hasSearch = computed(() => !!this.search());
  protected readonly searchApplied = computed(() => this.search()?.applied() ?? false);
  /** Whether the search is shown in a narrow container; a wide one always shows it. */
  protected readonly searchOpen = signal(false);
  protected readonly placeholders = computed(() => Array.from({ length: this.skeletonRows() }));

  /** Both orders of every sortable column, as entries of the narrow-grid sort menu. */
  protected readonly sortOptions = computed<SortMenuOption[]>(() =>
    this.columns()
      .filter(column => column.sortable)
      .flatMap(column => (['desc', 'asc'] as const).map(direction => ({
        id: sortId(column.id, direction),
        label: column.sortLabels?.[direction] ?? `${column.label} ${direction === 'asc' ? '↑' : '↓'}`,
      }))),
  );
  /** Id of the order in effect; the first one while the caller has none. */
  protected readonly sortValue = computed(() => {
    const sort = this.sort();
    return sort ? sortId(sort.column, sort.direction) : (this.sortOptions()[0]?.id ?? null);
  });

  protected readonly pageSizeChoices = computed<SelectFieldOption<number>[]>(() =>
    this.pageSizeOptions().map(size => ({ value: size, label: String(size) })),
  );
  protected readonly pages = computed(() => {
    const total = this.total();
    if (total === null) return this.pageCount() ?? 1;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });
  /** "1–20 of 64" for the rows of the current page; empty while the total is unknown or zero. */
  protected readonly range = computed(() => {
    const total = this.total();
    if (!total) return '';
    const from = (this.page() - 1) * this.pageSize() + 1;
    const to = Math.min(total, from + this.rows().length - 1);
    return this.labels().range(from, Math.max(from, to), total);
  });

  constructor() {
    // A new page starts at its first row.
    effect(() => {
      this.rows();
      untracked(() => {
        const body = this.body()?.nativeElement;
        if (body) body.scrollTop = 0;
      });
    });
  }

  protected get canView(): boolean {
    return this.view.observed;
  }

  protected get canAdd(): boolean {
    return this.add.observed;
  }

  protected get canEdit(): boolean {
    return this.edit.observed;
  }

  protected get canRemove(): boolean {
    return this.remove.observed;
  }

  /** Rows get checkboxes once there is something to do with the checked ones. */
  protected get selectable(): boolean {
    return this.canEdit || this.canRemove;
  }

  protected get hasActions(): boolean {
    return this.canAdd || this.selectable;
  }

  /** Whether rows end with a column of their own buttons. */
  protected get hasRowActions(): boolean {
    return this.rowButtons > 0;
  }

  /** How many buttons a row carries at its end. */
  private get rowButtons(): number {
    return Number(this.canView) + Number(this.canEdit) + Number(this.canRemove);
  }

  protected toggleSearch(): void {
    this.searchOpen.update(open => !open);
    if (!this.searchOpen()) return;
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('.fy-data-grid__search input')?.focus(),
      { injector: this.injector },
    );
  }

  protected isSelected(row: T): boolean {
    return this.checked().has(this.trackBy()(row));
  }

  protected toggleRow(row: T): void {
    const key = this.trackBy()(row);
    this.checked.update(checked => {
      const next = new Set(checked);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  protected toggleAll(): void {
    this.checked.set(this.allSelected() ? new Set() : new Set(this.rows().map(this.trackBy())));
  }

  protected editSelected(): void {
    const [row] = this.selectedRows();
    if (this.selectedRows().length === 1) this.edit.emit(row);
  }

  protected removeSelected(): void {
    const rows = this.selectedRows();
    if (rows.length) this.remove.emit(rows);
  }

  protected text(column: DataGridColumn<T>, row: T): string {
    if (column.value) return column.value(row);
    const value = (row as Record<string, unknown>)[column.id];
    return value == null ? '' : String(value);
  }

  protected toggleSort(column: DataGridColumn<T>): void {
    const current = this.sort();
    const flip = current?.column === column.id && current.direction === 'asc';
    this.sort.set({ column: column.id, direction: flip ? 'desc' : 'asc' });
  }

  protected pickSort(id: string | null): void {
    if (!id) return;
    const separator = id.lastIndexOf(':');
    this.sort.set({ column: id.slice(0, separator), direction: id.slice(separator + 1) as DataGridSortDirection });
  }

  protected pickPageSize(size: number | null): void {
    if (size === null || size === this.pageSize()) return;
    this.pageSize.set(size);
    this.page.set(1);
  }

  protected ariaSort(column: DataGridColumn<T>): string | null {
    if (!column.sortable) return null;
    const current = this.sort();
    if (current?.column !== column.id) return 'none';
    return current.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected sortIcon(column: DataGridColumn<T>): string {
    const current = this.sort();
    if (current?.column !== column.id) return this.icons.sort;
    return current.direction === 'asc' ? this.icons.sortAsc : this.icons.sortDesc;
  }
}

function sortId(column: string, direction: DataGridSortDirection): string {
  return `${column}:${direction}`;
}
