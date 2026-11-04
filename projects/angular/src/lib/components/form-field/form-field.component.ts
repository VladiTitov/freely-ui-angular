import { booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, input } from '@angular/core';
import { fieldId, FY_FIELD_CONTROL, FY_FORM_FIELD, FyFormFieldContext } from './form-field.token';

/**
 * A label, the control and a line under it for a hint, an error or the length. The label points at the
 * control and the control is described by the hint or the error, so nothing needs ids of its own.
 *
 * ```html
 * <fy-form-field label="Email" hint="We never share it." [error]="emailError()" required>
 *   <input fyTextField type="email" formControlName="email" />
 * </fy-form-field>
 *
 * <fy-form-field label="Note" counter>
 *   <textarea fyTextarea formControlName="note" maxlength="500"></textarea>
 * </fy-form-field>
 *
 * <fy-form-field label="Code">
 *   <fy-code-input [(ngModel)]="code" />
 * </fy-form-field>
 * ```
 *
 * `error` replaces the hint while it is set and marks the control invalid. `required` only marks the label
 * and the control for assistive tech; validation stays with the form. Tune the look with the
 * `--fy-form-field-*` custom properties.
 */
@Component({
  selector: 'fy-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FY_FORM_FIELD, useExisting: forwardRef(() => FormFieldComponent) }],
  host: {
    class: 'fy-form-field',
    '[class.fy-form-field--invalid]': 'invalid()',
  },
})
export class FormFieldComponent implements FyFormFieldContext {
  readonly label = input<string>();
  readonly hint = input<string | null>();
  /** Shown instead of the hint while set; makes the control invalid. */
  readonly error = input<string | null>();
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows the length of the text, against `maxlength` when the control has one. */
  readonly counter = input(false, { transform: booleanAttribute });

  protected readonly control = contentChild(FY_FIELD_CONTROL);
  protected readonly hintId = fieldId('hint');
  protected readonly errorId = fieldId('error');

  readonly invalid = computed(() => !!this.error());
  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId;
    return this.hint() ? this.hintId : null;
  });

  protected readonly count = computed(() => {
    const control = this.control();
    if (!this.counter() || !control?.valueLength) return null;
    const max = control.maxLength?.();
    return max === null || max === undefined ? `${control.valueLength()}` : `${control.valueLength()} / ${max}`;
  });
}
