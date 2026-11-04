import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FY_ICONS } from '../../providers/fy-icons';

/**
 * Round icon button that opens filters, with a badge of how many are in effect.
 * Sized to sit at the end of a `<fy-search-bar>`, marked `searchBarTrailing`.
 * The consumer sets `type`, `aria-label`, `aria-expanded` and the click handler.
 *
 * ```html
 * <button fyFilterToggle searchBarTrailing type="button" [count]="active" aria-label="Filters" (click)="open()"></button>
 * ```
 *
 * Self-contained (no app imports). Tune the look with the `--fy-filter-toggle-*` custom properties.
 */
@Component({
  selector: 'button[fyFilterToggle]',
  template: `
    <i [class]="icon() ?? icons.filters" aria-hidden="true"></i>
    @if (count() > 0) {
      <span class="fy-filter-toggle__badge" aria-hidden="true">{{ count() }}</span>
    }
  `,
  styleUrls: ['./filter-toggle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-filter-toggle',
    '[class.fy-filter-toggle--active]': 'active()',
  },
})
export class FilterToggleComponent {
  /** Filters in effect; shown on the badge and colours the icon when above zero. */
  readonly count = input(0);
  /** Icon class; `filters` of the icons when not given. */
  readonly icon = input<string>();

  protected readonly icons = inject(FY_ICONS);

  protected readonly active = computed(() => this.count() > 0);
}
