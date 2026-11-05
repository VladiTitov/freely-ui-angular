import { afterNextRender, booleanAttribute, Component, DestroyRef, ElementRef, inject, Input, viewChild } from '@angular/core';

@Component({
  selector: 'fy-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent {
  @Input() title = '';
  @Input({ transform: booleanAttribute }) bare = false;

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Publishes the pinned header's live height as `--fy-page-sticky-height`, so
    // content that sticks below it (e.g. the item-list toolbar) lines up.
    afterNextRender(() => {
      const scroller = this.scroller().nativeElement;
      const headers = scroller.querySelectorAll<HTMLElement>(
        ':scope > .fy-sticky-wrapper, :scope > .fy-page-body > .fy-sticky-wrapper',
      );
      if (!headers.length) return;
      const update = () => {
        const height = Math.max(...Array.from(headers, header => header.offsetHeight));
        scroller.style.setProperty('--fy-page-sticky-height', `${height}px`);
      };
      update();
      const observer = new ResizeObserver(update);
      headers.forEach(header => observer.observe(header));
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
