import { Injectable, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { HapticFeedback } from '../../haptics/haptics';

/** `accent` — the main answer, `danger` — a main answer that deletes or declines something, `muted` — the way out. */
export type PopupButtonStyle = 'accent' | 'danger' | 'muted';

export interface PopupButton {
  /** Value returned by `open()` when this button is pressed. */
  value: string;
  text: string;
  style?: PopupButtonStyle;
  haptic?: HapticFeedback;
}

export interface PopupOptions {
  title?: string;
  message?: string;
  content?: TemplateRef<unknown>;
  contentContext?: Record<string, unknown>;
  wordBreak?: boolean;
  buttons: PopupButton[];
  /** Value resolved when the popup is dismissed (close button, backdrop, esc). Defaults to `'dismiss'`. */
  dismissValue?: string;
  /** Show the top-right close button. Defaults to `true`. */
  showClose?: boolean;
}

interface PopupRequest {
  options: PopupOptions;
  resolve: (value: string) => void;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private openSubject = new Subject<PopupRequest>();
  readonly open$ = this.openSubject.asObservable();

  open(options: PopupOptions): Promise<string> {
    return new Promise<string>(resolve => {
      this.openSubject.next({ options, resolve });
    });
  }
}
