import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, FY_ICONS, FY_LABELS, HapticFeedbackDirective, HapticImpact } from '@freely-ui/angular';

/**
 * Sticky header for nested pages: a toolbar row with the back button (and optional `[actions]`),
 * then an optional title, then any projected content.
 */
@Component({
  selector: 'fy-nav-header',
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.css'],
  host: { class: 'fy-sticky-wrapper' },
  imports: [ButtonComponent, RouterLink, HapticFeedbackDirective]
})
export class NavHeaderComponent {
  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  @Input({ required: true }) backLink!: string;
  @Input() title = '';
  /** `aria-label` of the back button; `back` of the UI labels when not given. */
  @Input() backLabel?: string;
}
