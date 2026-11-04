import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, ViewEncapsulation } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';

/** `primary` — the accent fill of the main action, `secondary` / `tertiary` — the app backgrounds, `ghost` — no fill. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

/** `s` — next to a title or in dense rows, `m` — default, `l` — the main action of a screen or a dialog. */
export type ButtonSize = 's' | 'm' | 'l';

/** Loader size in px for each button size. */
const LOADER_SIZES: Record<ButtonSize, number> = { s: 16, m: 18, l: 22 };

/**
 * A button or a link drawn as one. It stays the native element, so `type`, forms, `routerLink`
 * and `[fyHaptic]` work as usual.
 *
 * ```html
 * <button fyButton type="submit" size="l" block [loading]="saving()">Save</button>
 *
 * <button fyButton type="button" size="s" icon="bi bi-plus-lg" appear (click)="add()">Add</button>
 *
 * <button fyButton type="button" variant="tertiary" iconOnly aria-label="Close" (click)="close()">
 *   <i class="bi bi-x-lg"></i>
 * </button>
 *
 * <a fyButton variant="ghost" routerLink="/settings">Settings</a>
 * ```
 *
 * While `disabled` or `loading` a `<button>` is disabled and a link is taken out of the tab order and
 * stops reacting to taps. A `block` button keeps clear of the bottom safe area, except inside `fy-modal`.
 *
 * The styles are global and single-class, so a class of the page is enough to override them.
 * Tune the look with the `--fy-button-*` custom properties: `primary|secondary|tertiary-background`,
 * `primary|secondary|tertiary|ghost-color`, `gap`, `radius` and `disabled-opacity`.
 */
@Component({
  selector: 'button[fyButton], a[fyButton]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent],
  host: {
    class: 'fy-button',
    '[class.fy-button--primary]': 'variant() === "primary"',
    '[class.fy-button--secondary]': 'variant() === "secondary"',
    '[class.fy-button--tertiary]': 'variant() === "tertiary"',
    '[class.fy-button--ghost]': 'variant() === "ghost"',
    '[class.fy-button--s]': 'size() === "s"',
    '[class.fy-button--m]': 'size() === "m"',
    '[class.fy-button--l]': 'size() === "l"',
    '[class.fy-button--icon]': 'iconOnly()',
    '[class.fy-button--block]': 'block()',
    '[class.fy-button--appear]': 'appear()',
    '[class.fy-button--loading]': 'loading()',
    '[attr.disabled]': 'isButton && inactive() ? "" : null',
    '[attr.aria-disabled]': '!isButton && inactive() ? "true" : null',
    '[attr.tabindex]': '!isButton && inactive() ? -1 : null',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('m');
  /** Icon class drawn before the label, e.g. `bi bi-plus-lg`; a projected `<i>` works too. */
  readonly icon = input<string>();
  /** A round button around a single icon; give it an `aria-label`. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Full width. */
  readonly block = input(false, { transform: booleanAttribute });
  /** Plays a short enter animation whenever the button is inserted, e.g. moving from the empty state up to the title. */
  readonly appear = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a loader in place of the icon and stops the button from reacting until it is done. */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly isButton = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
  protected readonly inactive = computed(() => this.disabled() || this.loading());
  protected readonly loaderSize = computed(() => LOADER_SIZES[this.size()]);
}
