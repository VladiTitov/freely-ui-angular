import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from './form-field.component';
import { TextareaDirective, TextFieldDirective } from './text-field.directive';

@Component({
  imports: [FormFieldComponent, TextFieldDirective, TextareaDirective, ReactiveFormsModule],
  template: `
    <fy-form-field label="Email" [hint]="hint()" [error]="error()" required>
      <input fyTextField type="email" />
    </fy-form-field>

    <fy-form-field label="Note" counter>
      <textarea fyTextarea maxlength="20" [formControl]="note"></textarea>
    </fy-form-field>

    <input fyTextField class="alone" aria-describedby="own-hint" />
  `
})
class HostComponent {
  readonly hint = signal<string | null>('We never share it.');
  readonly error = signal<string | null>(null);
  readonly note = new FormControl('');
}

describe('FormFieldComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [emailField, noteField] = Array.from(root.querySelectorAll('fy-form-field'));
    return {
      fixture,
      root,
      emailField,
      noteField,
      input: root.querySelector<HTMLInputElement>('input[type=email]')!,
      textarea: root.querySelector('textarea')!
    };
  }

  it('points the label at the control', async () => {
    const { emailField, input } = await render();

    expect(input.id).not.toBe('');
    expect(emailField.querySelector('label')?.getAttribute('for')).toBe(input.id);
  });

  it('describes the control by the hint and marks it required', async () => {
    const { emailField, input } = await render();
    const hint = emailField.querySelector('.fy-form-field__hint')!;

    expect(hint.textContent?.trim()).toBe('We never share it.');
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows the error instead of the hint and marks the control invalid', async () => {
    const { fixture, emailField, input } = await render();
    fixture.componentInstance.error.set('Enter an email.');
    await fixture.whenStable();
    const error = emailField.querySelector('.fy-form-field__error')!;

    expect(emailField.querySelector('.fy-form-field__hint')).toBeNull();
    expect(error.textContent?.trim()).toBe('Enter an email.');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('counts what is typed against maxlength', async () => {
    const { fixture, noteField, textarea } = await render();
    const counter = () => noteField.querySelector('.fy-form-field__counter')?.textContent?.trim();

    expect(counter()).toBe('0 / 20');

    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(counter()).toBe('5 / 20');

    fixture.componentInstance.note.setValue('Hi');
    await fixture.whenStable();
    expect(counter()).toBe('2 / 20');
  });

  it('leaves the aria attributes of a field outside fy-form-field alone', async () => {
    const { root } = await render();
    const alone = root.querySelector('input.alone')!;

    expect(alone.getAttribute('aria-describedby')).toBe('own-hint');
    expect(alone.hasAttribute('aria-invalid')).toBe(false);
  });

  it('styles the textarea as a growing text field', async () => {
    const { textarea } = await render();

    expect([...textarea.classList]).toEqual(
      expect.arrayContaining(['fy-text-field', 'fy-textarea', 'fy-textarea--autosize'])
    );
  });
});
