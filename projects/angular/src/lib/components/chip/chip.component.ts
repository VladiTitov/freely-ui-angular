import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, forwardRef, inject, input, model, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

/** `s` — dense rows and cards, `m` — default, `l` — a row of choices to tap. */
export type ChipSize = 's' | 'm' | 'l';

/** Which app background the chip is filled with; pick the one that differs from the surface under it. */
export type ChipSurface = 'secondary' | 'tertiary';

/**
 * A pill with a short label: a tag, a status, a person, a choice.
 * Use `<fy-chip>` for a static one and `<button fyChip>` for one that can be tapped.
 *
 * ```html
 * <fy-chip muted><i chipLeading class="bi bi-lock"></i>Only me</fy-chip>
 *
 * <button fyChip type="button" size="l" muted [selected]="active" (click)="pick()">Holiday</button>
 *
 * <fy-chip size="s" surface="secondary" removable (remove)="drop()">
 *   <fy-user-avatar chipAvatar [fullName]="name" [size]="26" />{{ name }}
 * </fy-chip>
 *
 * <fy-chip iconOnly surface="secondary"><i class="bi bi-plus-lg"></i></fy-chip>
 * ```
 *
 * The label stays on one line and is cut with an ellipsis when the chip runs out of room.
 * `removable` renders its own button, so it is meant for `<fy-chip>`, not `<button fyChip>`.
 * A `<button fyChip>` bound to `ngModel` or a form control is a toggle that flips `selected` on tap by itself.
 * Tune the look with the `--fy-chip-*` custom properties.
 */
@Component({
  selector: 'fy-chip, button[fyChip]',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HapticFeedbackDirective],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChipComponent), multi: true }],
  host: {
    '[class.fy-chip--s]': 'size() === "s"',
    '[class.fy-chip--l]': 'size() === "l"',
    '[class.fy-chip--secondary]': 'surface() === "secondary"',
    '[class.fy-chip--muted]': 'muted()',
    '[class.fy-chip--selected]': 'selected()',
    '[class.fy-chip--icon]': 'iconOnly()',
    '[attr.aria-pressed]': 'selected() ?? null',
    '(click)': 'onClick()',
  },
})
export class ChipComponent implements ControlValueAccessor {
  readonly size = input<ChipSize>('m');
  readonly surface = input<ChipSurface>('tertiary');
  /** Secondary text colour, for chips that only annotate what is next to them. */
  readonly muted = input(false, { transform: booleanAttribute });
  /** Pressed state of a `<button fyChip>` that works as a toggle; leave unset for a plain chip. */
  readonly selected = model<boolean>();
  /** A round chip around a single icon. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Adds a cross after the label that emits `remove`. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** `aria-label` of the cross; `remove` of the UI labels when not given. */
  readonly removeLabel = input<string>();

  readonly remove = output<void>();

  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Set once a form binds the chip: only then a tap flips it, otherwise the page handles the tap. */
  private onChange: ((value: boolean) => void) | null = null;
  private onTouched: () => void = () => {};

  protected onClick(): void {
    if (!this.onChange) return;
    const value = !this.selected();
    this.selected.set(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: boolean | null): void {
    this.selected.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    // Only a form disables the chip this way, so a page's own `[disabled]` stays untouched otherwise.
    if (this.element instanceof HTMLButtonElement) this.element.disabled = disabled;
  }
}
