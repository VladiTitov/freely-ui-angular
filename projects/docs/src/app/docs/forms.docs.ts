import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CheckboxComponent,
  CodeInputComponent,
  DatePickerComponent,
  FormFieldComponent,
  NumberFieldComponent,
  NumberRange,
  RADIO_GROUP,
  RangeFieldComponent,
  SelectFieldComponent,
  SelectFieldOption,
  SwitchComponent,
  TextareaDirective,
  TextFieldDirective
} from '@freely-ui/angular';
import { JsonPipe } from '@angular/common';
import { ComponentDoc } from './doc.model';
import { COLUMN, ROW } from './example-styles';

const textField = `
<fy-form-field label="Name" hint="As your friends know you." required>
  <input fyTextField type="text" autocomplete="name" [(ngModel)]="name" />
</fy-form-field>

<fy-form-field label="Email" [error]="email.includes('@') ? null : 'Enter an email address.'">
  <input fyTextField type="email" autocomplete="email" [(ngModel)]="email" />
</fy-form-field>
`;

@Component({ selector: 'docs-text-field', imports: [FormFieldComponent, TextFieldDirective, FormsModule], template: textField, host: COLUMN })
class TextFieldExample {
  protected name = '';
  protected email = 'ada';
}

const textFieldPlain = `
<div class="card">
  <input fyTextField appearance="plain" placeholder="Wish title" />
</div>
`;

@Component({
  selector: 'docs-text-field-plain',
  imports: [TextFieldDirective],
  template: textFieldPlain,
  host: COLUMN,
  styles: `.card { padding: 14px 18px; border-radius: var(--fy-radius-lg); background: var(--fy-tertiary-background); }`,
})
class TextFieldPlainExample {}

const password = `
<fy-form-field label="Password" hint="The eye shows what you typed.">
  <input fyTextField type="password" revealable autocomplete="new-password" [(ngModel)]="password" />
</fy-form-field>
`;

@Component({ selector: 'docs-password', imports: [FormFieldComponent, TextFieldDirective, FormsModule], template: password, host: COLUMN })
class PasswordExample {
  protected password = 'correct horse';
}

const numberField = `
<fy-form-field label="Price" hint="Digits are grouped as you type; a comma or a dot starts the cents.">
  <fy-number-field [(ngModel)]="price" [decimals]="2" [min]="0" [max]="1000000" suffix="BYN" />
</fy-form-field>
<fy-form-field label="Guests">
  <fy-number-field [(ngModel)]="guests" [min]="1" [max]="50" placeholder="How many?" />
</fy-form-field>
<p>Value: {{ price ?? 'null' }} · {{ guests ?? 'null' }}</p>
`;

@Component({ selector: 'docs-number-field', imports: [FormFieldComponent, NumberFieldComponent, FormsModule], template: numberField, host: COLUMN })
class NumberFieldExample {
  protected price: number | null = 1250.5;
  protected guests: number | null = null;
}

const numberFieldPlain = `
<div class="card">
  <fy-number-field appearance="plain" [decimals]="2" [min]="0" prefix="$" placeholder="0.00" ariaLabel="Amount" />
</div>
`;

@Component({
  selector: 'docs-number-field-plain',
  imports: [NumberFieldComponent],
  template: numberFieldPlain,
  host: COLUMN,
  styles: `.card { padding: 14px 18px; border-radius: var(--fy-radius-lg); background: var(--fy-secondary-background); }`,
})
class NumberFieldPlainExample {}

const rangeField = `
<fy-form-field label="Budget" [error]="budget.hasError('fyRange') ? 'From is above to.' : null">
  <fy-range-field [formControl]="budget" [min]="0" [decimals]="2" suffix="BYN" />
</fy-form-field>
<p>Value: {{ budget.value | json }}</p>
`;

@Component({
  selector: 'docs-range-field',
  imports: [FormFieldComponent, RangeFieldComponent, ReactiveFormsModule, JsonPipe],
  template: rangeField,
  host: COLUMN,
})
class RangeFieldExample {
  protected readonly budget = new FormControl<NumberRange>({ min: 20, max: null });
}

