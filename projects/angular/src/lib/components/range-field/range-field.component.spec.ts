import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideFyLabels } from '../../providers/fy-labels';
import { FormFieldComponent } from '../form-field/form-field.component';
import { NumberRange, RangeFieldComponent } from './range-field.component';

@Component({
  imports: [RangeFieldComponent, FormFieldComponent, ReactiveFormsModule],
  template: `
    <fy-form-field label="Budget">
      <fy-range-field [formControl]="budget" [min]="0" [decimals]="2" locale="en-US" suffix="BYN" />
    </fy-form-field>
  `
})
class HostComponent {
  readonly budget = new FormControl<NumberRange>({ min: 10, max: null });
}

describe('RangeFieldComponent', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideFyLabels(() => () => ({ rangeFrom: 'от', rangeTo: 'до' }))]
    });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const [from, to] = Array.from(root.querySelectorAll<HTMLInputElement>('input'));

    const type = async (field: HTMLInputElement, text: string) => {
      field.value = text;
      field.setSelectionRange(text.length, text.length);
      field.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };

    return { fixture, root, from, to, type };
  }

  it('shows both ends of the value written by the form', async () => {
    const { from, to } = await render();

    expect(from.value).toBe('10');
    expect(to.value).toBe('');
  });

  it('writes each end to the form', async () => {
    const { fixture, from, to, type } = await render();
    await type(to, '1 500');
    await type(from, '');

    expect(fixture.componentInstance.budget.value).toEqual({ min: null, max: 1500 });
  });

  it('names and fills the fields from the UI labels', async () => {
    const { from, to } = await render();

    expect(from.getAttribute('aria-label')).toBe('от');
    expect(to.placeholder).toBe('до');
  });

  it('points the label of fy-form-field at the lower field', async () => {
    const { root, from } = await render();

    expect(root.querySelector('label')?.getAttribute('for')).toBe(from.id);
  });

  it('marks a reversed range invalid', async () => {
    const { fixture, from, to, type } = await render();
    await type(to, '5');
    const budget = fixture.componentInstance.budget;

    expect(budget.hasError('fyRange')).toBe(true);
    expect(from.getAttribute('aria-invalid')).toBe('true');
    expect(to.getAttribute('aria-invalid')).toBe('true');

    await type(to, '50');
    expect(budget.valid).toBe(true);
    expect(from.hasAttribute('aria-invalid')).toBe(false);
  });

  it('is touched once a field loses focus', async () => {
    const { fixture, to } = await render();
    to.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.budget.touched).toBe(true);
  });
});
