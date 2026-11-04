import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RADIO_GROUP } from './radio-group.component';

@Component({
  imports: [RADIO_GROUP, ReactiveFormsModule],
  template: `
    <fy-radio-group [formControl]="size" aria-label="Size">
      <fy-radio value="s">Small</fy-radio>
      <fy-radio value="m" [disabled]="true">Medium</fy-radio>
      <fy-radio value="l">Large</fy-radio>
    </fy-radio-group>
  `
})
class HostComponent {
  readonly size = new FormControl<string | null>(null);
}

describe('RadioGroupComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const radios = Array.from(root.querySelectorAll<HTMLElement>('fy-radio'));
    const press = async (radio: HTMLElement, key: string) => {
      radio.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await fixture.whenStable();
    };
    return { fixture, root, radios, press };
  }

  it('is a radio group with one tab stop on the first option while nothing is picked', async () => {
    const { root, radios } = await render();

    expect(root.querySelector('fy-radio-group')?.getAttribute('role')).toBe('radiogroup');
    expect(radios.map(radio => radio.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });

  it('writes the tapped option to the form control and moves the tab stop to it', async () => {
    const { fixture, radios } = await render();
    radios[2].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.size.value).toBe('l');
    expect(radios[2].getAttribute('aria-checked')).toBe('true');
    expect(radios.map(radio => radio.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
  });

  it('moves the choice with the arrow keys, skipping a disabled option and wrapping around', async () => {
    const { fixture, radios, press } = await render();
    radios[0].click();
    await fixture.whenStable();

    await press(radios[0], 'ArrowDown');
    expect(fixture.componentInstance.size.value).toBe('l');
    expect(document.activeElement).toBe(radios[2]);

    await press(radios[2], 'ArrowRight');
    expect(fixture.componentInstance.size.value).toBe('s');

    await press(radios[0], 'End');
    expect(fixture.componentInstance.size.value).toBe('l');
  });

  it('ignores a tap on a disabled option', async () => {
    const { fixture, radios } = await render();
    radios[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.size.value).toBeNull();
  });

  it('shows a value set by the form and is disabled by it', async () => {
    const { fixture, radios } = await render();
    fixture.componentInstance.size.setValue('s');
    fixture.componentInstance.size.disable();
    await fixture.whenStable();
    radios[2].click();
    await fixture.whenStable();

    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.size.value).toBe('s');
  });
});