const textarea = `
<fy-form-field label="Note" hint="Up to 120 characters." counter>
  <textarea fyTextarea rows="2" maxlength="120" [(ngModel)]="note"></textarea>
</fy-form-field>
`;

@Component({ selector: 'docs-textarea', imports: [FormFieldComponent, TextareaDirective, FormsModule], template: textarea, host: COLUMN })
class TextareaExample {
  protected note = 'The text grows the field as you type.';
}

const codeInput = `
<fy-form-field label="Code from the app">
  <fy-code-input [(ngModel)]="code" (completed)="done.set($event)" />
</fy-form-field>
@if (done(); as code) {
  <p>Completed: {{ code }}</p>
}
`;

@Component({ selector: 'docs-code-input', imports: [FormFieldComponent, CodeInputComponent, FormsModule], template: codeInput, host: COLUMN })
class CodeInputExample {
  protected code = '';
  protected readonly done = signal<string | null>(null);
}

const checkbox = `
<fy-checkbox [(checked)]="terms">I accept the terms</fy-checkbox>
<fy-checkbox [checked]="false" [indeterminate]="true">Some of the items</fy-checkbox>
<fy-checkbox [checked]="true" disabled>Disabled</fy-checkbox>
`;

@Component({ selector: 'docs-checkbox', imports: [CheckboxComponent], template: checkbox, host: COLUMN })
class CheckboxExample {
  protected readonly terms = signal(false);
}

const switchTemplate = `
<label class="row">
  Notifications
  <fy-switch [(checked)]="notifications" />
</label>
<label class="row">
  Disabled
  <fy-switch [checked]="true" [disabled]="true" />
</label>
`;

@Component({
  selector: 'docs-switch',
  imports: [SwitchComponent],
  template: switchTemplate,
  host: COLUMN,
  styles: `.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }`,
})
class SwitchExample {
  protected readonly notifications = signal(true);
}

const radioDot = `
<fy-radio-group [(value)]="size" aria-label="Size">
  <fy-radio value="s">Small</fy-radio>
  <fy-radio value="m">Medium</fy-radio>
  <fy-radio value="l" [disabled]="true">Large (sold out)</fy-radio>
</fy-radio-group>
`;

@Component({ selector: 'docs-radio-dot', imports: [RADIO_GROUP], template: radioDot })
class RadioDotExample {
  protected readonly size = signal<unknown>('m');
}

const radioPlain = `
<fy-radio-group class="tiles" appearance="plain" [(value)]="theme" aria-label="Theme">
  @for (option of themes; track option.value) {
    <fy-radio class="tile" [value]="option.value">
      <i [class]="option.icon" aria-hidden="true"></i>{{ option.label }}
    </fy-radio>
  }
</fy-radio-group>
`;

@Component({
  selector: 'docs-radio-plain',
  imports: [RADIO_GROUP],
  template: radioPlain,
  styles: `
    .tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 120px)); gap: 8px; }
    .tile { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px;
      border: 1.5px solid transparent; border-radius: var(--fy-radius-md); background: var(--fy-tertiary-background); }
    .tile.fy-radio--checked { border-color: var(--fy-accent); color: var(--fy-accent); }
  `,
})
class RadioPlainExample {
  protected readonly themes = [
    { value: 'light', label: 'Light', icon: 'bi bi-sun' },
    { value: 'dark', label: 'Dark', icon: 'bi bi-moon' },
    { value: 'system', label: 'System', icon: 'bi bi-circle-half' },
  ];
  protected readonly theme = signal<unknown>('system');
}

const selectField = `
<fy-select-field label="Sort by" [options]="sorts" [(value)]="sort" />
<p>Picked: {{ sort() }}</p>
`;

@Component({ selector: 'docs-select-field', imports: [SelectFieldComponent], template: selectField, host: COLUMN })
class SelectFieldExample {
  protected readonly sorts: SelectFieldOption[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'name', label: 'By name' },
  ];
  protected readonly sort = signal<string | null>('newest');
}

