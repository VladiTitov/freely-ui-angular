import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CodeInputKind, CodeInputComponent } from './code-input.component';

@Component({
  imports: [CodeInputComponent, FormsModule],
  template: `<fy-code-input [kind]="kind()" [(ngModel)]="code" (completed)="completed = $event" />`
})
class HostComponent {
  readonly kind = signal<CodeInputKind>('numeric');
  code = '';
  completed: string | null = null;
}

describe('CodeInputComponent', () => {
  async function render(kind: CodeInputKind = 'numeric') {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.kind.set(kind);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input')!;

    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const cells = () => Array.from(root.querySelectorAll('.fy-code-input__cell')).map(cell => cell.textContent?.trim());

    return { fixture, input, type, cells };
  }

  it('draws one cell per character', async () => {
    const { cells } = await render();

    expect(cells()).toEqual(['', '', '', '', '', '']);
  });

  it('keeps the digits of a pasted code and drops the rest', async () => {
    const { fixture, input, type, cells } = await render();
    await type('123 45-6');

    expect(input.value).toBe('123456');
    expect(cells()).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(fixture.componentInstance.code).toBe('123456');
    expect(fixture.componentInstance.completed).toBe('123456');
  });

  it('stops at the length of the code', async () => {
    const { fixture, type } = await render();
    await type('12345678');

    expect(fixture.componentInstance.code).toBe('123456');
  });

  it('follows backspace and does not complete a short code', async () => {
    const { fixture, type, cells } = await render();
    await type('1234');
    await type('123');

    expect(cells()).toEqual(['1', '2', '3', '', '', '']);
    expect(fixture.componentInstance.code).toBe('123');
    expect(fixture.componentInstance.completed).toBeNull();
  });

  it('shows a code written by the form', async () => {
    const { fixture, cells } = await render();
    fixture.componentInstance.code = '42';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(cells().slice(0, 3)).toEqual(['4', '2', '']);
  });

  it('takes letters in upper case when alphanumeric', async () => {
    const { fixture, type } = await render('alphanumeric');
    await type('ab-12 cd');

    expect(fixture.componentInstance.code).toBe('AB12CD');
  });
});
