import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DROPDOWN_MENU } from '../dropdown-menu';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';

/** One entry of a {@link SelectFieldComponent}. */
export interface SelectFieldOption<T = string> {
  value: T;
  label: string;
}

/**
 * Field that shows the picked option and opens a menu of all options. The
 * first option is the default: `value` falls back to it, `reset()` returns to
 * it, and `isDefault()` tells whether the field differs from it — which lets a
 * `<fy-search-panel>` count and reset its filters. The popup is `<fy-dropdown-menu>`.
 *
 * Self-contained (no app imports besides `shared/dropdown-menu`). Tune the look
 * with the `--fy-select-field-*` custom properties.
 *
 * ```html
 * <fy-select-field label="Status" [options]="statuses" [(value)]="status" />
 * <fy-select-field label="Status" [options]="statuses" formControlName="status" />
 * ```
 */
@Component({
  selector: 'fy-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.css'],
  imports: [HapticFeedbackDirective, DROPDOWN_MENU],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fy-select-field' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectFieldComponent), multi: true }],
})
export class SelectFieldComponent<T = string> implements ControlValueAccessor {
  protected readonly HapticImpact = HapticImpact;
  protected readonly icons = inject(FY_ICONS);

  readonly options = input<readonly SelectFieldOption<T>[]>([]);
  /** Picked value; a value missing from `options` means the first option. */
  readonly value = model<T | null>(null);
  /** Caption above the field; also the `aria-label` of the menu. */
  readonly label = input('');
  /** Names the field for assistive tech when it has no visible `label`. */
  readonly ariaLabel = input('');
  /** Which side of the field the menu opens on. */
  readonly direction = input<'down' | 'up'>('down');

  /** The option in effect. */
  protected readonly current = computed<SelectFieldOption<T> | undefined>(() => {
    const options = this.options();
    const value = this.value();
    return options.find(option => option.value === value) ?? options[0];
  });

  protected readonly name = computed(() => this.label() || this.ariaLabel());

  /** Disabled state pushed by a form control. */
  protected readonly formDisabled = signal(false);
  private onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  /** Whether the first option is in effect. */
  readonly isDefault = computed(() => this.current() === this.options()[0]);

  /** Picks the first option. */
  reset(): void {
    const first = this.options()[0];
    if (first && !this.isDefault()) this.pick(first.value);
  }

  protected pick(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
