import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FY_HAPTICS, FyHaptics } from '../../haptics/haptics';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { SwipeAction, SwipeActionsComponent } from './swipe-actions.component';

const END: SwipeAction[] = [
  { id: 'delete', label: 'Delete', icon: 'bi bi-trash3', tone: 'danger' },
  { id: 'archive', label: 'Archive', tone: 'neutral' }
];
const START: SwipeAction[] = [{ id: 'read', label: 'Read' }];

@Component({
  imports: [SwipeActionsComponent],
  template: `
    @for (row of [1, 2]; track row) {
      <fy-swipe-actions [startActions]="start" [endActions]="end" (action)="actions.push(row + ':' + $event)">
        <button type="button" class="row" (click)="taps = taps + 1">Row {{ row }}</button>
      </fy-swipe-actions>
    }
  `
})
class HostComponent {
  readonly start = START;
  readonly end = END;
  actions: string[] = [];
  taps = 0;
}

/** jsdom has no PointerEvent everywhere; a MouseEvent with a pointer id does for the handlers. */
function pointer(type: string, x: number, y = 0): Event {
  const event = new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
}

describe('SwipeActionsComponent', () => {
  async function render() {
    const haptics: FyHaptics = { impact: vi.fn(), notification: vi.fn(), selection: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: FY_HAPTICS, useValue: haptics }] });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('fy-swipe-actions'));
    rows.forEach(row => Object.defineProperty(row, 'clientWidth', { value: 300 }));

    const swipe = async (row: HTMLElement, from: number, to: number, y = 0) => {
      row.dispatchEvent(pointer('pointerdown', from));
      row.dispatchEvent(pointer('pointermove', from + (to - from) / 2, y / 2));
      row.dispatchEvent(pointer('pointermove', to, y));
      row.dispatchEvent(pointer('pointerup', to, y));
      await fixture.whenStable();
    };
    const content = (row: HTMLElement) => row.querySelector<HTMLElement>('.fy-swipe-actions__content')!;
    return { fixture, root, rows, swipe, content, haptics };
  }

  it('opens to the end buttons on a swipe toward the start', async () => {
    const { rows, swipe, content } = await render();
    await swipe(rows[0], 250, 150);

    expect(rows[0].classList).toContain('fy-swipe-actions--open');
    expect(content(rows[0]).style.transform).toBe('translateX(-152px)');
  });

  it('opens to the start buttons the other way', async () => {
    const { rows, swipe, content } = await render();
    await swipe(rows[0], 50, 120);

    expect(content(rows[0]).style.transform).toBe('translateX(76px)');
  });

  it('springs back from a short swipe', async () => {
    const { rows, swipe } = await render();
    await swipe(rows[0], 200, 180);

    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');
  });

  it('leaves a vertical move to the page', async () => {
    const { rows, swipe } = await render();
    await swipe(rows[0], 200, 190, 80);

    expect(rows[0].classList).not.toContain('fy-swipe-actions--dragging');
    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');
  });

  it('emits a pressed button and closes', async () => {
    const { fixture, rows, swipe } = await render();
    await swipe(rows[0], 250, 150);
    const archive = Array.from(rows[0].querySelectorAll<HTMLButtonElement>('.fy-swipe-actions__button')).find(
      button => button.textContent?.includes('Archive')
    )!;
    archive.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.actions).toEqual(['1:archive']);
    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');
  });

  it('runs the outer action on a full swipe with a haptic', async () => {
    const { fixture, rows, swipe, haptics } = await render();
    await swipe(rows[0], 280, 40);

    expect(fixture.componentInstance.actions).toEqual(['1:delete']);
    expect(haptics.impact).toHaveBeenCalledWith(HapticImpact.Rigid);
    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');
  });

  it('keeps the click ending a swipe, and a tap on an open row, from the row', async () => {
    const { fixture, rows, swipe } = await render();
    await swipe(rows[0], 250, 150);
    rows[0].querySelector<HTMLButtonElement>('.row')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.taps).toBe(0);
    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');

    rows[0].querySelector<HTMLButtonElement>('.row')!.click();
    expect(fixture.componentInstance.taps).toBe(1);
  });

  it('keeps one row open at a time', async () => {
    const { rows, swipe } = await render();
    await swipe(rows[0], 250, 150);
    await swipe(rows[1], 250, 150);

    expect(rows[0].classList).not.toContain('fy-swipe-actions--open');
    expect(rows[1].classList).toContain('fy-swipe-actions--open');
  });

  it('opens the side of a button that gets the focus', async () => {
    const { fixture, rows } = await render();
    rows[0].querySelector<HTMLButtonElement>('.fy-swipe-actions__actions--start button')!.focus();
    await fixture.whenStable();

    expect(rows[0].classList).toContain('fy-swipe-actions--open');
  });
});
