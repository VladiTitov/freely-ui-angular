import { TestBed } from '@angular/core/testing';
import { provideFyIcons } from '../../providers/fy-icons';
import { provideFyLabels } from '../../providers/fy-labels';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  async function render(value: string) {
    TestBed.configureTestingModule({
      providers: [
        provideFyIcons({ search: 'test-search', close: 'test-close' }),
        provideFyLabels(() => () => ({ clear: 'Очистить' }))
      ]
    });
    const fixture = TestBed.createComponent(SearchBarComponent);
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('takes the leading icon from FY_ICONS', async () => {
    const host = await render('');

    expect(host.querySelector('.fy-search-bar__icon')?.classList).toContain('test-search');
  });

  it('takes the clear button icon and name from FY_ICONS and FY_LABELS', async () => {
    const host = await render('query');
    const clear = host.querySelector<HTMLButtonElement>('.fy-search-bar__clear');

    expect(clear?.getAttribute('aria-label')).toBe('Очистить');
    expect(clear?.querySelector('i')?.classList).toContain('test-close');
  });
});
