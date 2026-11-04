import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SelectFieldComponent } from '../select-field/select-field.component';
import { FilterToggleComponent } from '../filter-toggle/filter-toggle.component';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';

let nextId = 0;

/**
 * Search field with optional filters: put `<fy-select-field>`s inside and a filter
 * toggle appears at the end of the field, opening a panel with them. The toggle
 * shows how many fields differ from their first option; the panel's reset button
 * returns them all to it. Without fields it is a plain search field.
 *
 * The field is `width` wide (`320px` by default) and never wider than its
 * container; a container can override it with `--fy-search-panel-width`, e.g. to
 * stretch it on a narrow screen.
 *
 * Self-contained (no app imports). Tune the look with the `--fy-search-panel-*`
 * custom properties and the field with `--fy-search-bar-*`.
 *
 * ```html
 * <fy-search-panel placeholder="Search" [(query)]="query">
 *   <fy-select-field label="Status" [options]="statuses" [(value)]="status" />
 * </fy-search-panel>
 * ```
 */
@Component({
  selector: 'fy-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.css'],
  imports: [HapticFeedbackDirective, SearchBarComponent, FilterToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-search-panel',
    '[class.fy-search-panel--filterable]': 'filterable()',
    '[style.--_search-panel-width]': 'width()',
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class SearchPanelComponent {
  protected readonly HapticImpact = HapticImpact;
  protected readonly labels = inject(FY_LABELS);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Current query, debounced like `<fy-search-bar>`'s `value`. */
  readonly query = model('');
  readonly placeholder = input('');
  /** `aria-label` of the input; falls back to `placeholder`. */
  readonly ariaLabel = input<string>();
  /** `aria-label` of the clear button; `clear` of the UI labels when not given. */
  readonly clearLabel = input<string>();
  /** Delay in ms before a typed query is written to `query`. */
  readonly debounce = input(150);
  /** CSS width of the field, filter toggle included. */
  readonly width = input('320px');

  /** `aria-label` of the filter toggle and of the panel; `filters` of the UI labels when not given. */
  readonly filtersLabel = input<string>();
  /** `resetFilters` of the UI labels when not given. */
  readonly resetLabel = input<string>();
  /** Icon class of the filter toggle; `filters` of the icons when not given. */
  readonly filtersIcon = input<string>();
  /** Number shown on the toggle; counts the fields that differ from their first option when unset. */
  readonly activeFilters = input<number>();

  /** Fires after the reset button returned the fields to their first options. */
  readonly filtersReset = output<void>();

  protected readonly panelId = `search-panel-${nextId++}`;
  protected readonly isOpen = signal(false);

  private readonly fields = contentChildren(SelectFieldComponent, { descendants: true });
  private readonly toggleRef = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');
  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly filterable = computed(() => this.fields().length > 0);
  protected readonly activeCount = computed(
    () => this.activeFilters() ?? this.fields().filter(field => !field.isDefault()).length,
  );
  /** Whether a query is typed or a filter differs from its first option. */
  readonly applied = computed(() => !!this.query().trim() || this.activeCount() > 0);
  protected readonly filtersText = computed(() => this.filtersLabel() ?? this.labels().filters);
  protected readonly toggleLabel = computed(() => {
    const count = this.activeCount();
    return count ? `${this.filtersText()}: ${count}` : this.filtersText();
  });

  protected toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  protected reset(): void {
    this.fields().forEach(field => field.reset());
    this.filtersReset.emit();
  }

  private open(): void {
    this.isOpen.set(true);
    afterNextRender(
      () => this.panelRef().nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus(),
      { injector: this.injector },
    );
  }

  private close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    if (restoreFocus) this.toggleRef()?.nativeElement.focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  /** Escape inside an open menu of a field closes only that menu. */
  protected onEscape(event: Event): void {
    if ((event.target as Element).closest('.fy-dropdown-menu--open')) return;
    this.close(true);
  }
}
