import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { ButtonComponent } from '../button/button.component';

/** `auto` grows with the content; `tall` and `full` take a fixed share of the screen and scroll inside. */
export type ModalPanelHeight = 'auto' | 'tall' | 'full';

/**
 * The card of a dialog: a title with a close button, the content and an optional footer.
 * Put it inside `<fy-modal>`; it only asks to be closed, the owner hides the modal.
 *
 * ```html
 * <fy-modal #modal>
 *   <fy-modal-panel title="My friends" height="tall" (close)="modal.hide()">
 *     <button panelActions type="button" fyButton variant="tertiary" iconOnly>…</button>
 *     <div class="fy-scroll-area">…</div>
 *     <button panelFooter type="button" fyButton size="l" block>Apply</button>
 *   </fy-modal-panel>
 * </fy-modal>
 * ```
 *
 * In a `tall` or `full` panel the content is a flex column: give the part that should scroll `scroll-area`.
 */
@Component({
  selector: 'fy-modal-panel',
  templateUrl: './modal-panel.component.html',
  styleUrls: ['./modal-panel.component.css'],
  imports: [ButtonComponent, HapticFeedbackDirective]
})
export class ModalPanelComponent {
  @Input() title = '';
  @Input() height: ModalPanelHeight = 'auto';
  /** `aria-label` of the close button; `close` of the UI labels when not given. */
  @Input() closeLabel?: string;

  @Output() close = new EventEmitter<void>();

  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);
}