const datePicker = `
<fy-date-picker [(value)]="date" placeholder="Pick a date" />
<fy-date-picker [(value)]="birthday" format="d MMMM y" max="2026-12-31" />
`;

@Component({ selector: 'docs-date-picker', imports: [DatePickerComponent], template: datePicker, host: ROW })
class DatePickerExample {
  protected readonly date = signal('');
  protected readonly birthday = signal('1990-05-17');
}

const formField = `
<fy-form-field label="Group name" hint="Friends see it in their list." required>
  <input fyTextField type="text" [(ngModel)]="group" />
</fy-form-field>

<fy-form-field label="About the wish" counter [error]="about.length > 120 ? 'Keep it under 120 characters.' : null">
  <textarea fyTextarea rows="1" maxlength="140" [(ngModel)]="about"></textarea>
</fy-form-field>

<fy-form-field label="Confirmation code">
  <fy-code-input [(ngModel)]="code" />
</fy-form-field>
`;

@Component({
  selector: 'docs-form-field',
  imports: [FormFieldComponent, TextFieldDirective, TextareaDirective, CodeInputComponent, FormsModule],
  template: formField,
  host: COLUMN,
})
class FormFieldExample {
  protected group = 'Book club';
  protected about = 'A big mug that keeps tea hot.';
  protected code = '';
}

const FORMS_NOTE = 'Works with ngModel and reactive forms and takes its disabled state from the form.';

