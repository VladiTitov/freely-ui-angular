import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent, FY_LABELS, HapticFeedback, HapticFeedbackDirective, HapticImpact } from '@freely-ui/angular';
import { filter } from 'rxjs';
import { NavigationDockItem } from '../navigation-dock/navigation-dock.component';

/**
 * Navigation that lies under the page: opening it slides the page aside, shrinks and blurs it,
 * and shows a strip of round icon buttons along the left edge, the one matching the current route highlighted.
 * The page can't be tapped meanwhile, a tap on it only closes the menu; so do Escape and arriving at a page.
 *
 * Wraps the page it pushes. The button that opens it is up to the app, as is when to use it at all:
 * while not `enabled` it shows the page as it is. Tune with `--fy-navigation-drawer-*` custom properties.
 * Content marked `drawerFooter` sits at the bottom of the strip, e.g. settings and the account; style it yourself.
 *
 * ```html
 * <fy-navigation-drawer [items]="items" [(open)]="menuOpen" [enabled]="mobile()" label="Main navigation">
 *   <a drawerFooter routerLink="/settings">...</a>
 *   <div class="page">...</div>
 * </fy-navigation-drawer>
 * ```
 */
@Component({
  selector: 'fy-navigation-drawer',
  templateUrl: './navigation-drawer.component.html',
  styleUrls: ['./navigation-drawer.component.css'],
  imports: [ButtonComponent, RouterLink, RouterLinkActive, HapticFeedbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.fy-navigation-drawer--enabled]': 'enabled()',
    '[class.fy-navigation-drawer--pushed]': 'pushed()',
    '(document:keydown.escape)': 'close()'
  }
})
export class NavigationDrawerComponent {
  readonly items = input.required<readonly NavigationDockItem[]>();
  readonly open = model(false);
  /** Off, there is no menu and the page stays where it is. */
  readonly enabled = input(true, { transform: booleanAttribute });
  /** `aria-label` of the navigation landmark; `navigation` of the UI labels when not given. */
  readonly label = input<string>();
  /** Tactile feedback given on a tap. */
  readonly haptic = input<HapticFeedback>(HapticImpact.Light);

  protected readonly labels = inject(FY_LABELS);
  /** An `open` left over from before the drawer was switched off doesn't push the page. */
  protected readonly pushed = computed(() => this.enabled() && this.open());

  constructor() {
    // Picking a page is what the menu is open for, so it gets out of the way once the page is there.
    inject(Router).events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.close());
  }

  protected close(): void {
    this.open.set(false);
  }
}
