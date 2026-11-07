import { Component, signal } from '@angular/core';
import { BarChartComponent, ChartSeries, LineChartComponent } from '@freely-ui/angular/charts';
import { ComponentDoc } from './doc.model';

interface Day {
  date: Date;
  registered: number;
  returning: number;
  total: number;
}

/** Two weeks of made-up sign-ups, ending today. */
const DAYS: Day[] = Array.from({ length: 14 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - 13 + index);
  const registered = [4, 7, 3, 9, 12, 6, 5, 8, 14, 11, 7, 10, 16, 13][index];
  const returning = [2, 3, 5, 4, 6, 8, 3, 5, 7, 9, 6, 4, 8, 10][index];
  return { date, registered, returning, total: 120 + index * 9 + registered * 2 };
});

const dayLabel = (day: Day) => `${String(day.date.getDate()).padStart(2, '0')}.${String(day.date.getMonth() + 1).padStart(2, '0')}`;
const dayTitle = (day: Day) => day.date.toLocaleDateString('en', { day: 'numeric', month: 'long', weekday: 'short' });

const barChart = `
<fy-bar-chart label="Sign-ups per day" [data]="days" [series]="series" [stacked]="stacked()"
  [xLabel]="dayLabel" [readoutTitle]="dayTitle" />
<label class="toggle"><input type="checkbox" [checked]="stacked()" (change)="stacked.set(!stacked())" /> Stacked</label>
`;

const barChartCode = `${barChart}
// component
series: ChartSeries<Day>[] = [
  { id: 'new', label: 'New', value: day => day.registered },
  { id: 'back', label: 'Returning', value: day => day.returning },
];
dayLabel = (day: Day) => formatDate(day.date, 'dd.MM', 'en');`;

@Component({
  selector: 'docs-bar-chart',
  imports: [BarChartComponent],
  template: barChart,
  host: { class: 'docs-chart' },
})
class BarChartExample {
  protected readonly days = DAYS;
  protected readonly dayLabel = dayLabel;
  protected readonly dayTitle = dayTitle;
  protected readonly stacked = signal(true);
  protected readonly series: ChartSeries<Day>[] = [
    { id: 'new', label: 'New', value: day => day.registered },
    { id: 'back', label: 'Returning', value: day => day.returning },
  ];
}

const lineChart = `
<fy-line-chart label="Users in total" [data]="days" [series]="series" [xLabel]="dayLabel" [readoutTitle]="dayTitle" />
`;

@Component({
  selector: 'docs-line-chart',
  imports: [LineChartComponent],
  template: lineChart,
  host: { class: 'docs-chart' },
})
class LineChartExample {
  protected readonly days = DAYS;
  protected readonly dayLabel = dayLabel;
  protected readonly dayTitle = dayTitle;
  protected readonly series: ChartSeries<Day>[] = [{ id: 'total', label: 'Users', value: day => day.total }];
}

const IMPORTS = `// A separate entry point: the main one carries no chart code.
import { BarChartComponent, ChartSeries, LineChartComponent } from '@freely-ui/angular/charts';`;

const SHARED_INPUTS = [
  { name: 'data', type: 'T[]', description: 'The items along the horizontal axis, e.g. days; required.' },
  { name: 'series', type: 'ChartSeries<T>[]', description: 'What to draw: { id, label, color?, value(item, index) }; required.' },
  { name: 'xLabel', type: '(item, index) => string', description: 'Text under an item; its number by default. A few are shown, the last always.' },
  { name: 'readoutTitle', type: '(item, index) => string', description: 'Heading of the readout; xLabel by default.' },
  { name: 'format', type: '(value: number) => string', description: 'How values are written on the axis and in the readout.' },
  { name: 'locale', type: 'string', description: 'Locale of the default format; LOCALE_ID by default.' },
  { name: 'label', type: 'string', default: "''", description: 'Name of the chart.' },
  { name: 'height', type: 'number', default: '200', description: 'Height of the drawing in px.' },
  { name: 'legend', type: 'boolean', description: 'The legend over the chart; shown for more than one series by default.' },
];

const SHARED_CSS_VARS = [
  { name: '--fy-chart-1 … --fy-chart-6', description: 'Default colours of the series; accent, success, warning, info, danger and secondary text when not set.' },
  { name: '--fy-chart-grid-color', default: 'var(--fy-tertiary-background)', description: 'Grid lines.' },
  { name: '--fy-chart-tick-color', default: 'var(--fy-secondary-text)', description: 'Axis labels.' },
  { name: '--fy-chart-readout-background', default: 'var(--fy-tertiary-background)', description: 'Fill of the readout.' },
];

const SHARED_A11Y = [
  'The drawing is an image named by label; the readout is announced as it changes.',
  'It takes the focus: the readout opens on the last item, the arrow keys, Home and End move it, Esc closes it.',
  'A chart is no table: put the numbers on the page too where they matter.',
];

export const CHART_DOCS: ComponentDoc[] = [
  {
    slug: 'bar-chart',
    title: 'Bar chart',
    group: 'Charts',
    summary: 'Columns of values per item, stacked or side by side, with a readout on hover and from the keyboard.',
    imports: IMPORTS,
    selectors: ['fy-bar-chart'],
    examples: [{
      title: 'Sign-ups per day',
      description: 'Hover a column, or focus the chart and use the arrow keys.',
      component: BarChartExample,
      code: barChartCode,
    }],
    inputs: [...SHARED_INPUTS, { name: 'stacked', type: 'boolean', default: 'true', description: 'One column per item; side by side when false.' }],
    cssVars: SHARED_CSS_VARS,
    accessibility: SHARED_A11Y,
  },
  {
    slug: 'line-chart',
    title: 'Line chart',
    group: 'Charts',
    summary: 'Lines of values per item over a light wash, with a readout on hover and from the keyboard.',
    imports: IMPORTS,
    selectors: ['fy-line-chart'],
    examples: [{ title: 'Users in total', component: LineChartExample, code: lineChart }],
    inputs: [...SHARED_INPUTS, { name: 'area', type: 'boolean', default: 'true', description: 'The wash under each line.' }],
    cssVars: [
      ...SHARED_CSS_VARS,
      { name: '--fy-chart-line-width', default: '2px', description: 'Width of a line.' },
      { name: '--fy-chart-area-opacity', default: '0.1', description: 'Opacity of the wash.' },
    ],
    accessibility: SHARED_A11Y,
  },
];
