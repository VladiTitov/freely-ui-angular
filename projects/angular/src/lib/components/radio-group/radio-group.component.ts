import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnInit,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FY_HAPTICS, HapticFeedback, playHaptic } from '../../haptics/haptics';

/** `dot` — a round mark before each option, `plain` — the options only, for a page that draws them itself. */
export type RadioGroupAppearance = 'dot' | 'plain';

/**
 * One choice of `fy-radio-group`. The element itself is the radio, so a class of the page styles it,
 * and `aria-checked` or `.fy-radio--checked` tells the picked one.
 */
@Component({
  selector: 'fy-radio',
  template: `
    @if (group.appearance() === 'dot') {
      <span class="fy-radio__dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styleUrls: ['./radio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-radio',
    role: 'radio',
    '[class.fy-radio--checked]': 'checked()',
    '[class.fy-radio--dot]': 'group.appearance() === "dot"',
    '[class.fy-radio--disabled]': 'isDisabled()',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.tabindex]': 'tabStop() ? 0 : -1',
    '(click)': 'pick()',
    '(keydown.space)': 'pick(); $event.preventDefault()',
    '(keydown.enter)': 'pick(); $event.preventDefault()',
  },
})
export class RadioComponent implements OnInit {
  readonly value = input.required<unknown>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(RadioGroupComponent);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  // Radios rendered by `@for` get their inputs one view at a time, while the first one already asks the group
  // for its tab stop, which reads `checked` of all of them; reading `value` before it is set throws NG0950.
  private readonly ready = signal(false);

  readonly checked = computed(() => this.ready() && this.group.value() === this.value());
  readonly isDisabled = computed(() => this.disabled() || this.group.isDisabled());
  protected readonly tabStop = computed(() => this.group.isTabStop(this));

  ngOnInit(): void {
    this.ready.set(true);
  }

  protected pick(): void {
    if (!this.isDisabled()) this.group.select(this.value());
  }
}

/**
 * A choice of one option out of a few: `role="radiogroup"` with one tab stop, the arrow keys, Home and End
 * moving the choice, and `selection` haptics. Works with `ngModel` and reactive forms, or on its own through
 * `[(value)]`. Name it with `aria-label` or `aria-labelledby`.
 *
 * ```html
 * <fy-radio-group formControlName="size" aria-label="Size">
 *   <fy-radio value="s">Small</fy-radio>
 *   <fy-radio value="m">Medium</fy-radio>
 * </fy-radio-group>
 *
 * <fy-radio-group class="tiles" appearance="plain" [(value)]="theme" aria-label="Theme">
 *   @for (option of themes; track option.value) {
 *     <fy-radio class="tile" [value]="option.value"><i [class]="option.icon"></i>{{ option.label }}</fy-radio>
 *   }
 * </fy-radio-group>
 * ```
 *
 * Tune the look with the `--fy-radio-*` custom properties.
 */
@Component({
  selector: 'fy-radio-group',
  template: '<ng-content />',
  styles: ':host { display: flex; flex-direction: column; gap: var(--fy-radio-group-gap, var(--fy-space-m)); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroupComponent), multi: true }],
  host: {
    class: 'fy-radio-group',
    role: 'radiogroup',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onTouched()',
  },
})
export class RadioGroupComponent implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  readonly appearance = input<RadioGroupAppearance>('dot');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Haptic feedback played when the user changes the choice; `null` turns it off. */
  readonly haptic = input<HapticFeedback | null>('selection');

  private readonly radios = contentChildren(RadioComponent, { descendants: true });
  private readonly haptics = inject(FY_HAPTICS);
  private readonly disabledByForm = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  private onChange: (value: unknown) => void = () => {};
  protected onTouched: () => void = () => {};

  /** The picked radio takes the tab stop; with none picked, the first one that can be picked. */
  isTabStop(radio: RadioComponent): boolean {
    const enabled = this.radios().filter(r => !r.isDisabled());
    const stop = enabled.find(r => r.checked()) ?? enabled[0];
    return stop === radio;
  }

  select(value: unknown): void {
    if (value === this.value()) return;
    const feedback = this.haptic();
    if (feedback) playHaptic(this.haptics, feedback);
    this.value.set(value);
    this.onChange(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const radios = this.radios().filter(r => !r.isDisabled());
    const current = radios.findIndex(r => r.element === event.target);
    if (current < 0 || !radios.length) return;

    const last = radios.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowRight: current + 1,
      ArrowUp: current - 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const target = radios[(next + radios.length) % radios.length];
    this.select(target.value());
    target.element.focus();
  }

  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabledByForm.set(disabled);
  }
}

export const RADIO_GROUP = [RadioGroupComponent, RadioComponent] as const;
