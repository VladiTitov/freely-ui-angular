import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { Overlay } from '../../utils/overlay';

@Component({
  selector: 'fy-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modalElement') modalElement!: ElementRef<HTMLElement>;

  /** Fires once the modal has finished closing. */
  @Output() hidden = new EventEmitter<void>();

  private overlay?: Overlay;

  ngAfterViewInit(): void {
    this.overlay = new Overlay(this.modalElement.nativeElement, {
      duration: 300,
      hidden: () => this.hidden.emit()
    });
  }

  ngOnDestroy(): void {
    this.overlay?.destroy();
  }

  show() {
    this.overlay?.show();
  }

  hide() {
    this.overlay?.hide();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.hide();
  }
}
