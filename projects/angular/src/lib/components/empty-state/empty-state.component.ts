import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Presentational empty state: a round icon badge, a label and a description.
 * Every part is optional — render whichever inputs are provided.
 *
 * Self-contained (no app imports, no icon-font dependency): the caller passes a
 * ready-made icon class such as `"bi bi-people"` and this component only echoes
 * it onto an `<i>`. Tune the look with the `--fy-empty-state-*` custom properties.
 *
 * ```html
 * <fy-empty-state
 *   icon="bi bi-people"
 *   label="No friends yet"
 *   description="Invite friends to see them here." />
 * ```
 *
 * Projected content is rendered under the text as a call to action.
 */
@Component({
  selector: 'fy-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fy-empty-state' },
})
export class EmptyStateComponent {
  /** Icon class string applied verbatim to an `<i>`, e.g. `"bi bi-inbox"`. */
  @Input() icon?: string | null;

  /** Primary line. */
  @Input() label?: string | null;

  /** Secondary line rendered under the label. */
  @Input() description?: string | null;
}
