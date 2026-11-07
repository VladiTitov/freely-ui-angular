import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFyLabels } from '../../providers/fy-labels';
import { CardComponent, CardTrend } from './card.component';

@Component({
  imports: [CardComponent],
  template: `
    <fy-card label="Users" [value]="value()" [trend]="trend()" [loading]="loading()" [failed]="failed()"
      locale="en-US" caption="active today" (retry)="retries = retries + 1">
      <span class="content">More</span>
    </fy-card>
  `
})
class HostComponent {
  readonly value = signal<number | string | null>(1280);
  readonly trend = signal<CardTrend | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);
  retries = 0;
}

describe('CardComponent', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideFyLabels(() => () => ({ loadFailed: 'Не удалось загрузить', retry: 'Повторить' }))]
    });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const text = (selector: string) => root.querySelector(selector)?.textContent?.trim() ?? null;
    return { fixture, root, text };
  }

  it('names the card by its label', async () => {
    const { root } = await render();
    const card = root.querySelector('fy-card')!;
    const label = root.querySelector('.fy-card__label')!;

    expect(card.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.getAttribute('role')).toBe('heading');
  });

  it('groups a number value by the locale and shows a string as it is', async () => {
    const { fixture, text } = await render();

    expect(text('.fy-card__value')).toBe('1,280');

    fixture.componentInstance.value.set('12 / 20');
    await fixture.whenStable();
    expect(text('.fy-card__value')).toBe('12 / 20');
  });

  it('draws the trend as a badge beside the value', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.trend.set({ direction: 'up', tone: 'success', text: '2.5%', description: 'up 2.5%' });
    await fixture.whenStable();
    const badge = root.querySelector('.fy-card__value-row fy-badge')!;

    expect(badge.textContent?.trim()).toBe('2.5%');
    expect(badge.getAttribute('data-tone')).toBe('success');
    expect(badge.getAttribute('aria-label')).toBe('up 2.5%');
    expect(badge.querySelector('i')).not.toBeNull();
  });

  it('draws no arrow for a flat trend', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.trend.set({ direction: 'flat', tone: 'neutral', text: '0%' });
    await fixture.whenStable();
    const badge = root.querySelector('.fy-card__value-row fy-badge')!;

    expect(badge.querySelector('i')).toBeNull();
    expect(badge.getAttribute('aria-label')).toBe('0%');
  });

  it('shows skeletons while loading', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();

    expect(root.querySelector('.fy-card__value')).toBeNull();
    expect(root.querySelector('.fy-card__value-skeleton')).not.toBeNull();
    expect(root.querySelector('.content')).toBeNull();
  });

  it('swaps the figure for a message and a retry button when failed', async () => {
    const { fixture, root, text } = await render();
    fixture.componentInstance.failed.set(true);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();

    expect(root.querySelector('.fy-card__value')).toBeNull();
    expect(root.querySelector('.fy-card__value-skeleton')).toBeNull();
    expect(root.querySelector('.fy-card__caption')).toBeNull();
    expect(root.querySelector('.content')).toBeNull();
    expect(root.querySelector('.fy-card__failed')?.getAttribute('role')).toBe('alert');
    expect(text('.fy-card__failed-text')).toBe('Не удалось загрузить');

    const button = root.querySelector<HTMLButtonElement>('.fy-card__failed button')!;
    expect(button.textContent?.trim()).toBe('Повторить');
    button.click();
    expect(fixture.componentInstance.retries).toBe(1);
  });
});
