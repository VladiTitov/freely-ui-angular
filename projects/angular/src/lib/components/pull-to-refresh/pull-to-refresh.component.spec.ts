import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FY_HAPTICS, FyHaptics } from '../../haptics/haptics';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { PullToRefreshComponent } from './pull-to-refresh.component';

@Component({
  imports: [PullToRefreshComponent],
  template: `
    <fy-pull-to-refresh [refreshing]="refreshing()" [disabled]="disabled()" (refresh)="onRefresh()">
      <p>List</p>
    </fy-pull-to-refresh>
  `
})
class HostComponent {
  readonly refreshing = signal(false);
  readonly disabled = signal(false);
  /** Whether the handler starts a load, as a page with a loader does. */
  loads = true;
  refreshes = 0;

  onRefresh(): void {
    this.refreshes++;
    if (this.loads) this.refreshing.set(true);
  }
}

/** jsdom builds no `Touch`; the handlers read `touches` and `cancelable` only. */
function touch(type: string, y: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [{ clientY: y }] });
  return event;
}

describe('PullToRefreshComponent', () => {
  async function render() {
    const haptics: FyHaptics = { impact: vi.fn(), notification: vi.fn(), selection: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: FY_HAPTICS, useValue: haptics }] });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector<HTMLElement>('fy-pull-to-refresh')!;

    const pull = async (distance: number) => {
      host.dispatchEvent(touch('touchstart', 0));
      host.dispatchEvent(touch('touchmove', distance / 2));
      host.dispatchEvent(touch('touchmove', distance));
      await fixture.whenStable();
    };
    const release = async () => {
      host.dispatchEvent(touch('touchend', 0));
      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };
    const spinner = () => host.querySelector('fy-loader');
    return { fixture, host, pull, release, spinner, haptics };
  }

  it('follows the finger with resistance and shows the arrow', async () => {
    const { host, pull } = await render();
    await pull(60);

    expect(host.querySelector<HTMLElement>('.fy-pull-to-refresh__content')!.style.transform).toBe('translateY(30px)');
    expect(host.querySelector('.fy-pull-to-refresh__arrow')).not.toBeNull();
  });

  it('refreshes on release past the threshold and spins until the load ends', async () => {
    const { fixture, host, pull, release, spinner, haptics } = await render();
    await pull(200);

    expect(haptics.impact).toHaveBeenCalledWith(HapticImpact.Light);

    await release();
    expect(fixture.componentInstance.refreshes).toBe(1);
    expect(spinner()).not.toBeNull();
    expect(host.getAttribute('aria-busy')).toBe('true');

    fixture.componentInstance.refreshing.set(false);
    await fixture.whenStable();
    expect(spinner()).toBeNull();
    expect(host.hasAttribute('aria-busy')).toBe(false);
  });

  it('does not refresh from a short pull', async () => {
    const { fixture, pull, release, spinner } = await render();
    await pull(80);
    await release();

    expect(fixture.componentInstance.refreshes).toBe(0);
    expect(spinner()).toBeNull();
  });

  it('stops spinning at once when the handler starts no load', async () => {
    const { fixture, pull, release, spinner } = await render();
    fixture.componentInstance.loads = false;
    await pull(200);
    await release();

    expect(fixture.componentInstance.refreshes).toBe(1);
    expect(spinner()).toBeNull();
  });

  it('shows nothing for a load the page starts on its own', async () => {
    const { fixture, spinner } = await render();
    fixture.componentInstance.refreshing.set(true);
    await fixture.whenStable();

    expect(spinner()).toBeNull();
  });

  it('ignores the pull while disabled', async () => {
    const { fixture, pull, release } = await render();
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    await pull(200);
    await release();

    expect(fixture.componentInstance.refreshes).toBe(0);
  });
});
