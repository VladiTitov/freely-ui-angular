import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
  viewChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FY_LABELS } from '../../providers/fy-labels';

/** What a slide template gets: its index and whether it is the slide in view. */
export interface CarouselSlideContext {
  $implicit: number;
  active: boolean;
}

/** Marks one slide of a `fy-carousel`; slides are shown in the order they are declared. */
@Directive({ selector: 'ng-template[fyCarouselSlide]' })
export class CarouselSlideDirective {
  readonly template = inject<TemplateRef<CarouselSlideContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: CarouselSlideDirective, context: unknown): context is CarouselSlideContext {
    return true;
  }
}

/**
 * A row of slides swiped with native scrolling that snaps to each slide, with dots under it. A slide is rendered
 * once it is next to the one in view, so the images further on load only when the user gets near them.
 *
 * ```html
 * <fy-carousel [(index)]="index" label="Photos">
 *   @for (image of images; track image.id; let i = $index) {
 *     <ng-template fyCarouselSlide>
 *       <button type="button" (click)="viewer.open(i)"><img [src]="image.url" alt="" /></button>
 *     </ng-template>
 *   }
 * </fy-carousel>
 * <fy-image-viewer #viewer [images]="images" />
 * ```
 *
 * The arrow keys, Home and End move between the slides while the track has focus. Tune the look with the
 * `--fy-carousel-*` custom properties, e.g. `--fy-carousel-slide-width: 85%` to let the next slide peek in.
 */
@Component({
  selector: 'fy-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-carousel',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'label() ?? labels().carousel'
  }
})
export class CarouselComponent {
  protected readonly labels = inject(FY_LABELS);

  /** The slide in view. Set it to move there; the carousel writes it back as the user swipes. */
  readonly index = model(0);
  /** Accessible name of the carousel; `carousel` of the UI labels when not given. */
  readonly label = input<string>();
  /** Dots under the slides; never drawn for a single slide. */
  readonly dots = input(true, { transform: booleanAttribute });

  protected readonly slides = contentChildren(CarouselSlideDirective);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly showDots = computed(() => this.dots() && this.slides().length > 1);

  /**
   * Slides rendered so far: the ones next to the slide in view, and every one that ever was. Kept by slide, not by
   * index, so slides that replace others (another set of images) start unrendered again.
   */
  private readonly rendered = signal<ReadonlySet<CarouselSlideDirective>>(new Set());

  constructor() {
    effect(() => {
      const index = this.index();
      const slides = this.slides();
      untracked(() => {
        const near = [slides[index - 1], slides[index], slides[index + 1]].filter(slide => !!slide);
        const current = this.rendered();
        if (near.every(slide => current.has(slide))) return;
        this.rendered.set(new Set([...current, ...near].filter(slide => slides.includes(slide))));
      });
    });

    // An index set from outside scrolls there; one the scrolling wrote already matches the scroll position.
    let first = true;
    afterRenderEffect(() => {
      const count = this.slides().length;
      const index = this.index();
      untracked(() => {
        if (count === 0) return;
        if (index > count - 1) {
          this.index.set(count - 1);
          return;
        }
        if (this.indexAtScroll() !== index) this.scrollTo(index, first ? 'instant' : 'smooth');
        first = false;
      });
    });
  }

  /** Moves to the slide, with a smooth scroll unless the user asked for reduced motion. */
  goTo(index: number): void {
    const count = this.slides().length;
    if (count === 0) return;
    this.index.set(Math.min(Math.max(index, 0), count - 1));
  }

  next(): void {
    this.goTo(this.index() + 1);
  }

  previous(): void {
    this.goTo(this.index() - 1);
  }

  protected isRendered(slide: CarouselSlideDirective): boolean {
    return this.rendered().has(slide);
  }

  protected onScroll(): void {
    const index = this.indexAtScroll();
    if (index !== this.index()) this.index.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const last = this.slides().length - 1;
    const moves: Record<string, number> = {
      ArrowRight: this.index() + 1,
      ArrowLeft: this.index() - 1,
      Home: 0,
      End: last
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    this.goTo(moves[event.key]);
  }

  /** The slide nearest to the start of the track; `scrollLeft` is negative right-to-left, hence `abs`. */
  private indexAtScroll(): number {
    const track = this.track().nativeElement;
    const step = this.step(track);
    if (step <= 0) return this.index();
    const index = Math.round(Math.abs(track.scrollLeft) / step);
    return Math.min(index, Math.max(this.slides().length - 1, 0));
  }

  private scrollTo(index: number, behavior: ScrollBehavior): void {
    const track = this.track().nativeElement;
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    // `scrollTo` is missing where nothing lays the page out, e.g. in jsdom.
    track.scrollTo?.({ left: direction * index * this.step(track), behavior: reduced ? 'instant' : behavior });
  }

  /** Distance between the starts of two slides: the slide width plus the gap. */
  private step(track: HTMLElement): number {
    const [first, second] = Array.from(track.children) as HTMLElement[];
    if (!first) return 0;
    return second ? Math.abs(second.offsetLeft - first.offsetLeft) : first.offsetWidth;
  }
}
