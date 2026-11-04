import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { DROPDOWN_MENU } from '../dropdown-menu';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

/** One entry of a {@link SortMenuComponent}. */
export interface SortMenuOption {
  id: string;
  label: string;
}

/**
 * Text button showing the selected sort option that opens a menu of all
 * options. The first option is the default. The popup is `<fy-dropdown-menu>`.
 *
 * Self-contained (no app imports besides `shared/dropdown-menu`): icons are
 * class strings echoed onto `<i>`. Tune the trigger with `--fy-sort-menu-*` and
 * the popup with `--fy-dropdown-menu-*` custom properties.
 *
 * ```html
 * <fy-sort-menu [options]="sorts" [(value)]="sortId" label="Order" />
 * ```
 */
@Component({
  selector: 'fy-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.css'],
  imports: [HapticFeedbackDirective, DROPDOWN_MENU],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fy-sort-menu' },
})
export class SortMenuComponent {
  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);

  readonly options = input<readonly SortMenuOption[]>([]);
  /** Selected option id; `null` means the first option. */
  readonly value = model<string | null>(null);
  /** `aria-label` of the toggle button and the menu; `sort` of the UI labels when not given. */
  readonly label = input<string>();
  /** Icon class shown after the selected option's label; `sort` of the icons when not given. */
  readonly icon = input<string>();

  protected readonly text = computed(() => this.label() ?? this.labels().sort);

  /** Id of the option in effect. */
  protected readonly current = computed(() => {
    const options = this.options();
    const value = this.value();
    return options.some(option => option.id === value) ? value : (options[0]?.id ?? null);
  });

  protected readonly currentLabel = computed(
    () => this.options().find(option => option.id === this.current())?.label ?? '',
  );
}
