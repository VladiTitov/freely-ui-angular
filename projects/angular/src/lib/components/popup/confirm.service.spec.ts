import { TestBed } from '@angular/core/testing';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { provideFyLabels } from '../../providers/fy-labels';
import { FyConfirmService } from './confirm.service';
import { PopupOptions, PopupService } from './popup.service';

describe('FyConfirmService', () => {
  /** Answers every popup with `answer` and keeps the options it was opened with. */
  function setUp(answer: string) {
    TestBed.configureTestingModule({
      providers: [provideFyLabels(() => () => ({ confirm: 'Да', cancel: 'Отмена' }))]
    });
    const opened: PopupOptions[] = [];
    TestBed.inject(PopupService).open$.subscribe(({ options, resolve }) => {
      opened.push(options);
      resolve(answer);
    });
    return { service: TestBed.inject(FyConfirmService), opened };
  }

  it('resolves to true when the user confirms', async () => {
    const { service } = setUp('confirm');

    expect(await service.confirm({ title: 'Delete?' })).toBe(true);
  });

  it('resolves to false on cancel and on dismiss', async () => {
    expect(await setUp('cancel').service.confirm({})).toBe(false);
    TestBed.resetTestingModule();
    expect(await setUp('dismiss').service.confirm({})).toBe(false);
  });

  it('dismisses to cancel and takes the button texts from the UI labels', async () => {
    const { service, opened } = setUp('cancel');
    await service.confirm({ title: 'Leave?', message: 'Changes are lost.' });
    const [options] = opened;

    expect(options.title).toBe('Leave?');
    expect(options.message).toBe('Changes are lost.');
    expect(options.dismissValue).toBe('cancel');
    expect(options.buttons.map(button => button.text)).toEqual(['Да', 'Отмена']);
    expect(options.buttons[0]).toEqual(
      expect.objectContaining({ value: 'confirm', style: 'accent', haptic: HapticImpact.Medium })
    );
    expect(options.buttons[1]).toEqual(expect.objectContaining({ value: 'cancel', style: 'muted' }));
  });

  it('paints a destructive confirm red with a rigid haptic and own texts', async () => {
    const { service, opened } = setUp('confirm');
    await service.confirm({ confirmText: 'Delete', cancelText: 'Keep', destructive: true });
    const [confirm, cancel] = opened[0].buttons;

    expect(confirm).toEqual(
      expect.objectContaining({ text: 'Delete', style: 'danger', haptic: HapticImpact.Rigid })
    );
    expect(cancel.text).toBe('Keep');
  });
});
