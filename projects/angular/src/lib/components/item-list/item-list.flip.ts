import { afterNextRender, Directive, ElementRef, inject, Injector, input } from '@angular/core';

/**
 * FLIP reorder animation for the direct children of the host. Call
 * {@link prepare} right before a change that reorders the children: it records
 * where every child is, and after the next render slides each moved child from
 * its old spot to its new one.
 *
 * Positions are `offsetTop`s (the host is the offset parent), so page scroll
 * and running transforms don't skew them. Children that appear or disappear in
 * the same change are left to their own enter/leave animations.
 */
@Directive({
  selector: '[fyItemListFlip]',
  host: { style: 'position: relative' },
})
export class ItemListFlip {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Slide duration in ms. `0` turns the animation off. */
  readonly duration = input(300, { alias: 'fyItemListFlip' });

  prepare(): void {
    const duration = this.duration();
    if (!duration || prefersReducedMotion()) return;

    const before = new Map<HTMLElement, number>();
    for (const child of this.children()) before.set(child, child.offsetTop);

    afterNextRender(
      {
        write: () => {
          for (const child of this.children()) {
            const top = before.get(child);
            const delta = top === undefined ? 0 : top - child.offsetTop;
            if (!delta) continue;
            child.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], {
              duration,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              composite: 'add',
            });
          }
        },
      },
      { injector: this.injector },
    );
  }

  private children(): HTMLElement[] {
    return Array.from(this.host.nativeElement.children) as HTMLElement[];
  }
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
