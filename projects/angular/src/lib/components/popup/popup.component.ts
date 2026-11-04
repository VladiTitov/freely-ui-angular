import { ChangeDetectorRef, Component, AfterViewInit, ElementRef, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PopupButton, PopupService } from './popup.service';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { Overlay } from '../../utils/overlay';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'fy-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
  imports: [ButtonComponent, CommonModule, HapticFeedbackDirective]
})
export class PopupComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modalPopup', { static: true }) modalRef!: ElementRef<HTMLElement>;

  contentMode: 'text' | 'template' = 'text';
  title = '';
  message = '';
  contentTemplate: TemplateRef<unknown> | null = null;
  contentContext: Record<string, unknown> = {};
  buttons: PopupButton[] = [];
  showClose = true;
  isBreakEnabled = false;

  protected HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  private dismissValue = 'dismiss';
  private resolveCallback?: (value: string) => void;
  private pendingOpen = false;
  private subscription: Subscription;
  private modal?: Overlay;

  constructor(
    private popupService: PopupService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.popupService.open$.subscribe(({ options, resolve }) => {
      this.isBreakEnabled = options.wordBreak ?? false;
      this.buttons = options.buttons ?? [];
      this.showClose = options.showClose ?? true;
      this.dismissValue = options.dismissValue ?? 'dismiss';
      this.title = options.title ?? '';

      if (options.content) {
        this.contentMode = 'template';
        this.contentTemplate = options.content;
        this.contentContext = options.contentContext ?? {};
        this.message = '';
      } else {
        this.contentMode = 'text';
        this.contentTemplate = null;
        this.contentContext = {};
        this.message = options.message ?? '';
      }

      this.resolveCallback = resolve;

      if (this.modal) {
        this.cdr.detectChanges();
        this.modal.show();
        return;
      }

      this.pendingOpen = true;
    });
  }

  ngAfterViewInit() {
    this.modal = new Overlay(this.modalRef.nativeElement, {
      duration: 180,
      hidden: () => this.resolveCurrent(this.dismissValue)
    });

    if (this.pendingOpen) {
      this.cdr.detectChanges();
      this.modal.show();
      this.pendingOpen = false;
    }
  }

  onButton(button: PopupButton) {
    this.resolveCurrent(button.value);
    this.modal?.hide();
  }

  onDismiss() {
    this.resolveCurrent(this.dismissValue);
    this.modal?.hide();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onDismiss();
  }

  private resolveCurrent(value: string) {
    if (!this.resolveCallback) return;

    const resolve = this.resolveCallback;
    this.resolveCallback = undefined;
    resolve(value);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.modal?.destroy();
  }
}
