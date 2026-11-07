import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BarSegment, ChartBase } from './chart-base';

/** Widest column, in px, however much room an item has. */
const MAX_BAR = 24;
/** Room between columns of a group and between stacked segments, in px. */
const GAP = 2;
const RADIUS = 4;

/** A column with the value end rounded and the baseline end square. */
function barPath(x: number, y: number, width: number, height: number, rounded: boolean): string {
  const r = rounded ? Math.min(RADIUS, width / 2, height) : 0;
  return (
    `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}` +
    `Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`
  );
}

/**
 * Columns of values per item, e.g. counts per day: the series stacked in one column, or side by side with
 * `[stacked]="false"`. Hover or the arrow keys open a readout with every series of one item.
 *
 * ```html
 * <fy-bar-chart label="Sign-ups per day" [data]="days" [series]="series" [xLabel]="dayLabel" />
 * ```
 *
 * ```ts
 * series: ChartSeries<Day>[] = [
 *   { id: 'new', label: 'New', value: day => day.registered },
 *   { id: 'back', label: 'Returning', value: day => day.returning }
 * ];
 * dayLabel = (day: Day) => formatDate(day.date, 'dd.MM', 'en');
 * ```
 *
 * Import from `@freely-ui/angular/charts`. Tune the look with the `--fy-chart-*` custom properties.
 */
@Component({
  selector: 'fy-bar-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent<T = unknown> extends ChartBase<T> {
  /** Stacks the series in one column; side by side when false. */
  readonly stacked = input(true, { transform: booleanAttribute });

  protected readonly kind: 'bars' | 'line' = 'bars';

  private readonly peakValue = computed(() => {
    const rows = this.values();
    const sums = rows.map(row =>
      this.stacked() ? row.reduce((sum, value) => sum + Math.max(value, 0), 0) : Math.max(0, ...row)
    );
    return Math.max(0, ...sums);
  });

  protected peak(): number {
    return this.peakValue();
  }

  protected override readonly bars = computed<BarSegment[][]>(() => {
    const views = this.views();
    const slot = this.slot();
    const stacked = this.stacked();
    const count = Math.max(1, views.length);

    return this.values().map((row, index) => {
      const center = this.x(index);

      if (!stacked) {
        const group = Math.max(2 * count, Math.min(MAX_BAR * count, slot - GAP));
        const width = Math.max(1, (group - GAP * (count - 1)) / count);
        return row.flatMap((value, order) => {
          if (value <= 0) return [];
          const y = this.y(value);
          const left = center - group / 2 + order * (width + GAP);
          return [{ color: views[order].color, path: barPath(left, y, width, this.y(0) - y, true) }];
        });
      }

      const width = Math.max(2, Math.min(MAX_BAR, slot - GAP));
      const left = center - width / 2;
      // The topmost non-empty segment gets the rounded end.
      const last = row.reduce((found, value, order) => (value > 0 ? order : found), -1);
      let bottom = 0;

      return row.flatMap((value, order) => {
        if (value <= 0) return [];
        const y = this.y(bottom + value);
        // A segment above another gives up its lowest pixels to the gap between them.
        const height = this.y(bottom) - y - (bottom > 0 ? GAP : 0);
        bottom += value;
        return height > 0 ? [{ color: views[order].color, path: barPath(left, y, width, height, order === last) }] : [];
      });
    });
  });
}
