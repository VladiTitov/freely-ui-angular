import { booleanAttribute, Component, computed, contentChildren, Directive, ElementRef, inject, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { ButtonComponent } from '../button/button.component';

/** `sheet` slides up from the bottom; `full` covers the whole screen, e.g. for an onboarding. */
export type SlideSheetMode = 'sheet' | 'full';

/** Marks one slide of a `fy-slide-sheet`; slides are shown in the order they are declared. */
@Directive({ selector: 'ng-template[fySlideSheetSlide]' })
export class SlideSheetSlideDirective {
  readonly template = inject(TemplateRef);
}

/**
 * Swipeable slides with dots and a next button; slides snap with native scrolling. Only the mechanics:
 * what a slide shows is up to the owner. Mount it while it should be shown, it starts on the first slide.
 *
 * ```html
 * @if (open()) {
 *   <fy-slide-sheet caption="What's new" (closed)="open.set(false)">
 *     <ng-template fySlideSheetSlide>...</ng-template>
 *     <ng-template fySlideSheetSlide>...</ng-template>
 *   </fy-slide-sheet>
 * }
 * ```
 */
@Component({
  selector: 'fy-slide-sheet',
  templateUrl: './slide-sheet.component.html',
  styleUrls: ['./slide-sheet.component.css'],
  imports: [ButtonComponent, NgTemplateOutlet, HapticFeedbackDirective]
})
export class SlideSheetComponent {
  readonly mode = input<SlideSheetMode>('sheet');
  /** Shown above the slides of a `sheet`. */
  readonly caption = input<string | null>(null);
  /** Accessible name of the dialog; the caption when not given. */
  readonly label = input<string | null>(null);
  /** Text of the button on the last slide; `slideDone` of the UI labels when not given. */
  readonly doneLabel = input<string | null>(null);
  /** Tones the last button down when the last slide has a main action of its own. */
  readonly quietDone = input(false, { transform: booleanAttribute });

  /** Fires on the close or skip button, the backdrop of a `sheet` and the button on the last slide. */
  readonly closed = output<void>();

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);
  protected readonly HapticImpact = HapticImpact;

  protected readonly slides = contentChildren(SlideSheetSlideDirective);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly isFull = computed(() => this.mode() === 'full');

  readonly index = signal(0);
  readonly isLast = computed(() => this.index() >= this.slides().length - 1);

  goTo(index: number): void {
    const track = this.track()?.nativeElement;
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  }

  next(): void {
    if (this.isLast()) this.close();
    else this.goTo(this.index() + 1);
  }

  close(): void {
    this.closed.emit();
  }

  protected onScroll(track: HTMLElement): void {
    this.index.set(Math.round(track.scrollLeft / track.clientWidth));
  }
}
