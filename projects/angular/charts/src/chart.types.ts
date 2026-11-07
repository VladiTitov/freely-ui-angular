/**
 * One measure drawn by a chart: a column segment of a bar chart, a line of a line chart.
 * `value` reads it from an item of `data`.
 */
export interface ChartSeries<T = unknown> {
  id: string;
  /** Name in the legend and the readout. */
  label: string;
  /** Any CSS colour, a custom property included; the next of `--fy-chart-1` … `--fy-chart-6` when not given. */
  color?: string;
  value: (item: T, index: number) => number;
}

/** Default colours of the series, in order; each falls back to a theme colour. */
export const CHART_COLORS: readonly string[] = [
  'var(--fy-chart-1, var(--fy-accent))',
  'var(--fy-chart-2, var(--fy-success))',
  'var(--fy-chart-3, var(--fy-warning))',
  'var(--fy-chart-4, var(--fy-info))',
  'var(--fy-chart-5, var(--fy-danger))',
  'var(--fy-chart-6, var(--fy-secondary-text))'
];
