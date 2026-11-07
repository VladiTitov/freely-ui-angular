import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  booleanAttribute,
  signal
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { fieldId, FY_FIELD_CONTROL, FY_FORM_FIELD, FyFieldControl } from './form-field.token';

/** `outline` — a bordered box of its own, `plain` — no border or fill, for a row inside a card the page draws. */
export type TextFieldAppearance = 'outline' | 'plain';

/** Shared by the single- and the multi-line field: the id, the length and the attributes `fy-form-field` asks for. */
@Directive()
abstract class FieldControlBase implements FyFieldControl {
  readonly appearance = input<TextFieldAppearance>('outline');

  protected readonly element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  private readonly field = inject(FY_FORM_FIELD, { optional: true });
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly id = signal(this.element.id || fieldId('control'));
  readonly valueLength = signal(0);
  readonly maxLength = signal<number | null>(null);

  constructor() {
    if (!this.element.id) this.element.id = this.id();

    // Attributes, not host bindings: outside a field the page's own aria-* stay as they are.
    const field = this.field;
    if (field) {
      effect(() => {
        setAttribute(this.element, 'aria-describedby', field.describedBy());
        setAttribute(this.element, 'aria-invalid', field.invalid() ? 'true' : null);
        setAttribute(this.element, 'aria-required', field.required() ? 'true' : null);
      });
    }

    const measure = () => this.measure();
    this.element.addEventListener('input', measure);
    this.destroyRef.onDestroy(() => this.element.removeEventListener('input', measure));

    afterNextRender(() => {
      measure();
      // The form control is known only once the form directive has its inputs, so not in the constructor. A value it
      // writes fires no `input`, but the element has it before `valueChanges` emits, so measure right away.
      const subscription = this.ngControl?.valueChanges?.subscribe(measure);
      this.destroyRef.onDestroy(() => subscription?.unsubscribe());
    });
  }

  protected measure(): void {
    this.valueLength.set(this.element.value.length);
    const max = this.element.maxLength;
    this.maxLength.set(max >= 0 ? max : null);
  }
}

/**
 * A single-line text field on the native `<input>`, so `formControlName`, `ngModel`, `type` and `autocomplete`
 * work as usual. Inside `fy-form-field` it is labelled and described by the field.
 *
 * ```html
 * <input fyTextField type="email" formControlName="email" />
 * <input fyTextField appearance="plain" [(ngModel)]="price" placeholder="Price" />
 * ```
 *
 * `revealable` on a password inside `fy-form-field` adds a button that shows the password as plain text:
 *
 * ```html
 * <fy-form-field label="Password">
 *   <input fyTextField type="password" revealable autocomplete="current-password" formControlName="password" />
 * </fy-form-field>
 * ```
 *
 * Styled by `base.css` (`.fy-text-field`); tune with the `--fy-text-field-*` custom properties.
 */
@Directive({
  selector: 'input[fyTextField]',
  providers: [{ provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => TextFieldDirective) }],
  host: {
    class: 'fy-text-field',
    '[class.fy-text-field--plain]': 'appearance() === "plain"',
    '[class.fy-text-field--revealable]': 'revealable()',
  },
})
export class TextFieldDirective extends FieldControlBase {
  /** Lets `fy-form-field` show the password as plain text. Only for `type="password"`. */
  readonly revealable = input(false, { transform: booleanAttribute });
  private readonly shown = signal(false);
  readonly revealed = this.shown.asReadonly();

  constructor() {
    super();
    // The type is the page's attribute; it is switched only while the password may be shown.
    effect(() => {
      if (this.revealable()) (this.element as HTMLInputElement).type = this.shown() ? 'text' : 'password';
    });
  }

  toggleReveal(): void {
    if (this.revealable()) this.shown.update(shown => !shown);
  }
}

/**
 * A multi-line text field on the native `<textarea>` that grows with its text up to
 * `--fy-textarea-max-height` (and scrolls past it). Put it in `<fy-form-field counter>` to show the length
 * against its `maxlength`.
 *
 * ```html
 * <textarea fyTextarea formControlName="note" rows="1" maxlength="500"></textarea>
 * ```
 *
 * `autosize="false"` keeps the height the page gives it, e.g. for an editor that fills its panel.
 */
@Directive({
  selector: 'textarea[fyTextarea]',
  providers: [{ provide: FY_FIELD_CONTROL, useExisting: forwardRef(() => TextareaDirective) }],
  host: {
    class: 'fy-text-field fy-textarea',
    '[class.fy-text-field--plain]': 'appearance() === "plain"',
    '[class.fy-textarea--autosize]': 'autosize()',
  },
})
export class TextareaDirective extends FieldControlBase {
  readonly autosize = input(true, { transform: booleanAttribute });

  /** Browsers that size a textarea to its content in CSS need no script. */
  private static readonly sizesInCss = typeof CSS !== 'undefined' && CSS.supports?.('field-sizing', 'content');

  protected override measure(): void {
    super.measure();
    if (!this.autosize() || TextareaDirective.sizesInCss) return;

    const element = this.element;
    element.style.height = 'auto';
    const borders = element.offsetHeight - element.clientHeight;
    element.style.height = `${element.scrollHeight + borders}px`;
  }
}

function setAttribute(element: HTMLElement, name: string, value: string | null): void {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
