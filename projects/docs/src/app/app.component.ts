import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ButtonComponent, ColorSchemePreference, FyTheme, TooltipDirective } from '@freely-ui/angular';
import { DOCS_BY_GROUP } from './docs/registry';

const SCHEMES: readonly { value: ColorSchemePreference; label: string; icon: string }[] = [
  { value: 'system', label: 'System theme', icon: 'bi bi-circle-half' },
  { value: 'light', label: 'Light theme', icon: 'bi bi-sun' },
  { value: 'dark', label: 'Dark theme', icon: 'bi bi-moon' },
];

/** The site: a header, the menu and the page. */
@Component({
  selector: 'docs-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent, TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly groups = DOCS_BY_GROUP;
  protected readonly guides = [
    { path: '/', label: 'Overview', exact: true },
    { path: '/installation', label: 'Installation', exact: false },
    { path: '/theming', label: 'Theming', exact: false },
    { path: '/telegram', label: 'Telegram Mini Apps', exact: false },
  ];
  protected readonly menuOpen = signal(false);

  private readonly theme = inject(FyTheme);
  protected readonly scheme = computed(() => SCHEMES.find(s => s.value === this.theme.preference()) ?? SCHEMES[0]);

  constructor() {
    // A link in the menu closes it on a phone.
    inject(Router).events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuOpen.set(false));
  }

  protected nextScheme(): void {
    const index = SCHEMES.indexOf(this.scheme());
    this.theme.setPreference(SCHEMES[(index + 1) % SCHEMES.length].value);
  }
}
