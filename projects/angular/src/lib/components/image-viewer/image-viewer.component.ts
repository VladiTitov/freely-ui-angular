import { afterNextRender, Component, ElementRef, inject, Injector, input, OnDestroy, signal, viewChild } from '@angular/core';
import { Overlay } from '../../utils/overlay';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { ButtonComponent } from '../button/button.component';

export interface ViewerImage {
  url: string;
}

/**
 * Full-screen image viewer: swipe between images, close with the button or Escape.
 * Render it once next to the thumbnails and call `open(index)`.
 */
@Component({
  selector: 'fy-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css'],
  imports: [ButtonComponent, HapticFeedbackDirective],
  host: { role: 'dialog', 'aria-modal': 'true', '[attr.aria-label]': 'labels().imageViewer' }
})
export class ImageViewerComponent implements OnDestroy {
  protected readonly HapticImpact = HapticImpact;

  readonly images = input<ViewerImage[]>([]);

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  protected readonly active = signal(0);
  // Slides are rendered only while the viewer is open, so full-size images are not loaded up front.
  protected readonly opened = signal(false);

  private readonly injector = inject(Injector);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  private readonly overlay = new Overlay(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, {
    duration: 150,
    hidden: () => this.opened.set(false)
  });

  ngOnDestroy(): void {
    this.overlay.destroy();
  }

  open(index = 0): void {
    this.active.set(index);
    this.opened.set(true);
    this.overlay.show();

    // The track exists only after the next render.
    afterNextRender(() => {
      const track = this.track()?.nativeElement;
      track?.scrollTo({ left: index * track.clientWidth, behavior: 'instant' });
    }, { injector: this.injector });
  }

  close(): void {
    this.overlay.hide();
  }

  protected onScroll(track: HTMLElement): void {
    this.active.set(Math.round(track.scrollLeft / track.clientWidth));
  }
}
