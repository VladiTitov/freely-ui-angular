import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

/**
 * Page switcher: arrows at the edges and numbered pages between them, with the
 * first and the last page always visible and the gaps shown as an ellipsis.
 * Pages are 1-based; a single page still shows, with both arrows disabled.
 *
 * ```html
 * <fy-pagination [(page)]="page" [pageCount]="pageCount()" label="Pages" />
 * ```
 *
 * Tune the look with the `--fy-pagination-*` custom properties.
 */
@Component({
  selector: 'fy-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
  imports: [HapticFeedbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = model(1);
  readonly pageCount = input.required<number>();
  /** How many pages to show on each side of the current one. */
  readonly siblings = input(1);
  /** `aria-label` of the navigation landmark; `pagination` of the UI labels when not given. */
  readonly label = input<string>();
  readonly previousLabel = input<string>();
  readonly nextLabel = input<string>();

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  /** Page numbers to render; `null` stands for a gap. */
  protected readonly items = computed<(number | null)[]>(() => {
    const count = this.pageCount();
    const current = this.page();
    const siblings = this.siblings();
    const items: (number | null)[] = [];

    let previous = 0;
    for (let page = 1; page <= count; page++) {
      if (page !== 1 && page !== count && Math.abs(page - current) > siblings) continue;
      if (page - previous > 1) items.push(null);
      items.push(page);
      previous = page;
    }

    return items;
  });

  protected go(page: number): void {
    if (page >= 1 && page <= this.pageCount() && page !== this.page()) {
      this.page.set(page);
    }
  }
}
