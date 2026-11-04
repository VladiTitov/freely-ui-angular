import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { fieldId } from '../form-field/form-field.token';
import { FY_LABELS } from '../../providers/fy-labels';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/**
 * A tile with a figure: a big `value`, what it means (`caption`) and room for more. With a `label` the label
 * heads the card and the figure sits low; without one the figure itself heads it.
 *
 * ```html
 * <fy-card [value]="12" caption="wishes on your list" [loading]="loading()">
 *   <button cardAction fyButton variant="tertiary" size="s" iconOnly aria-label="Open"><i class="bi bi-chevron-right"></i></button>
 *   <button cardFooter fyButton size="s">Add</button>
 * </fy-card>
 *
 * <fy-card label="Users" [value]="1280">
 *   <fy-badge cardBadge tone="success">+12</fy-badge>
 *   <span>Active today: 340</span>
 * </fy-card>
 * ```
 *
 * Slots: `[cardAction]` at the end of the first row, `[cardBadge]` beside the value, the content under the
 * caption, `[cardFooter]` at the bottom. While `loading` the value, the caption and the content give way to
 * skeletons. Tune the look with the `--fy-card-*` custom properties.
 */
@Component({
  selector: 'fy-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, SkeletonComponent],
  host: {
    class: 'fy-card',
    '[class.fy-card--labelled]': '!!label()',
    '[attr.aria-labelledby]': 'label() ? labelId : null',
  },
})
export class CardComponent {
  readonly label = input<string>();
  /** Level of the label as a heading. */
  readonly headingLevel = input(2);
  readonly value = input<number | string | null>();
  readonly caption = input<string | null>();
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly labels = inject(FY_LABELS);
  protected readonly labelId = fieldId('card');
  protected readonly hasValue = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && value !== '';
  });
}
