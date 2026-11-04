import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A progress bar: `role="progressbar"` with the value, its range and, when given, a spoken text.
 *
 * ```html
 * <fy-progress [value]="7" [max]="10" label="Wishes to the next level" valueText="7 of 10" />
 * ```
 *
 * A value outside the range is drawn at its end. Tune the look with the `--fy-progress-*` custom properties,
 * e.g. `--fy-progress-color` for the fill.
 */
@Component({
  selector: 'fy-progress',
  template: '<span class="fy-progress__fill" [style.width.%]="percent()"></span>',
  styleUrls: ['./progress.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-progress',
    role: 'progressbar',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-valuetext]': 'valueText() || null',
    '[attr.aria-label]': 'label() || null',
  },
})
export class ProgressComponent {
  readonly value = input(0);
  readonly min = input(0);
  readonly max = input(100);
  /** What the bar measures, for assistive tech. */
  readonly label = input<string>();
  /** The value as it should be spoken, e.g. "7 of 10"; the number when not given. */
  readonly valueText = input<string>();

  protected readonly clamped = computed(() => Math.min(Math.max(this.value(), this.min()), this.max()));
  protected readonly percent = computed(() => {
    const range = this.max() - this.min();
    return range > 0 ? ((this.clamped() - this.min()) / range) * 100 : 0;
  });
}
