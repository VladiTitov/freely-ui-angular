import { ChangeDetectionStrategy, Component, forwardRef, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HapticFeedback, playHaptic, FY_HAPTICS } from '../../haptics/haptics';

@Component({
  selector: 'fy-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true }],
})
export class SwitchComponent implements ControlValueAccessor {
  readonly checked = model(false);
  readonly disabled = input(false);
  /** `aria-label` for the checkbox when there is no wrapping `<label>`. */
  readonly ariaLabel = input<string>();
  /** Haptic feedback played when the user flips the switch; `null` disables it. */
  readonly haptic = input<HapticFeedback | null>('selection');

  private readonly haptics = inject(FY_HAPTICS);

  /** Disabled state pushed by a form control; OR-ed with the `disabled` input. */
  protected readonly formDisabled = signal(false);

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected toggle(value: boolean): void {
    const feedback = this.haptic();
    if (feedback) playHaptic(this.haptics, feedback);
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

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
