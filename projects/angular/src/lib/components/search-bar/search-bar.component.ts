import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

/**
 * Presentational search field: a leading search icon, a text input and a clear
 * button that appears once there is text. Two-way bind the query with
 * `[(value)]`, `ngModel` or a form control; typing is debounced, clearing is applied immediately.
 *
 * Self-contained (no app imports): the icon is a class string echoed onto an
 * `<i>`. Tune the look with the `--fy-search-bar-*` custom properties.
 *
 * Anything marked `searchBarTrailing` is projected after the clear button, at
 * the end edge of the field — e.g. the filter toggle of `<fy-search-panel>`.
 *
 * ```html
 * <fy-search-bar [(value)]="query" placeholder="Search" />
 * ```
 */
@Component({
  selector: 'fy-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  imports: [HapticFeedbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fy-search-bar' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SearchBarComponent), multi: true }],
})
export class SearchBarComponent implements ControlValueAccessor {
  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  /** Current query. Updated `debounce` ms after the user stops typing. */
  readonly value = model('');

  readonly placeholder = input('');
  /** `aria-label` for the input; falls back to `placeholder`. */
  readonly ariaLabel = input<string>();
  /** `aria-label` for the clear button; `clear` of the UI labels when not given. */
  readonly clearLabel = input<string>();
  /** Icon class for the leading icon; `search` of the icons when not given, empty hides it. */
  readonly icon = input<string>();

  protected readonly iconClass = computed(() => this.icon() ?? this.icons.search);
  /** Delay in ms before a typed query is written to `value`. */
  readonly debounce = input(150);

  /** What is shown in the field; runs ahead of `value` while debouncing. */
  protected readonly text = linkedSignal(() => this.value());

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private timer?: ReturnType<typeof setTimeout>;

  /** Disabled state pushed by a form control. */
  protected readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onInput(text: string): void {
    this.text.set(text);
    clearTimeout(this.timer);
    const delay = this.debounce();
    if (delay > 0) {
      this.timer = setTimeout(() => this.commit(text), delay);
    } else {
      this.commit(text);
    }
  }

  protected clear(): void {
    clearTimeout(this.timer);
    this.text.set('');
    this.commit('');
    this.inputRef().nativeElement.focus();
  }

  writeValue(value: string | null): void {
    clearTimeout(this.timer);
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  private commit(text: string): void {
    if (text === this.value()) return;
    this.value.set(text);
    this.onChange(text);
  }
}