export const FORM_DOCS: ComponentDoc[] = [
  {
    slug: 'text-field',
    title: 'Text field',
    group: 'Forms',
    summary: 'A text field on the native input, and the form field that labels it and shows a hint, an error and a counter.',
    imports: `import { FormFieldComponent, TextFieldDirective } from '@freely-ui/angular';`,
    selectors: ['input[fyTextField]', 'fy-form-field'],
    examples: [
      { title: 'With a label, a hint and an error', description: 'The form field points its label at the field and describes the field by the hint or the error.', component: TextFieldExample, code: textField },
      { title: 'Plain', description: 'No box of its own, for a row inside a card the page draws.', component: TextFieldPlainExample, code: textFieldPlain },
      { title: 'Revealable password', description: 'Inside a form field, revealable adds a button that shows the password as plain text.', component: PasswordExample, code: password },
    ],
    inputs: [
      { name: 'appearance', type: "'outline' | 'plain'", default: "'outline'", description: 'fyTextField: a bordered box, or no border and fill.' },
      { name: 'revealable', type: 'boolean', default: 'false', description: 'fyTextField: a password the form field around it lets the user show; type="password" only.' },
      { name: 'label', type: 'string', description: 'fy-form-field: the label above the control.' },
      { name: 'hint', type: 'string | null', description: 'fy-form-field: a line under the control.' },
      { name: 'error', type: 'string | null', description: 'fy-form-field: replaces the hint while set and marks the control invalid.' },
      { name: 'required', type: 'boolean', default: 'false', description: 'fy-form-field: marks the label and the control; validation stays with the form.' },
      { name: 'counter', type: 'boolean', default: 'false', description: 'fy-form-field: shows the length, against maxlength when there is one.' },
    ],
    cssVars: [
      { name: '--fy-text-field-height', default: '44px', description: 'Least height of the field.' },
      { name: '--fy-text-field-background', default: 'var(--fy-primary-background)', description: 'Fill of the field.' },
      { name: '--fy-text-field-border-color', default: 'var(--fy-tertiary-background)', description: 'Border of the field.' },
      { name: '--fy-text-field-focus-color', default: 'var(--fy-accent)', description: 'Border while focused.' },
      { name: '--fy-form-field-label-color', default: 'var(--fy-secondary-text)', description: 'Colour of the label.' },
      { name: '--fy-form-field-reveal-size', default: '44px', description: 'Width of the show/hide button and the room the password leaves for it.' },
    ],
    accessibility: [
      'The label gets for, the control aria-describedby, aria-invalid and aria-required; no ids to write by hand.',
      'The show/hide button is named Show password or Hide password (showPassword / hidePassword of the UI labels), points at the field with aria-controls and keeps the focus in it.',
      'Outside a form field the aria attributes the page sets stay as they are.',
      'It stays a native input, so autocomplete, the keyboard and the password manager work as usual.',
    ],
  },
  {
    slug: 'textarea',
    title: 'Textarea',
    group: 'Forms',
    summary: 'A multi-line text field that grows with its text and counts it against maxlength.',
    imports: `import { FormFieldComponent, TextareaDirective } from '@freely-ui/angular';`,
    selectors: ['textarea[fyTextarea]'],
    examples: [
      { title: 'Growing, with a counter', component: TextareaExample, code: textarea },
    ],
    inputs: [
      { name: 'appearance', type: "'outline' | 'plain'", default: "'outline'", description: 'A bordered box, or no border and fill.' },
      { name: 'autosize', type: 'boolean', default: 'true', description: 'Grows with the text up to --fy-textarea-max-height; false keeps the height the page gives it.' },
    ],
    cssVars: [
      { name: '--fy-textarea-max-height', default: '200px', description: 'Height it grows to before it scrolls.' },
      { name: '--fy-text-field-padding', default: '12px 14px', description: 'Padding inside the field.' },
    ],
    accessibility: ['The counter is hidden from screen readers; maxlength itself stops the typing.'],
  },
  {
    slug: 'code-input',
    title: 'Code input',
    group: 'Forms',
    summary: 'A one-time code drawn as a row of cells over one native input, so suggested codes, paste and backspace just work.',
    imports: `import { CodeInputComponent } from '@freely-ui/angular';`,
    selectors: ['fy-code-input'],
    examples: [
      { title: 'A six-digit code', description: `Spaces and dashes in a pasted code are dropped. ${FORMS_NOTE}`, component: CodeInputExample, code: codeInput },
    ],
    inputs: [
      { name: 'length', type: 'number', default: '6', description: 'Number of cells.' },
      { name: 'kind', type: "'numeric' | 'alphanumeric'", default: "'numeric'", description: 'Digits only, or letters and digits in upper case.' },
      { name: 'value', type: 'string', default: "''", description: 'The code, also as [(value)].' },
      { name: 'autofocus', type: 'boolean', default: 'false', description: 'Focuses the input when it appears.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the input when no form field labels it.' },
    ],
    outputs: [{ name: 'completed', type: 'string', description: 'Every cell is filled.' }],
    cssVars: [
      { name: '--fy-code-input-cell-width', default: '44px', description: 'Width of a cell.' },
      { name: '--fy-code-input-cell-height', default: '52px', description: 'Height of a cell.' },
      { name: '--fy-code-input-gap', default: 'var(--fy-space-s)', description: 'Space between the cells.' },
      { name: '--fy-code-input-focus-color', default: 'var(--fy-accent)', description: 'Border of the active cell.' },
    ],
    accessibility: ['One input with autocomplete="one-time-code" takes the code; the cells are hidden from screen readers.'],
  },
  {
    slug: 'number-field',
    title: 'Number field',
    group: 'Forms',
    summary: 'A field for amounts with a number value: digits grouped as you type, either separator for the decimals, a prefix or a suffix.',
    imports: `import { NumberFieldComponent } from '@freely-ui/angular';`,
    selectors: ['fy-number-field'],
    examples: [
      { title: 'Price and count', description: `The value is a number, or null while empty. min and max apply when the field loses focus; the arrow keys step by step. ${FORMS_NOTE}`, component: NumberFieldExample, code: numberField },
      { title: 'Plain', description: 'No box of its own, for a row inside a card the page draws.', component: NumberFieldPlainExample, code: numberFieldPlain },
    ],
    inputs: [
      { name: 'value', type: 'number | null', default: 'null', description: 'The number, also as [(value)].' },
      { name: 'decimals', type: 'number', default: '0', description: 'Digits after the decimal separator; 0 takes whole numbers only.' },
      { name: 'min', type: 'number | null', default: 'null', description: 'Smallest value; with none below 0 the field takes no minus.' },
      { name: 'max', type: 'number | null', default: 'null', description: 'Largest value.' },
      { name: 'step', type: 'number', default: '1', description: 'What the arrow keys add or take away.' },
      { name: 'locale', type: 'string', description: 'Locale of the separators; LOCALE_ID by default.' },
      { name: 'prefix / suffix', type: 'string', description: 'Text before or after the number, e.g. a currency.' },
      { name: 'placeholder', type: 'string', default: "''", description: 'Shown while empty.' },
      { name: 'appearance', type: "'outline' | 'plain'", default: "'outline'", description: 'A bordered box, or no border and fill.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Marks the field invalid on its own; a form field with an error does too.' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the input when no form field labels it.' },
    ],
    cssVars: [
      { name: '--fy-text-field-*', description: 'The same box properties as the text field.' },
      { name: '--fy-number-field-affix-color', default: 'var(--fy-secondary-text)', description: 'Colour of the prefix and the suffix.' },
      { name: '--fy-number-field-affix-gap', default: '6px', description: 'Space between the number and its prefix or suffix.' },
    ],
    accessibility: [
      'role="spinbutton" with aria-valuenow, aria-valuemin and aria-valuemax; aria-valuetext reads the number with its prefix and suffix.',
      'The keyboard is numeric on phones, decimal when decimals is above 0, and the full one when negatives are allowed, for the minus.',
      'Pasting "1 234,50" or "1,234.50" gives 1234.5 in any locale.',
    ],
  },
  {
    slug: 'range-field',
    title: 'Range field',
    group: 'Forms',
    summary: 'A "from – to" pair of number fields with a { min, max } value, e.g. a budget filter.',
    imports: `import { NumberRange, RangeFieldComponent } from '@freely-ui/angular';`,
    selectors: ['fy-range-field'],
    examples: [
      { title: 'Budget', description: `Either end may stay empty. While from is above to both fields turn invalid and the form gets the fyRange error. ${FORMS_NOTE}`, component: RangeFieldExample, code: rangeField },
    ],
    inputs: [
      { name: 'value', type: 'NumberRange', default: '{ min: null, max: null }', description: 'Both ends, also as [(value)].' },
      { name: 'min / max / step / decimals / locale', type: 'number | string', description: 'As in the number field, for both fields.' },
      { name: 'prefix / suffix', type: 'string', description: 'Text before or after each number.' },
      { name: 'fromLabel / toLabel', type: 'string', description: 'Name and placeholder of each field; rangeFrom / rangeTo of the UI labels by default.' },
      { name: 'appearance', type: "'outline' | 'plain'", default: "'outline'", description: 'A bordered box, or no border and fill.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables both fields.' },
    ],
    cssVars: [{ name: '--fy-range-field-gap', default: 'var(--fy-space-s)', description: 'Space around the dash.' }],
    accessibility: ['role="group"; the label of a form field points at the lower field, and each field is named by its own label.'],
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    group: 'Forms',
    summary: 'A checkbox with its label on the native input, with an indeterminate state.',
    imports: `import { CheckboxComponent } from '@freely-ui/angular';`,
    selectors: ['fy-checkbox'],
    examples: [{ title: 'States', description: FORMS_NOTE, component: CheckboxExample, code: checkbox }],
    inputs: [
      { name: 'checked', type: 'boolean', default: 'false', description: 'Ticked, also as [(checked)].' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Neither on nor off; cleared by the next tap.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox.' },
      { name: 'ariaLabel', type: 'string', description: 'Name when the checkbox has no label text.' },
      { name: 'haptic', type: 'HapticFeedback | null', default: "'selection'", description: 'Tactile feedback on a tap; null turns it off.' },
    ],
    cssVars: [
      { name: '--fy-checkbox-size', default: '22px', description: 'Size of the box.' },
      { name: '--fy-checkbox-accent', default: 'var(--fy-accent)', description: 'Fill of a ticked box.' },
      { name: '--fy-checkbox-radius', default: '7px', description: 'Corner radius of the box.' },
    ],
    accessibility: ['The native checkbox stays under the drawn box, inside the label, so the label, Space and the form behave as usual.'],
  },
  {
    slug: 'switch',
    title: 'Switch',
    group: 'Forms',
    summary: 'An on and off switch on the native checkbox with role="switch".',
    imports: `import { SwitchComponent } from '@freely-ui/angular';`,
    selectors: ['fy-switch'],
    examples: [{ title: 'In a row with its label', description: FORMS_NOTE, component: SwitchExample, code: switchTemplate }],
    inputs: [
      { name: 'checked', type: 'boolean', default: 'false', description: 'On, also as [(checked)].' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch.' },
      { name: 'ariaLabel', type: 'string', description: 'Name when there is no wrapping label.' },
      { name: 'haptic', type: 'HapticFeedback | null', default: "'selection'", description: 'Tactile feedback on a flip; null turns it off.' },
    ],
    cssVars: [
      { name: '--fy-switch-width', default: '63px', description: 'Width of the track.' },
      { name: '--fy-switch-height', default: '28px', description: 'Height of the track.' },
      { name: '--fy-switch-on-background', default: 'var(--fy-accent)', description: 'Track while on.' },
      { name: '--fy-switch-off-background', default: 'var(--fy-tertiary-background)', description: 'Track while off.' },
    ],
  },
  {
    slug: 'radio-group',
    title: 'Radio group',
    group: 'Forms',
    summary: 'A choice of one option out of a few, with one tab stop and the arrow keys moving the choice.',
    imports: `import { RADIO_GROUP } from '@freely-ui/angular';`,
    selectors: ['fy-radio-group', 'fy-radio'],
    examples: [
      { title: 'With marks', description: FORMS_NOTE, component: RadioDotExample, code: radioDot },
      { title: 'Plain', description: 'The page draws the options; the checked one carries .fy-radio--checked and aria-checked.', component: RadioPlainExample, code: radioPlain },
    ],
    inputs: [
      { name: 'value', type: 'unknown', default: 'null', description: 'fy-radio-group: the picked value, also as [(value)].' },
      { name: 'appearance', type: "'dot' | 'plain'", default: "'dot'", description: 'fy-radio-group: a round mark before each option, or the options only.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the group, or one fy-radio.' },
      { name: 'haptic', type: 'HapticFeedback | null', default: "'selection'", description: 'fy-radio-group: tactile feedback on a change.' },
      { name: 'value (fy-radio)', type: 'unknown', description: 'fy-radio: the value it picks; required.' },
    ],
    cssVars: [
      { name: '--fy-radio-group-gap', default: 'var(--fy-space-m)', description: 'Space between the options.' },
      { name: '--fy-radio-size', default: '22px', description: 'Size of the mark.' },
      { name: '--fy-radio-accent', default: 'var(--fy-accent)', description: 'Colour of the checked mark and the focus ring.' },
    ],
    accessibility: [
      'role="radiogroup" with role="radio" options and aria-checked; name the group with aria-label or aria-labelledby.',
      'One tab stop: the checked option, else the first one that can be picked.',
      'Arrow keys, Home and End move the choice and skip disabled options; Space and Enter pick the focused one.',
    ],
  },
  {
    slug: 'select-field',
    title: 'Select field',
    group: 'Forms',
    summary: 'A field that shows the picked option and opens a menu of all of them.',
    imports: `import { SelectFieldComponent, SelectFieldOption } from '@freely-ui/angular';`,
    selectors: ['fy-select-field'],
    examples: [{ title: 'Sorting', description: `The first option is the default. ${FORMS_NOTE}`, component: SelectFieldExample, code: selectField }],
    inputs: [
      { name: 'options', type: 'SelectFieldOption<T>[]', default: '[]', description: 'The options, as { value, label }.' },
      { name: 'value', type: 'T | null', default: 'null', description: 'The picked value, also as [(value)]; a value missing from the options means the first one.' },
      { name: 'label', type: 'string', default: "''", description: 'Caption above the field and the name of the menu.' },
      { name: 'ariaLabel', type: 'string', default: "''", description: 'Name when there is no visible label.' },
      { name: 'direction', type: "'down' | 'up'", default: "'down'", description: 'Which side the menu opens on.' },
    ],
    cssVars: [
      { name: '--fy-select-field-height', description: 'Height of the field.' },
      { name: '--fy-select-field-bg', description: 'Fill of the field.' },
      { name: '--fy-select-field-radius', description: 'Corner radius.' },
    ],
  },
  {
    slug: 'date-picker',
    title: 'Date picker',
    group: 'Forms',
    summary: 'A date shown as a chip; a tap opens the date picker of the system.',
    imports: `import { DatePickerComponent } from '@freely-ui/angular';`,
    selectors: ['fy-date-picker'],
    examples: [{ title: 'Empty and picked', description: `The value is an ISO date such as 2027-03-12, or an empty string. ${FORMS_NOTE}`, component: DatePickerExample, code: datePicker }],
    inputs: [
      { name: 'value', type: 'string', default: "''", description: 'The ISO date, also as [(value)].' },
      { name: 'min', type: 'string', description: 'Earliest date offered, as an ISO date.' },
      { name: 'max', type: 'string', description: 'Latest date offered, as an ISO date.' },
      { name: 'format', type: 'string', default: "'longDate'", description: 'formatDate format of the shown date.' },
      { name: 'locale', type: 'string', description: 'Locale of the shown date; LOCALE_ID by default.' },
      { name: 'placeholder', type: 'string', description: 'Shown while empty; the add icon without it.' },
      { name: 'invalid', type: 'boolean', default: 'false', description: 'Marks the chip invalid.' },
      { name: 'pickLabel / changeLabel', type: 'string', description: 'Name of the input while empty and once picked.' },
    ],
    cssVars: [
      { name: '--fy-date-picker-height', default: '36px', description: 'Least height of the chip.' },
      { name: '--fy-date-picker-font-size', default: 'var(--fy-font-size-m)', description: 'Size of the date.' },
    ],
    accessibility: ['The native date input lies over the chip, so the keyboard and the system picker work as usual.'],
  },
  {
    slug: 'form-field',
    title: 'Form field',
    group: 'Forms',
    summary: 'A label, the control and a line under it for a hint, an error or the length, wired to the control without ids.',
    imports: `import { FormFieldComponent } from '@freely-ui/angular';`,
    selectors: ['fy-form-field'],
    examples: [{
      title: 'A hint, a counter with an error and a code',
      description: 'It works with fyTextField, fyTextarea and fy-code-input. The error replaces the hint while it is set; required only marks the label and the control, validation stays with the form. A revealable password gets a show button, see the text field page.',
      component: FormFieldExample,
      code: formField,
    }],
    inputs: [
      { name: 'label', type: 'string', description: 'The label, pointed at the control.' },
      { name: 'hint', type: 'string | null', description: 'A line under the control.' },
      { name: 'error', type: 'string | null', description: 'Shown instead of the hint while set; marks the field and the control invalid.' },
      { name: 'required', type: 'boolean', default: 'false', description: 'An asterisk on the label and aria-required on the control.' },
      { name: 'counter', type: 'boolean', default: 'false', description: 'The length of the text, against maxlength when the control has one.' },
    ],
    cssVars: [
      { name: '--fy-form-field-gap', default: '6px', description: 'Space between the label, the control and the line under it.' },
      { name: '--fy-form-field-inset', default: '14px', description: 'Side inset of the label and the line under it.' },
      { name: '--fy-form-field-label-size', default: 'var(--fy-font-size-s)', description: 'Size of the label.' },
      { name: '--fy-form-field-label-color', default: 'var(--fy-secondary-text)', description: 'Colour of the label.' },
      { name: '--fy-form-field-reveal-size', default: '44px', description: 'Size of the show-password button.' },
      { name: '--fy-form-field-reveal-icon-size', default: '18px', description: 'Size of its icon.' },
    ],
    accessibility: [
      'The label points at the control; the control is described by the hint or the error and gets aria-invalid and aria-required.',
      'The error is read by a polite live region; the counter is hidden from screen readers, maxlength already limits the text.',
    ],
  },
];
