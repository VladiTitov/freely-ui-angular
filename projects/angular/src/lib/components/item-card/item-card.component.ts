import { Component, Input, booleanAttribute } from '@angular/core';
import { ItemListHighlightComponent } from '../item-list';

/**
 * Default list row: a rounded surface with a title, an optional subtitle and
 * `[leading]` / `[trailing]` content slots. Title and subtitle pick up the search
 * highlight when rendered inside a searchable `fy-item-list`.
 */
@Component({
  selector: 'fy-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
  imports: [ItemListHighlightComponent]
})
export class ItemCardComponent {
  @Input() title = '';
  @Input() subtitle?: string | null;
  /** Accent border and subtitle, e.g. for a default or selected row. */
  @Input({ transform: booleanAttribute }) accent = false;
  /** Let title and subtitle wrap onto several lines instead of truncating with an ellipsis. */
  @Input({ transform: booleanAttribute }) wrap = false;
}
