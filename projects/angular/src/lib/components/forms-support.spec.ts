import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChipComponent } from './chip/chip.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SelectableTileGridComponent, SelectableTile } from './selectable-tile-grid/selectable-tile-grid.component';
import { SelectFieldComponent, SelectFieldOption } from './select-field/select-field.component';

/** The controls that came before the form controls: each also works with a form control. */
@Component({
  imports: [ChipComponent, SearchBarComponent, SelectableTileGridComponent, SelectFieldComponent, ReactiveFormsModule],
  template: `
    <fy-search-bar [formControl]="query" [debounce]="0" />
    <fy-select-field [options]="statuses" [formControl]="status" ariaLabel="Status" />
    <fy-selectable-tile-grid [tiles]="tiles" [formControl]="friends" />
    <button fyChip type="button" [formControl]="holiday">Holiday</button>
  `
})
class HostComponent {
  readonly statuses: SelectFieldOption[] = [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }];
  readonly tiles: SelectableTile[] = [{ id: 'a', label: 'Ada' }, { id: 'b', label: 'Bob' }];
  readonly query = new FormControl('');
  readonly status = new FormControl('all');
  readonly friends = new FormControl<string[]>(['a']);
  readonly holiday = new FormControl(false);
}

describe('Reactive forms in the existing controls', () => {
  async function render() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance, root: fixture.nativeElement as HTMLElement };
  }

  it('search bar: writes what is typed and shows what the form sets', async () => {
    const { fixture, host, root } = await render();
    const input = root.querySelector<HTMLInputElement>('fy-search-bar input')!;
    input.value = 'cake';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(host.query.value).toBe('cake');

    host.query.setValue('tea');
    await fixture.whenStable();
    expect(input.value).toBe('tea');

    host.query.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
  });

  it('select field: shows the value of the form and is disabled by it', async () => {
    const { fixture, host, root } = await render();
    host.status.setValue('open');
    await fixture.whenStable();
    expect(root.querySelector('.fy-select-field__current')?.textContent?.trim()).toBe('Open');

    host.status.disable();
    await fixture.whenStable();
    expect(root.querySelector<HTMLButtonElement>('.fy-select-field__toggle')?.disabled).toBe(true);
  });

  it('tile grid: toggles the ids in the form control', async () => {
    const { fixture, host, root } = await render();
    const [ada, bob] = Array.from(root.querySelectorAll<HTMLButtonElement>('.fy-stg-item'));
    expect(ada.classList).toContain('fy-stg-item--selected');

    bob.click();
    ada.click();
    await fixture.whenStable();
    expect(host.friends.value).toEqual(['b']);
    expect(bob.classList).toContain('fy-stg-item--selected');
    expect(ada.classList).not.toContain('fy-stg-item--selected');
  });

  it('chip: flips on tap once a form control is bound', async () => {
    const { fixture, host, root } = await render();
    const chip = root.querySelector<HTMLButtonElement>('button[fyChip]')!;
    chip.click();
    await fixture.whenStable();

    expect(host.holiday.value).toBe(true);
    expect(chip.getAttribute('aria-pressed')).toBe('true');

    host.holiday.disable();
    await fixture.whenStable();
    expect(chip.disabled).toBe(true);
  });
});
