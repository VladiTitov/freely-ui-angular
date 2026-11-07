import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFyLabels } from '../../providers/fy-labels';
import { CarouselComponent, CarouselSlideDirective } from './carousel.component';

@Component({
  imports: [CarouselComponent, CarouselSlideDirective],
  template: `
    <fy-carousel [(index)]="index" [label]="label()">
      @for (item of items(); track item) {
        <ng-template fyCarouselSlide let-i let-active="active">
          <span class="content" [class.content--active]="active">{{ item }} {{ i }}</span>
        </ng-template>
      }
    </fy-carousel>
  `
})
class HostComponent {
  readonly items = signal(['a', 'b', 'c', 'd', 'e']);
  readonly index = signal(0);
  readonly label = signal<string | undefined>(undefined);
}

describe('CarouselComponent', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideFyLabels(() => () => ({ carousel: 'Карусель', carouselSlide: (i, n) => `${i} из ${n}` }))]
    });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const slides = () => Array.from(root.querySelectorAll('.fy-carousel__slide'));
    const content = () => slides().map(slide => slide.querySelector('.content')?.textContent?.trim() ?? null);
    const track = root.querySelector<HTMLElement>('.fy-carousel__track')!;
    return { fixture, root, slides, content, track };
  }

  it('renders the slide in view and the one next to it only', async () => {
    const { content } = await render();

    expect(content()).toEqual(['a 0', 'b 1', null, null, null]);
  });

  it('renders the slides next to a new index and keeps the ones it rendered', async () => {
    const { fixture, content } = await render();
    fixture.componentInstance.index.set(3);
    await fixture.whenStable();

    expect(content()).toEqual(['a 0', 'b 1', 'c 2', 'd 3', 'e 4']);
  });

  it('starts new slides unrendered', async () => {
    const { fixture, content } = await render();
    fixture.componentInstance.index.set(3);
    await fixture.whenStable();
    fixture.componentInstance.items.set(['v', 'w', 'x', 'y', 'z']);
    fixture.componentInstance.index.set(0);
    await fixture.whenStable();

    expect(content()).toEqual(['v 0', 'w 1', null, null, null]);
  });

  it('tells the template which slide is in view', async () => {
    const { root } = await render();

    expect(root.querySelector('.content--active')?.textContent?.trim()).toBe('a 0');
  });

  it('moves with the arrow keys, Home and End', async () => {
    const { fixture, track } = await render();
    const press = async (key: string) => {
      track.dispatchEvent(new KeyboardEvent('keydown', { key }));
      await fixture.whenStable();
    };

    await press('ArrowRight');
    expect(fixture.componentInstance.index()).toBe(1);
    await press('End');
    expect(fixture.componentInstance.index()).toBe(4);
    await press('ArrowRight');
    expect(fixture.componentInstance.index()).toBe(4);
    await press('Home');
    expect(fixture.componentInstance.index()).toBe(0);
  });

  it('marks the active dot and moves to a dot clicked', async () => {
    const { fixture, root } = await render();
    const dots = () => Array.from(root.querySelectorAll<HTMLElement>('.fy-carousel__dot'));

    expect(dots().length).toBe(5);
    expect(dots()[0].classList).toContain('fy-carousel__dot--active');

    dots()[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.index()).toBe(2);
    expect(dots()[2].classList).toContain('fy-carousel__dot--active');
  });

  it('draws no dots for a single slide', async () => {
    const { fixture, root } = await render();
    fixture.componentInstance.items.set(['a']);
    await fixture.whenStable();

    expect(root.querySelector('.fy-carousel__dots')).toBeNull();
  });

  it('pulls the index back when slides are removed', async () => {
    const { fixture } = await render();
    fixture.componentInstance.index.set(4);
    await fixture.whenStable();
    fixture.componentInstance.items.set(['a', 'b']);
    await fixture.whenStable();

    expect(fixture.componentInstance.index()).toBe(1);
  });

  it('names the carousel and its slides from the UI labels', async () => {
    const { fixture, root, slides } = await render();
    const host = root.querySelector('fy-carousel')!;

    expect(host.getAttribute('aria-roledescription')).toBe('carousel');
    expect(host.getAttribute('aria-label')).toBe('Карусель');
    expect(slides()[1].getAttribute('aria-label')).toBe('2 из 5');

    fixture.componentInstance.label.set('Photos');
    await fixture.whenStable();
    expect(host.getAttribute('aria-label')).toBe('Photos');
  });
});
