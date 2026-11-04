import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, Type } from '@angular/core';
import { LOADER_INDICATOR } from './loader.config';
import { FY_LABELS } from '../../providers/fy-labels';

/**
 * The app's loading indicator. What it draws is swappable: a plain ring by default,
 * the component registered with `provideLoaderIndicator()` when there is one, or the
 * one passed as `indicator` for a single place.
 *
 * Accessibility (`role="status"` and the label) lives here, so indicators stay purely visual.
 *
 * ```html
 * <fy-loader />
 * <button disabled><fy-loader [size]="22" /> Saving…</button>
 * <fy-loader [indicator]="SomeOtherLoaderComponent" />
 * ```
 */
@Component({
  selector: 'fy-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'accessibleLabel() ? "status" : null',
    '[attr.aria-label]': 'accessibleLabel() || null',
    '[attr.aria-hidden]': 'accessibleLabel() ? null : "true"',
    '[style.font-size.px]': 'size()',
  },
})
export class LoaderComponent {
  /** Font size in px the indicator is derived from; inherits the surrounding font size when omitted. */
  readonly size = input<number | null>(null);

  /** Accessible name announced by screen readers, a generic one when omitted. Pass `null` when the loader is purely decorative. */
  readonly label = input<string | null>();

  /** Indicator for this loader only, instead of the configured one. */
  readonly indicator = input<Type<unknown> | null>(null);

  private readonly configured = inject(LOADER_INDICATOR, { optional: true });

  private readonly labels = inject(FY_LABELS);
  protected readonly accessibleLabel = computed(() => this.label() === undefined ? this.labels().loading : this.label());

  protected readonly component = computed(() => this.indicator() ?? this.configured?.component ?? null);
  protected readonly inputs = computed(() => this.indicator() ? undefined : this.configured?.inputs);
}
