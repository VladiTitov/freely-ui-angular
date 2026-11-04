import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent, FY_LABELS, HapticFeedback, HapticFeedbackDirective, HapticImpact } from '@freely-ui/angular';

/** One destination of a {@link NavigationDockComponent}. */
export interface NavigationDockItem {
  /** Router link of the destination. */
  link: string | readonly unknown[];
  /** Icon class echoed onto `<i>`, e.g. `bi bi-house`. */
  icon: string;
  /** Accessible name of the button. */
  label: string;
  /** Highlight only on an exact URL match instead of on any nested route. */
  exact?: boolean;
}

/** Screen edge a {@link NavigationDockComponent} sticks to. */
export type NavigationDockPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Floating navigation: a frosted-glass pill of round icon buttons, one per destination,
 * with the one matching the current route highlighted. It sticks to one edge of the screen:
 * a row at the top or bottom, a column on the left or right. It hides itself while a bottom drawer is open.
 *
 * Whether to show it at all is up to the app (`@if`). Tune with `--fy-navigation-dock-*` custom properties.
 *
 * ```html
 * <fy-navigation-dock [items]="dockItems" label="Main navigation" />
 * ```
 */
@Component({
  selector: 'fy-navigation-dock',
  templateUrl: './navigation-dock.component.html',
  styleUrls: ['./navigation-dock.component.css'],
  imports: [ButtonComponent, RouterLink, RouterLinkActive, HapticFeedbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationDockComponent {
  readonly items = input.required<readonly NavigationDockItem[]>();
  readonly position = input<NavigationDockPosition>('bottom');
  /** `aria-label` of the navigation landmark; `navigation` of the UI labels when not given. */
  readonly label = input<string>();

  protected readonly labels = inject(FY_LABELS);
  /** Tactile feedback given on a tap. */
  readonly haptic = input<HapticFeedback>(HapticImpact.Light);
}
