import { TestBed } from '@angular/core/testing';
import { AvatarStackComponent, AvatarStackItem } from './avatar-stack.component';

describe('AvatarStackComponent', () => {
  async function render(people: AvatarStackItem[], max = 4) {
    const fixture = TestBed.createComponent(AvatarStackComponent);
    fixture.componentRef.setInput('people', people);
    fixture.componentRef.setInput('max', max);
    await fixture.whenStable();
    return fixture;
  }

  function initials(host: HTMLElement): string[] {
    return [...host.querySelectorAll('.fy-avatar-circle')].map(avatar => avatar.textContent?.trim() ?? '');
  }

  it('draws the initials of the given names', async () => {
    const fixture = await render([{ name: 'Ada Lovelace' }, { name: 'Alan Turing' }]);

    expect(initials(fixture.nativeElement)).toEqual(['AL', 'AT']);
  });

  it('gives the last slot to a "+N" badge when not everyone fits', async () => {
    const fixture = await render([{ name: 'A' }, { name: 'B' }, { name: 'C' }], 2);
    const host = fixture.nativeElement as HTMLElement;

    expect(initials(host)).toEqual(['A']);
    expect(host.querySelector('.fy-avatar-stack__more')?.textContent?.trim()).toBe('+2');
  });

  it('redraws an avatar when another person takes its place', async () => {
    const fixture = await render([{ name: 'Ada Lovelace' }]);
    fixture.componentRef.setInput('people', [{ name: 'Grace Hopper' }]);
    await fixture.whenStable();

    expect(initials(fixture.nativeElement)).toEqual(['GH']);
  });
});
