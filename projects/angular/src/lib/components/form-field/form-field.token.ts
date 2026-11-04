import { InjectionToken, Signal } from '@angular/core';

/** What `fy-form-field` needs from the control inside it. */
export interface FyFieldControl {
  /** Id of the native element, for the label's `for`. */
  readonly id: Signal<string>;
  /** Characters typed, for the counter. */
  readonly valueLength?: Signal<number>;
  /** `maxlength` of the native element, for the counter; null without one. */
  readonly maxLength?: Signal<number | null>;
}

/** What a control needs from the `fy-form-field` around it. */
export interface FyFormFieldContext {
  /** Ids of the hint and the error under the field, for `aria-describedby`; null when there is neither. */
  readonly describedBy: Signal<string | null>;
  readonly invalid: Signal<boolean>;
  readonly required: Signal<boolean>;
}

export const FY_FIELD_CONTROL = new InjectionToken<FyFieldControl>('FY_FIELD_CONTROL');
export const FY_FORM_FIELD = new InjectionToken<FyFormFieldContext>('FY_FORM_FIELD');

let nextId = 0;

/** A unique id for an element of a field, e.g. `fy-field-3-hint`. */
export function fieldId(part: string): string {
  return `fy-field-${++nextId}-${part}`;
}
