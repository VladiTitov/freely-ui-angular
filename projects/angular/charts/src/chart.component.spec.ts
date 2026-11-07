import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { ChartSeries } from './chart.types';
import { LineChartComponent } from './line-chart.component';

interface Day {
  date: string;
  added: number;
  removed: number;
}

const DAYS: Day[] = [
  { date: '01.11', added: 3, removed: 1 },
  { date: '02.11', added: 0, removed: 2 },
  { date: '03.11', added: 12, removed: 0 }
];

@Component({
  imports: [BarChartComponent, LineChartComponent],
  template: `
    <fy-bar-chart label="Changes" [data]="days()" [series]="series()" [stacked]="stacked()" [xLabel]="dayLabel"
      locale="en-US" />
    <fy-line-chart label="Changes" [data]="days()" [series]="series()" [xLabel]="dayLabel" locale="en-US" />
  `
})
class HostComponent {
  readonly days = signal(DAYS);
  readonly stacked = signal(true);
  readonly series = signal<ChartSeries<Day>[]>([
    { id: 'added', label: 'Added', value: day => day.added },
    { id: 'removed', label: 'Removed', color: 'red', value: day => day.removed }
  ]);
  readonly dayLabel = (day: Day) => day.date;
}

describe('charts', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const bar = root.querySelector<HTMLElement>('fy-bar-chart')!;
    const line = root.querySelector<HTMLElement>('fy-line-chart')!;
    const key = async (chart: HTMLElement, name: string) => {
      chart.querySelector('svg')!.dispatchEvent(new KeyboardEvent('keydown', { key: name }));
      await fixture.whenStable();
    };
    const focus = async (chart: HTMLElement) => {
      chart.querySelector('svg')!.dispatchEvent(new FocusEvent('focus'));
      await fixture.whenStable();
    };
    return { fixture, bar, line, key, focus };
  }

  const texts = (chart: HTMLElement, selector: string) =>
    Array.from(chart.querySelectorAll(selector)).map(element => element.textContent?.trim());

  it('names the drawing and lists the series in the legend', async () => {
    const { bar } = await render();

    expect(bar.querySelector('svg')?.getAttribute('role')).toBe('img');
    expect(bar.querySelector('svg')?.getAttribute('aria-label')).toBe('Changes');
    expect(texts(bar, '.fy-chart__legend li')).toEqual(['Added', 'Removed']);
  });

  it('marks the value axis with clean numbers and the items with their labels', async () => {
    const { bar } = await render();

    expect(texts(bar, '.fy-chart__tick')).toEqual(['0', '5', '10', '15', '01.11', '02.11', '03.11']);
  });

  it('groups the numbers by the locale', async () => {
    const { fixture, line } = await render();
    fixture.componentInstance.days.set([{ date: '04.11', added: 1200, removed: 0 }]);
    await fixture.whenStable();

    expect(texts(line, '.fy-chart__tick')).toEqual(expect.arrayContaining(['1,000', '1,500']));
  });

  it('stacks a segment per non-empty value, or puts them side by side', async () => {
    const { fixture, bar } = await render();
    const columns = () => Array.from(bar.querySelectorAll('.fy-chart__column')).map(column => column.children.length);

    expect(columns()).toEqual([2, 1, 1]);

    fixture.componentInstance.stacked.set(false);
    await fixture.whenStable();
    expect(columns()).toEqual([2, 1, 1]);
  });

  it('draws a line and a wash per series', async () => {
    const { line } = await render();

    expect(line.querySelectorAll('.fy-chart__line').length).toBe(2);
    expect(line.querySelectorAll('.fy-chart__area').length).toBe(2);
    expect(line.querySelector('.fy-chart__column')).toBeNull();
  });

  it('opens the readout of the last item on focus and moves it with the keys', async () => {
    const { bar, key, focus } = await render();
    await focus(bar);

    expect(bar.querySelector('.fy-chart__readout-title')?.textContent?.trim()).toBe('03.11');
    expect(texts(bar, '.fy-chart__readout-row b')).toEqual(['12', '0']);

    await key(bar, 'Home');
    expect(bar.querySelector('.fy-chart__readout-title')?.textContent?.trim()).toBe('01.11');
    await key(bar, 'ArrowRight');
    expect(texts(bar, '.fy-chart__readout-row b')).toEqual(['0', '2']);
    expect(bar.querySelectorAll('.fy-chart__column--dim').length).toBe(2);

    await key(bar, 'Escape');
    expect(bar.querySelector('.fy-chart__readout')).toBeNull();
  });

  it('draws a dot per line at the item in the readout', async () => {
    const { line, focus } = await render();
    await focus(line);

    expect(line.querySelectorAll('.fy-chart__dot').length).toBe(2);
    expect(line.querySelector('.fy-chart__crosshair')).not.toBeNull();
  });
});
