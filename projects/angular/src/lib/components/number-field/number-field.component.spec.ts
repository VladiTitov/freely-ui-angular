import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from '../form-field/form-field.component';
import { NumberFieldComponent } from './number-field.component';

@Component({
  imports: [NumberFieldComponent, FormFieldComponent, FormsModule, ReactiveFormsModule],
  template: `
    <fy-number-field class="model" [(ngModel)]="amount" [decimals]="2" [min]="min()" [max]="1000" locale="en-US" suffix="BYN" />

    <fy-form-field label="Count" [error]="error()">
      <fy-number-field class="reactive" [formControl]="count" locale="en-US" />
    </fy-form-field>
  `
})
class HostComponent {
  amount: number | null = null;
  readonly min = signal<number | null>(0);
  readonly error = signal<string | null>(null);
  readonly count = new FormControl<number | null>(1500);
}

describe('NumberFieldComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector<HTMLInputElement>('.model input')!;
    const reactive = root.querySelector<HTMLInputElement>('.reactive input')!;

    const type = async (field: HTMLInputElement, text: string) => {
      field.value = text;
      field.setSelectionRange(text.length, text.length);
      field.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const blur = async (field: HTMLInputElement) => {
      field.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };

    return { fixture, root, input, reactive, type, blur };
  }

  it('writes a pasted amount to the model as a number', async () => {
    const { fixture, input, type } = await render();
    await type(input, '1 234,50');

    expect(fixture.componentInstance.amount).toBe(1234.5);
    expect(input.value).toBe('1,234.50');
  });

  it('shows the value written by the form with grouping', async () => {
    const { fixture, reactive } = await render();

    expect(reactive.value).toBe('1,500');

    fixture.componentInstance.count.setValue(2500000);
    await fixture.whenStable();
    expect(reactive.value).toBe('2,500,000');
  });

  it('keeps a typed decimal separator until the digits after it come', async () => {
    const { fixture, input, type } = await render();
    await type(input, '12,');

    expect(input.value).toBe('12.');
    expect(fixture.componentInstance.amount).toBe(12);
  });

  it('is null while empty', async () => {
    const { fixture, input, type } = await render();
    await type(input, '5');
    await type(input, '');

    expect(fixture.componentInstance.amount).toBeNull();
  });

  it('clamps to min and max and tidies the text on blur', async () => {
    const { fixture, input, type, blur } = await render();
    await type(input, '5000');
    await blur(input);

    expect(fixture.componentInstance.amount).toBe(1000);
    expect(input.value).toBe('1,000');

    await type(input, '12.');
    await blur(input);
    expect(input.value).toBe('12');
  });

  it('takes no minus while min is not below zero', async () => {
    const { fixture, input, type } = await render();
    await type(input, '-5');
    expect(fixture.componentInstance.amount).toBe(5);

    fixture.componentInstance.min.set(-100);
    await fixture.whenStable();
    await type(input, '-5');
    expect(fixture.componentInstance.amount).toBe(-5);
  });

  it('steps the value with the arrow keys', async () => {
    const { fixture, reactive } = await render();
    reactive.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.count.value).toBe(1501);
    expect(reactive.value).toBe('1,501');
  });

  it('shows the suffix and reads it out with the value', async () => {
    const { root, input, type } = await render();
    await type(input, '25');

    expect(root.querySelector('.model .fy-number-field__affix')?.textContent?.trim()).toBe('BYN');
    expect(input.getAttribute('aria-valuetext')).toBe('25 BYN');
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('is labelled and marked invalid by fy-form-field', async () => {
    const { fixture, root, reactive } = await render();
    fixture.componentInstance.error.set('Too many');
    await fixture.whenStable();

    expect(root.querySelector('fy-form-field label')?.getAttribute('for')).toBe(reactive.id);
    expect(reactive.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('.reactive')?.classList).toContain('fy-number-field--invalid');
  });

  it('follows the disabled state of the form', async () => {
    const { fixture, reactive } = await render();
    fixture.componentInstance.count.disable();
    await fixture.whenStable();

    expect(reactive.disabled).toBe(true);
  });
});
