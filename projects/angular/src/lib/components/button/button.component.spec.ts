import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_HAPTICS } from '../../haptics/haptics';
import { ButtonComponent, ButtonSize, ButtonVariant } from './button.component';

@Component({
  imports: [ButtonComponent, HapticFeedbackDirective],
  template: `
    <button fyButton type="button" [variant]="variant()" [size]="size()" [iconOnly]="iconOnly()" [block]="block()"
      [icon]="icon()" [disabled]="disabled()" [loading]="loading()" [fyHaptic]="HapticImpact.Medium" (click)="clicks = clicks + 1">
      Save
    </button>
    <a fyButton href="#" [disabled]="disabled()" [loading]="loading()">Open</a>
  `
})
class HostComponent {
  protected readonly HapticImpact = HapticImpact;
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('m');
  readonly iconOnly = signal(false);
  readonly block = signal(false);
  readonly icon = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly loading = signal(false);
  clicks = 0;
}

describe('ButtonComponent', () => {
  const impact = vi.fn();

  async function render(setup: (host: HostComponent) => void = () => {}) {
    impact.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: FY_HAPTICS, useValue: { impact, notification: () => {}, selection: () => {} } }]
    });
    const fixture = TestBed.createComponent(HostComponent);
    setup(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      button: root.querySelector('button')!,
      link: root.querySelector('a')!
    };
  }

  it('is a primary button of the medium size by default', async () => {
    const { button } = await render();

    expect(button.classList).toContain('fy-button');
    expect(button.classList).toContain('fy-button--primary');
    expect(button.classList).toContain('fy-button--m');
  });

  it('marks the variant, the size and the shape', async () => {
    const { button } = await render(host => {
      host.variant.set('tertiary');
      host.size.set('s');
      host.iconOnly.set(true);
      host.block.set(true);
    });

    expect([...button.classList]).toEqual(
      expect.arrayContaining(['fy-button--tertiary', 'fy-button--s', 'fy-button--icon', 'fy-button--block'])
    );
    expect(button.classList).not.toContain('fy-button--primary');
  });

  it('draws the icon before the label', async () => {
    const { button } = await render(host => host.icon.set('test-plus'));

    expect(button.firstElementChild?.classList).toContain('test-plus');
  });

  it('clicks and plays the haptic while active', async () => {
    const { fixture, button } = await render();
    button.click();

    expect(fixture.componentInstance.clicks).toBe(1);
    expect(impact).toHaveBeenCalledWith(HapticImpact.Medium);
  });

  it('neither clicks nor plays the haptic while disabled', async () => {
    const { fixture, button } = await render(host => host.disabled.set(true));
    button.click();

    expect(button.disabled).toBe(true);
    expect(fixture.componentInstance.clicks).toBe(0);
    expect(impact).not.toHaveBeenCalled();
  });

  it('shows a loader, says it is busy and does not click while loading', async () => {
    const { fixture, button } = await render(host => {
      host.icon.set('test-plus');
      host.loading.set(true);
    });
    button.click();

    expect(button.querySelector('fy-loader')).not.toBeNull();
    expect(button.querySelector('.test-plus')).toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(fixture.componentInstance.clicks).toBe(0);
  });

  it('takes a disabled link out of the tab order instead of disabling it', async () => {
    const { link } = await render(host => host.disabled.set(true));

    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
  });

  it('leaves an active link alone', async () => {
    const { link } = await render();

    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
  });
});
