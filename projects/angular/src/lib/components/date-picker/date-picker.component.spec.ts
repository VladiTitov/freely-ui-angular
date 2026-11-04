import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent, parseIsoDate } from './date-picker.component';

@Component({
  imports: [DatePickerComponent, ReactiveFormsModule],
  template: `<fy-date-picker [formControl]="date" format="yyyy-MM-dd" locale="en-US" placeholder="Pick a date" />`
})
class HostComponent {
  readonly date = new FormControl('');
}

describe('DatePickerComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      input: root.querySelector<HTMLInputElement>('input[type=date]')!,
      chip: () => root.querySelector('fy-chip')!.textContent?.trim()
    };
  }

  it('shows the placeholder and asks to pick a date while empty', async () => {
    const { input, chip } = await render();

    expect(chip()).toBe('Pick a date');
    expect(input.getAttribute('aria-label')).toBe('Pick a date');
  });

  it('writes the picked date to the form control and shows it', async () => {
    const { fixture, input, chip } = await render();
    input.value = '2027-03-12';
    input.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.date.value).toBe('2027-03-12');
    expect(chip()).toBe('2027-03-12');
    expect(input.getAttribute('aria-label')).toBe('Change the date');
  });

  it('is disabled by the form', async () => {
    const { fixture, input } = await render();
    fixture.componentInstance.date.disable();
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
  });
});

describe('parseIsoDate', () => {
  it('reads the day in the local time zone', () => {
    const date = parseIsoDate('2027-03-12')!;

    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2027, 2, 12, 0]);
  });

  it('gives null for anything but an ISO date', () => {
    expect(parseIsoDate('')).toBeNull();
    expect(parseIsoDate('12.03.2027')).toBeNull();
  });
});
