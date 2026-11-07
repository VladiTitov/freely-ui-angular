import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { FY_LABELS } from '../../providers/fy-labels';
import { FY_FIELD_CONTROL, FyFieldControl } from '../form-field/form-field.token';
import { TextFieldAppearance } from '../form-field/text-field.directive';
import { NumberFieldComponent } from '../number-field/number-field.component';

/** Both ends of a range; null leaves that end open. */
export interface NumberRange {
  min: number | null;
  max: number | null;
}

/** Set by the range field's validator while `min` is above `max`. */
export interface RangeFieldError {
  fyRange: NumberRange;
}

function optionalNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/** True when both ends are set and the lower one is above the upper one. */
export function isReversedRange(range: NumberRange | null | undefined): boolean {
  return range?.min != null && range.max != null && range.min > range.max;
}

/**
 * A "from – to" pair of number fields, e.g. a budget filter. Either end may stay empty. While the lower end is
 * above the upper one both fields are marked invalid and a bound form gets the `fyRange` error.
 *
 * ```html
 * <fy-form-field label="Budget" [error]="budget.hasError('fyRange') ? 'From is above to' : null">
 *   <fy-range-field [formControl]="budget" [min]="0" [decimals]="2" suffix="BYN" />
 * </fy-form-field>
 * ```
 *
 * `min`, `max`, `step`, `decimals` and `locale` apply to both fields, as in `fy-number-field`. The fields are named
 * by `fromLabel` / `toLabel`, or by `rangeFrom` / `rangeTo` of the UI labels, which also fill the placeholders.
 */
@Component({
  selector: 'fy-range-field',
  templateUrl: './range-field.component.html',
  styleUrls: ['./range-field.component.css'],
  imports: [NumberFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RangeFieldComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => RangeFieldComponent), multi: true },
    { provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => RangeFieldComponent) }
  ],
  host: {
    class: 'fy-range-field',
    role: 'group',
    '(focusout)': 'onTouched()'
  }
})
export class RangeFieldComponent implements ControlValueAccessor, Validator, FyFieldControl {
  protected readonly labels = inject(FY_LABELS);

  readonly value = model<NumberRange>({ min: null, max: null });

  readonly min = input<number | null, unknown>(null, { transform: optionalNumber });
  readonly max = input<number | null, unknown>(null, { transform: optionalNumber });
  readonly step = input(1, { transform: numberAttribute });
  readonly decimals = input(0, { transform: numberAttribute });
  readonly locale = input<string>();
  readonly prefix = input<string>();
  readonly suffix = input<string>();
  readonly appearance = input<TextFieldAppearance>('outline');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Name and placeholder of the lower field; `rangeFrom` of the UI labels when not given. */
  readonly fromLabel = input<string>();
  /** Name and placeholder of the upper field; `rangeTo` of the UI labels when not given. */
  readonly toLabel = input<string>();

  private readonly fromField = viewChild.required(NumberFieldComponent);
  /** The label of a `fy-form-field` points at the lower field. */
  readonly id = computed(() => this.fromField().id());

  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  protected readonly reversed = computed(() => isReversedRange(this.value()));
  protected readonly fromText = computed(() => this.fromLabel() ?? this.labels().rangeFrom);
  protected readonly toText = computed(() => this.toLabel() ?? this.labels().rangeTo);

  private onChange: (value: NumberRange) => void = () => {};
  protected onTouched: () => void = () => {};

  protected setEnd(end: keyof NumberRange, number: number | null): void {
    const current = this.value();
    if (current[end] === number) return;
    const next = { ...current, [end]: number };
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: NumberRange | null): void {
    this.value.set({ min: value?.min ?? null, max: value?.max ?? null });
  }

  registerOnChange(fn: (value: NumberRange) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledByForm.set(disabled);
  }

  validate(control: AbstractControl<NumberRange | null>): ValidationErrors | null {
    const range = control.value;
    return isReversedRange(range) ? ({ fyRange: { min: range!.min, max: range!.max } } satisfies RangeFieldError) : null;
  }
}
