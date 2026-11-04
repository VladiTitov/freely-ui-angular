import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

@Component({
  imports: [CheckboxComponent, ReactiveFormsModule],
  template: `<fy-checkbox [formControl]="terms">I accept the terms</fy-checkbox>`
})
class HostComponent {
  readonly terms = new FormControl(false);
}

describe('CheckboxComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, box: root.querySelector<HTMLInputElement>('input[type=checkbox]')!, root };
  }

  it('is labelled by its text', async () => {
    const { box } = await render();

    expect(box.closest('label')?.textContent?.trim()).toBe('I accept the terms');
  });

  it('writes a tick to the form control', async () => {
    const { fixture, box } = await render();
    box.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.terms.value).toBe(true);
  });

  it('shows a value set by the form', async () => {
    const { fixture, box } = await render();
    fixture.componentInstance.terms.setValue(true);
    await fixture.whenStable();

    expect(box.checked).toBe(true);
  });

  it('is disabled by the form', async () => {
    const { fixture, box } = await render();
    fixture.componentInstance.terms.disable();
    await fixture.whenStable();
    box.click();

    expect(box.disabled).toBe(true);
    expect(fixture.componentInstance.terms.value).toBe(false);
  });
});
