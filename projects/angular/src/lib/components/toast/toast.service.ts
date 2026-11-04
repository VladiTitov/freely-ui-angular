import { inject, Injectable, signal } from '@angular/core';
import { HapticNotification } from '../../haptics/haptic-notification.enum';
import { FY_HAPTICS } from '../../haptics/haptics';

/** `error` — something the user did failed; `info` — a note that needs no answer. */
export type ToastTone = 'error' | 'info';

export interface ToastAction {
  text: string;
  run: () => void;
}

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** A button next to the message, e.g. "Retry"; pressing it hides the toast. */
  action?: ToastAction;
  /** How long it stays, in ms. Defaults to 4 s, or 6 s with an action, which takes longer to reach. */
  duration?: number;
}

export interface Toast extends ToastOptions {
  readonly id: number;
}

/**
 * A short message that does not stop the user, shown by `<fy-toast-host>` placed once in the app shell.
 * One at a time: a new toast replaces the shown one. An error toast also plays the error haptic.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly haptics = inject(FY_HAPTICS);
  private readonly _current = signal<Toast | null>(null);
  private nextId = 0;
  private timer?: ReturnType<typeof setTimeout>;

  readonly current = this._current.asReadonly();

  show(options: ToastOptions): void {
    clearTimeout(this.timer);

    const toast: Toast = { ...options, id: ++this.nextId };
    this._current.set(toast);

    if (options.tone === 'error') this.haptics.notification(HapticNotification.Error);

    const duration = options.duration ?? (options.action ? 6000 : 4000);
    this.timer = setTimeout(() => this.dismiss(toast.id), duration);
  }

  /** Hides the toast `id`, or whichever is shown; a toast that has been replaced already is left alone. */
  dismiss(id?: number): void {
    if (id !== undefined && this._current()?.id !== id) return;

    clearTimeout(this.timer);
    this._current.set(null);
  }
}
