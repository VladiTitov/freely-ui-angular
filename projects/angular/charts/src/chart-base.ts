import {
  afterNextRender,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  Signal,
  signal
} from '@angular/core';
import { niceScale } from './chart-scale';
import { CHART_COLORS, ChartSeries } from './chart.types';

/** Room around the plot for the value labels on the left and the item labels under it. */
export const CHART_MARGIN = { top: 12, right: 12, bottom: 24, left: 40 };
/** Item labels under the plot at most; the last item is always labelled. */
const X_LABELS = 6;
/** Half the readout's width: it stays this far from the chart's edges. */
const READOUT_HALF = 90;

/** One segment of a column: a series' share of an item. */
export interface BarSegment {
  color: string;
  path: string;
}

/** One line with the wash under it and its points. */
export interface LineView {
  id: string;
  color: string;
  line: string;
  area: string;
  points: (readonly [number, number])[];
}

/** A series with its colour settled. */
export interface ChartSeriesView<T> extends ChartSeries<T> {
  color: string;
}

/**
 * What a bar chart and a line chart share: the value axis, the item labels, the legend, and the readout that hover
 * or the arrow keys open for one item.
 */
@Directive({
  host: {
    class: 'fy-chart'
  }
})
export abstract class ChartBase<T> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly defaultLocale = inject(LOCALE_ID);

  /** The items along the horizontal axis, e.g. days. */
  readonly data = input.required<readonly T[]>();
  readonly series = input.required<readonly ChartSeries<T>[]>();
  /** Text under an item, e.g. `07.11`; the item's number when not given. */
  readonly xLabel = input<(item: T, index: number) => string>((_, index) => String(index + 1));
  /** Heading of the readout, e.g. `7 November, Fr`; `xLabel` when not given. */
  readonly readoutTitle = input<(item: T, index: number) => string>();
  /** How a value is written on the axis and in the readout; grouped by `locale` when not given. */
  readonly format = input<(value: number) => string>();
  /** Locale of the default value format; `LOCALE_ID` when not given. */
  readonly locale = input<string>();
  /** Accessible name of the chart. */
  readonly label = input('');
  /** Height of the drawing in px. */
  readonly height = input(200, { transform: numberAttribute });
  /** The legend over the chart; shown for more than one series when not set. */
  readonly legend = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value))
  });

  protected readonly margin = CHART_MARGIN;
  protected readonly width = signal(600);
  /** The item the readout is open for. */
  protected readonly active = signal<number | null>(null);

  protected readonly views = computed<ChartSeriesView<T>[]>(() =>
    this.series().map((item, order) => ({ ...item, color: item.color ?? CHART_COLORS[order % CHART_COLORS.length] }))
  );
  protected readonly showLegend = computed(() => this.legend() ?? this.series().length > 1);

  protected readonly plotWidth = computed(() => Math.max(1, this.width() - CHART_MARGIN.left - CHART_MARGIN.right));
  protected readonly plotHeight = computed(() => Math.max(1, this.height() - CHART_MARGIN.top - CHART_MARGIN.bottom));
  protected readonly baseline = computed(() => CHART_MARGIN.top + this.plotHeight());
  /** Width of one item's slot along the axis. */
  protected readonly slot = computed(() => this.plotWidth() / Math.max(1, this.data().length));

  protected readonly scale = computed(() => niceScale(this.peak(), 4, this.integers()));

  private readonly formatter = computed(() => {
    const own = this.format();
    if (own) return own;
    const number = new Intl.NumberFormat(this.locale() ?? this.defaultLocale);
    return (value: number) => number.format(value);
  });

  /** Which marks the shared template draws. */
  protected abstract readonly kind: 'bars' | 'line';
  /** The tallest value the axis has to reach; a whole stack for stacked columns. */
  protected abstract peak(): number;
  /** Columns of a bar chart, one list of segments per item. */
  protected readonly bars: Signal<BarSegment[][]> = signal([]);
  /** Lines of a line chart. */
  protected readonly lines: Signal<LineView[]> = signal([]);

  /** Center of an item's slot. */
  protected readonly x = (index: number) => CHART_MARGIN.left + this.slot() * index + this.slot() / 2;
  protected readonly y = (value: number) =>
    CHART_MARGIN.top + this.plotHeight() - (value / this.scale().top) * this.plotHeight();
  protected readonly formatValue = (value: number) => this.formatter()(value);

  /** Every series value of every item, read once. */
  protected readonly values = computed(() => {
    const series = this.series();
    return this.data().map((item, index) => series.map(entry => entry.value(item, index)));
  });

  /** A few evenly spread labels, the last item always among them. */
  protected readonly xLabels = computed(() => {
    const data = this.data();
    const label = this.xLabel();
    const every = Math.max(1, Math.ceil(data.length / X_LABELS));
    return data
      .map((item, index) => ({ index, text: label(item, index) }))
      .filter(({ index }) => (data.length - 1 - index) % every === 0);
  });

  protected readonly readout = computed(() => {
    const index = this.active();
    const item = index === null ? undefined : this.data()[index];
    if (item === undefined || index === null) return null;

    const title = (this.readoutTitle() ?? this.xLabel())(item, index);
    const values = this.values()[index];
    return {
      left: Math.min(Math.max(this.x(index), READOUT_HALF), Math.max(this.width() - READOUT_HALF, READOUT_HALF)),
      title,
      rows: this.views().map((series, order) => ({
        id: series.id,
        label: series.label,
        color: series.color,
        value: this.formatValue(values[order])
      }))
    };
  });

  /** Integer ticks unless some value has a fraction. */
  private readonly integers = computed(() => this.values().every(row => row.every(value => Number.isInteger(value))));

  constructor() {
    // Nothing lays the page out in a test or on the server: the chart keeps its default width there.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(([entry]) => this.width.set(Math.round(entry.contentRect.width)));
      afterNextRender(() => observer.observe(this.host));
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const box = (event.currentTarget as Element).getBoundingClientRect();
    const index = Math.floor((event.clientX - box.left - CHART_MARGIN.left) / this.slot());
    this.active.set(Math.min(Math.max(index, 0), this.data().length - 1));
  }

  protected onKey(event: KeyboardEvent): void {
    const last = this.data().length - 1;
    const current = this.active() ?? last;
    const moves: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last };
    if (!(event.key in moves)) {
      if (event.key === 'Escape') this.active.set(null);
      return;
    }
    event.preventDefault();
    this.active.set(Math.min(Math.max(moves[event.key], 0), last));
  }

  protected onFocus(): void {
    if (this.active() === null && this.data().length) this.active.set(this.data().length - 1);
  }
}
