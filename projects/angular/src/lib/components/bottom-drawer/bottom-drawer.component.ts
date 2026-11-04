import { Component, ElementRef, EventEmitter, inject, OnDestroy, Output } from "@angular/core";
import { Overlay } from "../../utils/overlay";

/**
 * Sheet that slides up from the bottom and hosts a full-height form.
 * Open and close it with `show()` / `hide()`; the projected form can inject this component
 * to close the drawer or to react to `beforeShow` / `hidden`.
 */
@Component({
  selector: 'fy-bottom-drawer',
  templateUrl: './bottom-drawer.component.html',
  styleUrls: ['./bottom-drawer.component.css'],
  host: { role: 'dialog', 'aria-modal': 'true', '(click)': 'onBackdropClick($event)' }
})
export class BottomDrawerComponent implements OnDestroy {
  /** Fires right before the drawer starts opening. */
  @Output() beforeShow = new EventEmitter<void>();
  /** Fires once the drawer has finished closing. */
  @Output() hidden = new EventEmitter<void>();

  private readonly overlay = new Overlay(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, {
    duration: 300,
    pageClass: 'fy-drawer-open',
    beforeShow: () => this.beforeShow.emit(),
    hidden: () => this.hidden.emit()
  });

  ngOnDestroy(): void {
    this.overlay.destroy();
  }

  show(): void {
    this.overlay.show();
  }

  hide(): void {
    this.overlay.hide();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.hide();
  }
}
