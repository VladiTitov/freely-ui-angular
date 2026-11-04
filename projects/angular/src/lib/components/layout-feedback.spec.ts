import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipDirective } from '../directives/tooltip.directive';
import { ACCORDION } from './accordion/accordion.component';
import { CardComponent } from './card/card.component';
import { ProgressComponent } from './progress/progress.component';
import { SkeletonComponent } from './skeleton/skeleton.component';

@Component({
  imports: [ProgressComponent],
  template: `<fy-progress [value]="value()" [max]="10" label="Level" valueText="7 of 10" />`
})
class ProgressHost {
  readonly value = signal(7);
}

describe('ProgressComponent', () => {
  it('is a progress bar with its value, range and spoken text', async () => {
    const fixture = TestBed.createComponent(ProgressHost);
    await fixture.whenStable();
    const bar = (fixture.nativeElement as HTMLElement).querySelector('fy-progress')!;

    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('7');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('10');
    expect(bar.getAttribute('aria-valuetext')).toBe('7 of 10');
    expect(bar.getAttribute('aria-label')).toBe('Level');
    expect(bar.querySelector<HTMLElement>('.fy-progress__fill')?.style.width).toBe('70%');
  });

  it('draws a value outside the range at its end', async () => {
    const fixture = TestBed.createComponent(ProgressHost);
    fixture.componentInstance.value.set(15);
    await fixture.whenStable();
    const bar = (fixture.nativeElement as HTMLElement).querySelector('fy-progress')!;

    expect(bar.getAttribute('aria-valuenow')).toBe('10');
    expect(bar.querySelector<HTMLElement>('.fy-progress__fill')?.style.width).toBe('100%');
  });
});

@Component({
  imports: [TooltipDirective],
  template: `
    <button type="button" fyTooltip="Copy the record">Copy</button>
    <button type="button" aria-label="Settings" fyTooltip="Settings">⚙</button>
  `
})
class TooltipHost {}

describe('TooltipDirective', () => {
  async function render() {
    const fixture = TestBed.createComponent(TooltipHost);
    await fixture.whenStable();
    const [copy, settings] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    return { fixture, copy, settings };
  }
  const tooltip = () => document.querySelector('.fy-tooltip');

  afterEach(() => document.querySelectorAll('.fy-tooltip').forEach(tip => tip.remove()));

  it('appears on keyboard focus and describes the element', async () => {
    const { copy } = await render();
    copy.focus();

    expect(tooltip()?.textContent).toBe('Copy the record');
    expect(tooltip()?.getAttribute('role')).toBe('tooltip');
    expect(copy.getAttribute('aria-describedby')).toBe(tooltip()?.id);
  });

  it('closes on Escape and on blur', async () => {
    const { copy } = await render();
    copy.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(tooltip()).toBeNull();
    expect(copy.hasAttribute('aria-describedby')).toBe(false);

    copy.blur();
    copy.focus();
    expect(tooltip()).not.toBeNull();
    copy.blur();
    expect(tooltip()).toBeNull();
  });

  it('does not open when a tap focuses the element', async () => {
    const { copy } = await render();
    copy.dispatchEvent(new Event('pointerdown'));
    copy.focus();

    expect(tooltip()).toBeNull();
  });

  it('does not describe an element by the text of its own label', async () => {
    const { settings } = await render();
    settings.focus();

    expect(tooltip()?.textContent).toBe('Settings');
    expect(settings.hasAttribute('aria-describedby')).toBe(false);
  });
});

@Component({
  imports: [ACCORDION],
  template: `
    <fy-accordion>
      <fy-accordion-item heading="Shipping">Ships in a day.</fy-accordion-item>
      <fy-accordion-item heading="Returns">Within a month.</fy-accordion-item>
    </fy-accordion>
  `
})
class AccordionHost {}

describe('AccordionComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(AccordionHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const triggers = Array.from(root.querySelectorAll<HTMLButtonElement>('.fy-accordion-item__trigger'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.fy-accordion-item__panel'));
    return { fixture, triggers, panels };
  }

  it('links each button to its panel and starts closed', async () => {
    const { triggers, panels } = await render();

    expect(triggers[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(triggers[0].id);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(panels[0].hidden).toBe(true);
  });

  it('opens from the keyboard-focusable button and keeps one section open', async () => {
    const { fixture, triggers, panels } = await render();
    triggers[0].focus();
    expect(document.activeElement).toBe(triggers[0]);

    triggers[0].click();
    await fixture.whenStable();
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(panels[0].hidden).toBe(false);

    triggers[1].click();
    await fixture.whenStable();
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });
});

@Component({
  imports: [CardComponent, SkeletonComponent],
  template: `
    <fy-card label="Users" [value]="value()" [loading]="loading()" caption="today">
      <span cardBadge class="badge">+12</span>
    </fy-card>
    <fy-skeleton shape="circle" [width]="48" height="2em" />
  `
})
class CardHost {
  readonly value = signal<number | null>(1280);
  readonly loading = signal(false);
}

describe('CardComponent and SkeletonComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(CardHost);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('heads the card with its label and shows the value with the badge beside it', async () => {
    const { root } = await render();
    const card = root.querySelector('fy-card')!;
    const label = card.querySelector('.fy-card__label')!;

    expect(card.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.getAttribute('role')).toBe('heading');
    expect(card.querySelector('.fy-card__value')?.textContent?.trim()).toBe('1280');
    expect(card.querySelector('.fy-card__value-row .badge')).not.toBeNull();
    expect(card.querySelector('.fy-card__caption')?.textContent?.trim()).toBe('today');
  });

  it('gives way to skeletons while loading', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    const card = root.querySelector('fy-card')!;

    expect(card.querySelector('.fy-card__value')).toBeNull();
    expect(card.querySelector('.fy-card__caption')).toBeNull();
    expect(card.querySelectorAll('fy-skeleton').length).toBe(3);
    expect(card.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('sizes and shapes a skeleton and hides it from assistive tech', async () => {
    const { root } = await render();
    const skeleton = root.querySelector<HTMLElement>(':scope > fy-skeleton')!;

    expect(skeleton.classList).toContain('fy-skeleton--circle');
    expect(skeleton.style.width).toBe('48px');
    expect(skeleton.style.height).toBe('2em');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
  });
});
