import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  model
} from '@angular/core';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { fieldId } from '../form-field/form-field.token';
import { FY_ICONS } from '../../providers/fy-icons';

/**
 * A section that opens and closes under its title: a heading with a button (`aria-expanded`,
 * `aria-controls`) and a region labelled by it. Works on its own or inside `fy-accordion`.
 *
 * ```html
 * <fy-accordion-item heading="Daily table" [(expanded)]="open">
 *   <table>…</table>
 * </fy-accordion-item>
 * ```
 *
 * The content stays in the page while closed, only hidden. Put extra things in the heading row with
 * `[accordionTitle]`. Tune the look with the `--fy-accordion-*` custom properties.
 */
@Component({
  selector: 'fy-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HapticFeedbackDirective],
  host: {
    class: 'fy-accordion-item',
    '[class.fy-accordion-item--expanded]': 'expanded()',
  },
})
export class AccordionItemComponent {
  readonly heading = input('');
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Level of the title as a heading. */
  readonly headingLevel = input(3);

  protected readonly HapticImpact = HapticImpact;
  protected readonly icons = inject(FY_ICONS);
  protected readonly triggerId = fieldId('accordion-trigger');
  protected readonly panelId = fieldId('accordion-panel');
  private readonly accordion = inject(AccordionComponent, { optional: true });

  toggle(): void {
    if (this.disabled()) return;
    const open = !this.expanded();
    this.expanded.set(open);
    if (open) this.accordion?.opened(this);
  }
}

/**
 * Sections of `fy-accordion-item`, one open at a time unless `multi`.
 *
 * ```html
 * <fy-accordion>
 *   <fy-accordion-item heading="Shipping">…</fy-accordion-item>
 *   <fy-accordion-item heading="Returns">…</fy-accordion-item>
 * </fy-accordion>
 * ```
 */
@Component({
  selector: 'fy-accordion',
  template: '<ng-content />',
  styles: ':host { display: flex; flex-direction: column; gap: var(--fy-accordion-gap, var(--fy-space-s)); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fy-accordion' },
})
export class AccordionComponent {
  /** Lets several sections stay open together. */
  readonly multi = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(AccordionItemComponent, { descendants: true });

  /** Closes the others when one opens, unless `multi`. */
  opened(item: AccordionItemComponent): void {
    if (this.multi()) return;
    for (const other of this.items()) if (other !== item) other.expanded.set(false);
  }
}

export const ACCORDION = [AccordionComponent, AccordionItemComponent] as const;
