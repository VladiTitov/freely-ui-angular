import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  LOCALE_ID,
  model,
  numberAttribute,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fieldId, FY_FIELD_CONTROL, FY_FORM_FIELD, FyFieldControl } from '../form-field/form-field.token';
import { TextFieldAppearance } from '../form-field/text-field.directive';
import { formatNumber, numberSymbols, NumberTextOptions, readNumberEdit } from './number-text';

function optionalNumber(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/**
 * A field for an amount: digits are grouped as the user types (`1 234 567` in Russian, `1,234,567` in English),
 * both `,` and `.` work as the decimal separator, and the value is a `number`, or `null` while the field is empty.
 * `min` and `max` are applied when the field loses focus; the arrow keys step the value by `step`.
 *
 * ```html
 * <fy-form-field label="Price">
 *   <fy-number-field formControlName="price" [decimals]="2" [min]="0" suffix="BYN" />
 * </fy-form-field>
 * ```
 *
 * Works with `ngModel` and reactive forms, or on its own through `[(value)]`. Separators follow `locale`, or
 * `LOCALE_ID` without it. Styled like `fyTextField`, so the `--fy-text-field-*` custom properties tune it too.
 */
@Component({
  selector: 'fy-number-field',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberFieldComponent), multi: true },
    { provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => NumberFieldComponent) }
  ],
  host: {
    class: 'fy-number-field',
    '[class.fy-number-field--plain]': 'appearance() === "plain"',
    '[class.fy-number-field--invalid]': 'isInvalid()',
    '[class.fy-number-field--disabled]': 'isDisabled()',
    '(click)': 'onHostClick($event)'
  }
})
export class NumberFieldComponent implements ControlValueAccessor, FyFieldControl {
  readonly value = model<number | null>(null);

  /** Smallest value; with none below 0 the field takes no minus. Applied on blur. */
  readonly min = input<number | null, unknown>(null, { transform: optionalNumber });
  /** Largest value. Applied on blur. */
  readonly max = input<number | null, unknown>(null, { transform: optionalNumber });
  /** What the arrow keys add or take away. */
  readonly step = input(1, { transform: numberAttribute });
  /** Digits after the decimal separator; 0 takes whole numbers only. */
  readonly decimals = input(0, { transform: numberAttribute });
  /** Locale of the separators; `LOCALE_ID` when not given. */
  readonly locale = input<string>();
  /** Text before the number, e.g. `$`. */
  readonly prefix = input<string>();
  /** Text after the number, e.g. a currency code or a unit. */
  readonly suffix = input<string>();
  readonly placeholder = input('');
  readonly appearance = input<TextFieldAppearance>('outline');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Marks the field invalid on its own, e.g. for a range the field is part of. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** `aria-label` of the input when no `fy-form-field` labels it. */
  readonly ariaLabel = input<string>();

  readonly id = signal(fieldId('number'));
  protected readonly field = inject(FY_FORM_FIELD, { optional: true });
  private readonly defaultLocale = inject(LOCALE_ID);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('control');

  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  protected readonly isInvalid = computed(() => this.invalid() || !!this.field?.invalid());

  private readonly options = computed<NumberTextOptions>(() => {
    const min = this.min();
    return {
      symbols: numberSymbols(this.locale() ?? this.defaultLocale),
      decimals: Math.max(0, Math.floor(this.decimals())),
      negative: min === null || min < 0
    };
  });

  /** Negative numbers type in from the full keyboard: the numeric ones have no minus on iOS. */
  protected readonly inputMode = computed(() => {
    const options = this.options();
    if (options.negative) return 'text';
    return options.decimals > 0 ? 'decimal' : 'numeric';
  });

  /** What the input shows; follows `value` unless the user is typing a number it cannot show yet, e.g. `12,`. */
  protected readonly text = signal('');
  /** The number as read out, with its prefix and suffix, e.g. `1 250 BYN`. */
  protected readonly valueText = computed(() => {
    if (!this.text()) return null;
    return [this.prefix(), this.text(), this.suffix()].filter(Boolean).join(' ');
  });

  private onChange: (value: number | null) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // A value written from outside, or a new locale or precision, rewrites the text. A value the user typed
    // already matches it and leaves it alone, so `12,` keeps its comma.
    let shownWith: NumberTextOptions | null = null;
    effect(() => {
      const value = this.value();
      const options = this.options();
      untracked(() => {
        if (options !== shownWith || this.parse(this.text()) !== value) this.text.set(formatNumber(value, options));
        shownWith = options;
      });
    });
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  protected onInput(input: HTMLInputElement): void {
    const edit = readNumberEdit(this.text(), input.value, input.selectionStart ?? input.value.length, this.options());
    // Write the input even when the text did not change, so a dropped character does not stay on screen.
    input.value = edit.text;
    input.setSelectionRange(edit.caret, edit.caret);
    this.text.set(edit.text);
    this.update(edit.value);
  }

  protected onBlur(): void {
    const value = this.normalize(this.value());
    this.text.set(formatNumber(value, this.options()));
    this.update(value);
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const step = event.key === 'ArrowUp' ? this.step() : -this.step();
    const value = this.normalize((this.value() ?? 0) + step);
    this.text.set(formatNumber(value, this.options()));
    this.update(value);
  }

  protected onHostClick(event: MouseEvent): void {
    if (event.target !== this.inputRef().nativeElement && !this.isDisabled()) this.focus();
  }

  writeValue(value: number | null): void {
    const number = typeof value === 'number' && Number.isFinite(value) ? value : null;
    this.text.set(formatNumber(number, this.options()));
    this.value.set(number);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledByForm.set(disabled);
  }

  private update(value: number | null): void {
    if (value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  /** Clamps to `min`/`max` and rounds to `decimals`. */
  private normalize(value: number | null): number | null {
    if (value === null) return null;
    const min = this.min();
    const max = this.max();
    let result = value;
    if (min !== null && result < min) result = min;
    if (max !== null && result > max) result = max;
    const factor = 10 ** this.options().decimals;
    result = Math.round(result * factor) / factor;
    return result === 0 ? 0 : result;
  }

  private parse(text: string): number | null {
    return readNumberEdit('', text, text.length, this.options()).value;
  }
}
