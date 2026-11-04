import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input, signal } from '@angular/core';

/** Scroll distance (px) down before the toolbar hides. */
const HIDE_AFTER = 24;
/** Scroll distance (px) up before it comes back. */
const SHOW_AFTER = 8;

/**
 * Quick-return behaviour for the sticky toolbar: slides it away while the
 * user scrolls down and brings it back after a short scroll up. It never hides
 * while it sits in its natural place (not stuck yet), while focus is inside it
 * (typing), or when disabled.
 *
 * Listens to the nearest scrollable ancestor. The host must be the first child
 * of the list host, which is used to tell whether the toolbar is stuck.
 */
@Directive({
  selector: '[fyItemListAutoHide]',
  host: {
    '[class.fy-item-list__toolbar--hidden]': 'hidden()',
    '(focusin)': 'hidden.set(false)',
  },
})
export class ItemListAutoHide {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly enabled = input(true, { alias: 'fyItemListAutoHide' });

  protected readonly hidden = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const scroller = scrollParent(this.host);
      const target: HTMLElement | Window = scroller ?? window;
      let last = scrollTop(scroller);
      let travel = 0;

      const onScroll = () => {
        const top = scrollTop(scroller);
        const delta = top - last;
        last = top;

        if (!this.enabled() || top <= 0 || !this.isStuck(scroller) || this.host.contains(document.activeElement)) {
          travel = 0;
          this.hidden.set(false);
          return;
        }

        // Accumulate travel in one direction; reversing starts over.
        travel = delta > 0 ? Math.max(0, travel) + delta : Math.min(0, travel) + delta;
        if (travel > HIDE_AFTER) this.hidden.set(true);
        else if (travel < -SHOW_AFTER) this.hidden.set(false);
      };

      target.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => target.removeEventListener('scroll', onScroll));
    });
  }

  /** The list has scrolled past the toolbar's natural place, so it is pinned. */
  private isStuck(scroller: HTMLElement | null): boolean {
    const list = this.host.parentElement;
    if (!list) return false;
    const viewportTop = scroller ? scroller.getBoundingClientRect().top : 0;
    const stickyTop = parseFloat(getComputedStyle(this.host).top) || 0;
    return list.getBoundingClientRect().top < viewportTop + stickyTop - 1;
  }
}

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node !== document.body) return node;
  }
  return null;
}

function scrollTop(scroller: HTMLElement | null): number {
  return scroller ? scroller.scrollTop : window.scrollY;
}
