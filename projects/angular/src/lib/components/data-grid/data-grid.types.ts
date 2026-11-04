export type DataGridSortDirection = 'asc' | 'desc';

/** The column a {@link DataGridComponent} is ordered by. */
export interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}

/** One column of a {@link DataGridComponent}. */
export interface DataGridColumn<T = unknown> {
  /** Stable key: names the column in `sort` and in `fyDataGridCell` templates. */
  id: string;
  /** Header text; on a narrow grid it labels the value inside the row card. */
  label: string;
  /** Lets the user order the grid by this column. */
  sortable?: boolean;
  /**
   * Names of the two orders in the sort menu of a narrow grid, e.g.
   * `{ asc: 'Oldest first', desc: 'Newest first' }`. Default to the label with an arrow.
   */
  sortLabels?: { asc: string; desc: string };
  /** CSS grid track of the column, e.g. `140px`. Defaults to an equal share of the free space. */
  width?: string;
  /** Text of a cell; defaults to the row's property named like `id`. A `fyDataGridCell` template wins over it. */
  value?: (row: T) => string;
}
