import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fieldId, FY_FIELD_CONTROL, FY_FORM_FIELD, FyFieldControl } from '../form-field/form-field.token';

/** `numeric` takes digits only, `alphanumeric` letters and digits (upper-cased). */
export type CodeInputKind = 'numeric' | 'alphanumeric';

/**
 * A one-time code drawn as a row of cells. Under the cells is one native input, so the code suggested by the
 * keyboard or the password manager, paste and backspace all work as usual. Anything else typed or pasted
 * (spaces, dashes) is dropped.
 *
 * ```html
 * <fy-form-field label="Code from the app">
 *   <fy-code-input [(ngModel)]="code" name="code" (completed)="submit()" />
 * </fy-form-field>
 * ```
 *
 * Works with `ngModel` and reactive forms, or on its own through `[(value)]`. Tune the look with the
 * `--fy-code-input-*` custom properties.
 */
@Component({
  selector: 'fy-code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeInputComponent), multi: true },
    { provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => CodeInputComponent) }
  ],
  host: {
    class: 'fy-code-input',
    '[class.fy-code-input--invalid]': 'field?.invalid()',
    '[class.fy-code-input--disabled]': 'isDisabled()',
  },
})
export class CodeInputComponent implements ControlValueAccessor, FyFieldControl {
  readonly length = input(6);
  readonly kind = input<CodeInputKind>('numeric');
  readonly autofocus = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** `aria-label` of the input when no `fy-form-field` labels it. */
  readonly ariaLabel = input<string>();

  readonly value = model('');
  /** Emits the code once every cell is filled. */
  readonly completed = output<string>();

  readonly id = signal(fieldId('code'));
  protected readonly field = inject(FY_FORM_FIELD, { optional: true });
  protected readonly focused = signal(false);
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  protected readonly cells = computed(() => Array.from({ length: this.length() }, (_, index) => this.value()[index] ?? ''));
  /** The cell the next character goes to; the last one once the code is full. */
  protected readonly activeCell = computed(() => Math.min(this.value().length, this.length() - 1));

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInput(input: HTMLInputElement): void {
    const code = this.clean(input.value);
    // Rewrite the input even when the code did not change, so a dropped character does not stay on screen.
    input.value = code;
    this.update(code);
  }

  /** Keeps the caret at the end, so typing always fills the next cell. */
  protected keepCaretAtEnd(input: HTMLInputElement): void {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  writeValue(value: string | null): void {
    this.value.set(this.clean(value ?? ''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledByForm.set(disabled);
  }

  private update(code: string): void {
    if (code === this.value()) return;
    this.value.set(code);
    this.onChange(code);
    if (code.length === this.length()) this.completed.emit(code);
  }

  private clean(text: string): string {
    const kept = this.kind() === 'numeric' ? text.replace(/\D/g, '') : text.replace(/[^\da-z]/gi, '').toUpperCase();
    return kept.slice(0, this.length());
  }
}
