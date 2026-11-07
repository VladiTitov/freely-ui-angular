import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, output } from '@angular/core';
import { fieldId } from '../form-field/form-field.token';
import { FY_LABELS } from '../../providers/fy-labels';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/** A change of the card's figure, drawn as a badge beside it. */
export interface CardTrend {
  /** `flat` draws no arrow. */
  direction: 'up' | 'down' | 'flat';
  /** Whether the change is good news; `neutral` when nothing changed. */
  tone: BadgeTone;
  /** The badge text, e.g. `2.5%`; the arrow carries the sign. */
  text: string;
  /** The change for a screen reader, e.g. "up 2.5% from yesterday"; the text when not given. */
  description?: string;
}

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
 * A figure of a dashboard: a number `value` is grouped by `locale` (`1,280`), `trend` puts the change beside it, and
 * `failed` swaps the figure for a message with a retry button:
 *
 * ```html
 * <fy-card label="Users" [value]="users()" [loading]="users() === null" [failed]="failed()" (retry)="load()"
 *   [trend]="{ direction: 'up', tone: 'success', text: '2.5%', description: 'up 2.5% from yesterday' }">
 *   <a cardAction routerLink="/users" aria-label="Open users">…</a>
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
  imports: [NgTemplateOutlet, BadgeComponent, ButtonComponent, SkeletonComponent],
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
  /** The change of the figure, as a badge beside it. */
  readonly trend = input<CardTrend | null>(null);
  /** The figure could not be loaded: a message and a retry button take the place of the figure and the content. */
  readonly failed = input(false, { transform: booleanAttribute });
  /** Message of the failed state; `loadFailed` of the UI labels when not given. */
  readonly failedText = input<string>();
  /** Text of the retry button; `retry` of the UI labels when not given. */
  readonly retryText = input<string>();
  /** Locale a number `value` is grouped by; `LOCALE_ID` when not given. */
  readonly locale = input<string>();

  /** The retry button of the failed state was pressed; load again and clear `failed`. */
  readonly retry = output<void>();

  protected readonly labels = inject(FY_LABELS);
  private readonly defaultLocale = inject(LOCALE_ID);
  protected readonly labelId = fieldId('card');
  protected readonly hasValue = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && value !== '';
  });
  protected readonly displayValue = computed(() => {
    const value = this.value();
    return typeof value === 'number' ? new Intl.NumberFormat(this.locale() ?? this.defaultLocale).format(value) : value;
  });
  /** The figure is shown: neither loading nor failed. */
  protected readonly ready = computed(() => !this.loading() && !this.failed());
}
