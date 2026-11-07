import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartBase, LineView } from './chart-base';

/**
 * Lines of values per item, e.g. a total per day, each over a light wash down to the axis. Hover or the arrow
 * keys open a readout with every series of one item.
 *
 * ```html
 * <fy-line-chart label="Users per day" [data]="days" [series]="series" [xLabel]="dayLabel" />
 * ```
 *
 * Import from `@freely-ui/angular/charts`. Tune the look with the `--fy-chart-*` custom properties.
 */
@Component({
  selector: 'fy-line-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent<T = unknown> extends ChartBase<T> {
  /** The wash under each line. */
  readonly area = input(true, { transform: booleanAttribute });

  protected readonly kind: 'bars' | 'line' = 'line';

  private readonly peakValue = computed(() => Math.max(0, ...this.values().flat()));

  protected peak(): number {
    return this.peakValue();
  }

  protected override readonly lines = computed<LineView[]>(() => {
    const rows = this.values();
    const baseline = this.baseline();

    return this.views().map((series, order) => {
      const points = rows.map((row, index) => [this.x(index), this.y(row[order])] as const);
      const line = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x},${y}`).join('');
      const area =
        this.area() && points.length
          ? `${line}L${points[points.length - 1][0]},${baseline}L${points[0][0]},${baseline}Z`
          : '';
      return { id: series.id, color: series.color, line, area, points };
    });
  });
}
