import { Directive, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';

// Delay before revealing the focused field: lets the iOS keyboard finish sliding in,
// otherwise the scroll is computed against the old viewport and undershoots.
const REVEAL_DELAY_MS = 300;
// Room kept between a revealed field and the keyboard (or the top edge of the host).
const REVEAL_MARGIN_PX = 16;

/**
 * Keeps focused fields of a scroll container visible above the on-screen keyboard.
 *
 * The iOS WebView (Telegram included) does not shrink the layout viewport when the keyboard opens,
 * only `visualViewport`, so a `position: fixed` drawer stays full height with its bottom part under
 * the keyboard. The directive exposes the covered height as `--fy-kb-inset` on the host — use it as
 * bottom padding so the content can scroll above the keyboard — and scrolls the host just enough
 * to bring a covered field into view.
 *
 * Only the host scrolls: `scrollIntoView` would scroll every ancestor and the visual viewport too,
 * so a field near the top of a drawer pulled the whole sheet up to "centre" it.
 */
@Directive({
  selector: '[fyKeyboardAware]'
})
export class KeyboardAwareDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly viewport = window.visualViewport;
  private revealTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.viewport?.addEventListener('resize', this.onViewportChange);
    this.viewport?.addEventListener('scroll', this.onViewportChange);
    this.onViewportChange();
  }

  ngOnDestroy(): void {
    this.viewport?.removeEventListener('resize', this.onViewportChange);
    this.viewport?.removeEventListener('scroll', this.onViewportChange);
    clearTimeout(this.revealTimer);
  }

  @HostListener('focusin')
  protected onFocusIn(): void {
    this.scheduleReveal();
  }

  private readonly onViewportChange = (): void => {
    const viewport = this.viewport;
    if (!viewport) return;

    const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    this.host.style.setProperty('--fy-kb-inset', `${Math.round(inset)}px`);

    if (inset > 0) this.scheduleReveal();
  };

  private scheduleReveal(): void {
    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => {
      const field = document.activeElement;
      if (field instanceof HTMLElement && field !== this.host && this.host.contains(field) && isTextField(field)) {
        this.reveal(field);
      }
    }, REVEAL_DELAY_MS);
  }

  /** Scrolls the host by the least amount that shows the field; a field already in view stays put. */
  private reveal(field: HTMLElement): void {
    const hostRect = this.host.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const viewport = this.viewport;
    const visibleTop = hostRect.top;
    const visibleBottom = viewport ? Math.min(hostRect.bottom, viewport.offsetTop + viewport.height) : hostRect.bottom;

    let delta = 0;
    if (fieldRect.bottom > visibleBottom - REVEAL_MARGIN_PX) {
      delta = fieldRect.bottom - visibleBottom + REVEAL_MARGIN_PX;
      // A field taller than the visible part keeps its top (and the caret of a fresh textarea) in view.
      delta = Math.min(delta, fieldRect.top - visibleTop - REVEAL_MARGIN_PX);
    } else if (fieldRect.top < visibleTop + REVEAL_MARGIN_PX) {
      delta = fieldRect.top - visibleTop - REVEAL_MARGIN_PX;
    }

    if (Math.abs(delta) >= 1) this.host.scrollBy({ top: delta, behavior: 'smooth' });
  }
}

function isTextField(element: HTMLElement): boolean {
  return element instanceof HTMLTextAreaElement
    || (element instanceof HTMLInputElement && !['button', 'checkbox', 'file', 'radio', 'submit'].includes(element.type))
    || element.isContentEditable;
}
