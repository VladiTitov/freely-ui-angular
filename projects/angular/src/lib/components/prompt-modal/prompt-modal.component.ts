import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { ModalComponent } from '../modal/modal.component';
import { ModalPanelComponent } from '../modal-panel/modal-panel.component';
import { ButtonComponent } from '../button/button.component';
import { TextFieldDirective } from '../form-field/text-field.directive';

export interface PromptModalOptions {
  title: string;
  confirmText: string;
  placeholder?: string;
  initialValue?: string;
  maxLength?: number;
}

/**
 * Dialog that asks for one line of text.
 *
 * ```ts
 * const name = await this.prompt.open({ title: 'New group', confirmText: 'Create' });
 * ```
 */
@Component({
  selector: 'fy-prompt-modal',
  templateUrl: './prompt-modal.component.html',
  imports: [ButtonComponent, FormsModule, ModalComponent, ModalPanelComponent, HapticFeedbackDirective, TextFieldDirective]
})
export class PromptModalComponent {
  @ViewChild('modal') private modal!: ModalComponent;
  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

  protected readonly HapticImpact = HapticImpact;
  protected title = '';
  protected confirmText = '';
  protected placeholder = '';
  protected maxLength = 50;
  protected value = '';

  private resolveCallback?: (value: string | null) => void;

  /** Resolves with the trimmed text, or `null` when the dialog is dismissed. */
  open(options: PromptModalOptions): Promise<string | null> {
    this.title = options.title;
    this.confirmText = options.confirmText;
    this.placeholder = options.placeholder ?? '';
    this.maxLength = options.maxLength ?? 50;
    this.value = options.initialValue ?? '';

    this.modal.show();
    setTimeout(() => this.inputRef?.nativeElement.focus());

    return new Promise<string | null>((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  protected confirm(): void {
    const trimmed = this.value.trim();
    if (!trimmed) return;

    this.resolve(trimmed);
    this.modal.hide();
  }

  protected cancel(): void {
    this.modal.hide();
  }

  protected onHidden(): void {
    this.resolve(null);
  }

  private resolve(value: string | null): void {
    if (!this.resolveCallback) return;

    const callback = this.resolveCallback;
    this.resolveCallback = undefined;
    callback(value);
  }
}
