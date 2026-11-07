import { inject, Injectable, TemplateRef } from '@angular/core';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_LABELS } from '../../providers/fy-labels';
import { PopupService } from './popup.service';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  /** Shown under the message, e.g. the item about to be deleted. */
  content?: TemplateRef<unknown>;
  contentContext?: Record<string, unknown>;
  /** Text of the confirm button; `confirm` of the UI labels when not given. */
  confirmText?: string;
  /** Text of the cancel button; `cancel` of the UI labels when not given. */
  cancelText?: string;
  /** Breaks long words of the message, e.g. a link or a name without spaces. */
  wordBreak?: boolean;
  /** The confirm button deletes or declines something: it turns red and plays a rigid haptic instead of a medium one. */
  destructive?: boolean;
}

/**
 * Asks a yes/no question in the popup and resolves to `true` only when the user confirms; the cancel button, the
 * close button, the backdrop and Esc all resolve to `false`. Needs one `<fy-popup />` in the app, as `PopupService`
 * does.
 *
 * ```ts
 * private readonly confirmation = inject(FyConfirmService);
 *
 * async remove(wish: Wish) {
 *   if (!(await this.confirmation.confirm({ title: 'Delete the wish?', confirmText: 'Delete', destructive: true }))) return;
 *   ...
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FyConfirmService {
  private readonly popup = inject(PopupService);
  private readonly labels = inject(FY_LABELS);

  confirm(options: ConfirmOptions): Promise<boolean> {
    const labels = this.labels();
    return this.popup
      .open({
        title: options.title,
        message: options.message,
        content: options.content,
        contentContext: options.contentContext,
        wordBreak: options.wordBreak,
        dismissValue: 'cancel',
        buttons: [
          {
            value: 'confirm',
            text: options.confirmText ?? labels.confirm,
            style: options.destructive ? 'danger' : 'accent',
            haptic: options.destructive ? HapticImpact.Rigid : HapticImpact.Medium
          },
          { value: 'cancel', text: options.cancelText ?? labels.cancel, style: 'muted' }
        ]
      })
      .then(result => result === 'confirm');
  }
}
