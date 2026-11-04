import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FY_ICONS } from '../../providers/fy-icons';

/** What the badge reports: good news, bad news, or nothing to note. */
export type BadgeTone = 'success' | 'danger' | 'neutral';

/** `s` — inside a line of text, `m` — next to a large figure. */
export type BadgeSize = 's' | 'm';

/**
 * A short count or change on a pill tinted by its own colour.
 *
 * ```html
 * <fy-badge tone="success" direction="up" size="m">2,67%</fy-badge>
 * <fy-badge tone="danger" direction="down">1</fy-badge>
 * <fy-badge color="#ef9f27" title="Warnings">+118</fy-badge>
 * ```
 *
 * `direction` adds an arrow in front of the text; `color` sets any CSS colour, a custom property included,
 * and wins over `tone`. Text on a coloured pill needs a word next to it or an `aria-label`:
 * the colour alone does not say what the number is.
 */
@Component({
  selector: 'fy-badge',
  template: `
    @if (direction() === 'up') {
      <i [class]="icons.trendUp" aria-hidden="true"></i>
    } @else if (direction() === 'down') {
      <i [class]="icons.trendDown" aria-hidden="true"></i>
    }
    <ng-content />
  `,
  styleUrls: ['./badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-tone]': 'tone()',
    '[class.fy-badge--m]': 'size() === "m"',
    '[style.--fy-badge-color]': 'color() ?? null'
  }
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly size = input<BadgeSize>('s');
  readonly direction = input<'up' | 'down' | null>(null);
  readonly color = input<string | null>(null);

  protected readonly icons = inject(FY_ICONS);
}
