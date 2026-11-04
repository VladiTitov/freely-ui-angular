import { formatDate } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  LOCALE_ID,
  model,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipComponent, ChipSurface } from '../chip/chip.component';
import { fieldId, FY_FIELD_CONTROL, FY_FORM_FIELD, FyFieldControl } from '../form-field/form-field.token';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

/**
 * A date shown as a chip; a tap opens the system date picker. The value is an ISO date (`2027-03-12`) or an
 * empty string, as the native `<input type="date">` keeps it.
 *
 * ```html
 * <fy-date-picker formControlName="date" min="2026-01-01" />
 * <fy-date-picker [(value)]="date" format="d MMMM y" locale="ru" placeholder="Pick a date" />
 * ```
 *
 * Without a date it shows `placeholder`, or the `add` icon when there is none. The date is formatted with
 * Angular's `formatDate`, in `LOCALE_ID` unless `locale` is given. Works with `ngModel` and reactive forms.
 */
@Component({
  selector: 'fy-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChipComponent],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true },
    { provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => DatePickerComponent) }
  ],
  host: {
    class: 'fy-date-picker',
    '[class.fy-date-picker--invalid]': 'isInvalid()',
    '[class.fy-date-picker--disabled]': 'isDisabled()',
  },
})
export class DatePickerComponent implements ControlValueAccessor, FyFieldControl {
  readonly value = model('');
  /** Earliest and latest dates the picker offers, as ISO dates. */
  readonly min = input<string>();
  readonly max = input<string>();
  /** `formatDate` format of the shown date. */
  readonly format = input('longDate');
  readonly locale = input<string>();
  readonly placeholder = input<string>();
  readonly surface = input<ChipSurface>('secondary');
  /** Marks the chip invalid; inside `fy-form-field` its `error` does it. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** `aria-label` of the input while empty and once a date is picked; `pickDate` / `changeDate` of the labels when not given. */
  readonly pickLabel = input<string>();
  readonly changeLabel = input<string>();

  readonly id = signal(fieldId('date'));
  protected readonly icons = inject(FY_ICONS);
  protected readonly labels = inject(FY_LABELS);
  protected readonly field = inject(FY_FORM_FIELD, { optional: true });
  private readonly appLocale = inject(LOCALE_ID);
  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  protected readonly isInvalid = computed(() => this.invalid() || !!this.field?.invalid());

  /** The picked date as the page shows it, or null without one. */
  protected readonly text = computed(() => {
    const date = parseIsoDate(this.value());
    return date ? formatDate(date, this.format(), this.locale() ?? this.appLocale) : null;
  });

  protected readonly accessibleName = computed(() =>
    this.text()
      ? this.changeLabel() ?? this.labels().changeDate
      : this.pickLabel() ?? this.labels().pickDate
  );

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onPick(input: HTMLInputElement): void {
    this.value.set(input.value);
    this.onChange(input.value);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
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
}

/** `2027-03-12` as midnight of that day in the local time zone (`new Date(iso)` would take UTC); null otherwise. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  return new Date(year, month - 1, day);
}
