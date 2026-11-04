import { computed, Directive, inject, input, TemplateRef } from '@angular/core';
import { SearchPanelComponent } from '../search-panel/search-panel.component';

/**
 * Custom content for the cells of one column of a `<fy-data-grid>`:
 *
 * ```html
 * <ng-template fyDataGridCell="status" let-row>{{ row.status }}</ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[fyDataGridCell]',
})
export class DataGridCell {
  /** Id of the column the template renders. */
  readonly column = input.required<string>({ alias: 'fyDataGridCell' });
  readonly template = inject<TemplateRef<{ $implicit: unknown }>>(TemplateRef);
}

/**
 * The search of a `<fy-data-grid>` (e.g. a `<fy-search-panel>`). In a narrow container
 * it hides behind a toolbar button, which a `<fy-search-panel>` marks with a dot
 * while its query or filters are applied:
 *
 * ```html
 * <fy-search-panel fyDataGridSearch [(query)]="query" />
 * ```
 */
@Directive({
  selector: '[fyDataGridSearch]',
})
export class DataGridSearch {
  private readonly panel = inject(SearchPanelComponent, { self: true, optional: true });

  readonly applied = computed(() => this.panel?.applied() ?? false);
}
