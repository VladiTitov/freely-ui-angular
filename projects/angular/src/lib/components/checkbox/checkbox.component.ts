import { booleanAttribute, ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FY_HAPTICS, HapticFeedback, playHaptic } from '../../haptics/haptics';
import { FY_ICONS } from '../../providers/fy-icons';

/**
 * A checkbox with its label, on the native `<input type="checkbox">`, so the label, the keyboard and the form
 * behave as usual. Works with `ngModel` and reactive forms, or on its own through `[(checked)]`.
 *
 * ```html
 * <fy-checkbox [(checked)]="saved">I have saved the codes</fy-checkbox>
 * <fy-checkbox formControlName="terms">I accept the terms</fy-checkbox>
 * ```
 *
 * Tune the look with the `--fy-checkbox-*` custom properties.
 */
@Component({
  selector: 'fy-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true }],
  host: {
    class: 'fy-checkbox',
    '[class.fy-checkbox--disabled]': 'isDisabled()',
  },
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model(false);
  /** Neither on nor off, e.g. "select all" over a partly picked list; cleared by the next tap. */
  readonly indeterminate = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** `aria-label` when the checkbox has no label text. */
  readonly ariaLabel = input<string>();
  /** Haptic feedback played when the user ticks it; `null` turns it off. */
  readonly haptic = input<HapticFeedback | null>('selection');

  protected readonly icons = inject(FY_ICONS);
  private readonly haptics = inject(FY_HAPTICS);
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected toggle(value: boolean): void {
    const feedback = this.haptic();
    if (feedback) playHaptic(this.haptics, feedback);
    this.indeterminate.set(false);
    this.checked.set(value);
    this.onChange(value);
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledByForm.set(disabled);
  }
}
