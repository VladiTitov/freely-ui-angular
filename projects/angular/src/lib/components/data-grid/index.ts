import { DataGridComponent } from './data-grid.component';
import { DataGridCell, DataGridSearch } from './data-grid.directives';

export { DataGridComponent } from './data-grid.component';
export { DataGridCell, DataGridSearch } from './data-grid.directives';
export * from './data-grid.types';

export const DATA_GRID = [DataGridComponent, DataGridCell, DataGridSearch] as const;
