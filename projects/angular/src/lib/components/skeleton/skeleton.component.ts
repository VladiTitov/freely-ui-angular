import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** `line` — a rounded bar, `circle` — an avatar or an icon, `pill` — a button. */
export type SkeletonShape = 'line' | 'circle' | 'pill';

/**
 * A pulsing placeholder for content that is still loading. Size it with `width` / `height` (a number is px)
 * or with a class of the page; it is hidden from assistive tech, so say "loading" on the container.
 *
 * ```html
 * <div aria-busy="true" aria-label="Loading">
 *   <fy-skeleton shape="circle" [width]="48" [height]="48" />
 *   <fy-skeleton width="60%" [height]="14" />
 * </div>
 * ```
 *
 * Styled by `base.css` (`.fy-skeleton`), so it pulses together with the page's own skeletons.
 */
@Component({
  selector: 'fy-skeleton',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-skeleton',
    'aria-hidden': 'true',
    '[class.fy-skeleton--circle]': 'shape() === "circle"',
    '[class.fy-skeleton--pill]': 'shape() === "pill"',
    '[style.width]': 'cssWidth()',
    '[style.height]': 'cssHeight()',
  },
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('line');
  readonly width = input<number | string>();
  readonly height = input<number | string>();

  protected readonly cssWidth = computed(() => toCss(this.width()));
  protected readonly cssHeight = computed(() => toCss(this.height()));
}

function toCss(size: number | string | undefined): string | null {
  if (size === undefined || size === '') return null;
  return typeof size === 'number' ? `${size}px` : size;
}
