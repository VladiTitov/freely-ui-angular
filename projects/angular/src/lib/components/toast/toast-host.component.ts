import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Toast, ToastService } from './toast.service';
import { FY_ICONS } from '../../providers/fy-icons';

/**
 * Shows the toasts of `ToastService` above the bottom of the screen. Place it once, in the app shell.
 * `--fy-toast-bottom` lifts it over a bottom navigation (default: 72px above the safe area).
 */
@Component({
  selector: 'fy-toast-host',
  template: `
    <div class="fy-toast-region" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="fy-toast" role="status" [attr.data-tone]="toast.tone ?? 'info'" (click)="service.dismiss(toast.id)">
          @if (toast.tone === 'error') {
            <i class="fy-toast__icon" [class]="icons.errorFilled" aria-hidden="true"></i>
          }
          <span class="fy-toast__message">{{ toast.message }}</span>
          @if (toast.action; as action) {
            <button type="button" class="fy-toast__action" (click)="run($event, toast)">{{ action.text }}</button>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./toast-host.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastHostComponent {
  protected readonly service = inject(ToastService);
  protected readonly icons = inject(FY_ICONS);
  /** A list of one, so a replacing toast is a new element and plays its entrance again. */
  protected readonly toasts = computed(() => {
    const toast = this.service.current();
    return toast ? [toast] : [];
  });

  protected run(event: Event, toast: Toast): void {
    event.stopPropagation();
    this.service.dismiss(toast.id);
    toast.action?.run();
  }
}
