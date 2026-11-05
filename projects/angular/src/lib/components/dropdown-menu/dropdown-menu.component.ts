import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Popup menu anchored to a projected trigger. Mark the trigger with
 * `fyDropdownTrigger`, the entries with `fyDropdownItem` (add `[checked]` for a
 * radio-style pick) and separators with `fyDropdownDivider`. Closes on item
 * click, outside click and Escape; arrow keys, Home and End move between items.
 *
 * Self-contained (no app imports). Styles are unencapsulated so they reach the
 * projected items; everything is prefixed `fy-dropdown-menu`. Tune the look with
 * the `--fy-dropdown-menu-*` custom properties.
 *
 * ```html
 * <fy-dropdown-menu label="Actions">
 *   <button fyDropdownTrigger type="button"><i class="bi bi-three-dots"></i></button>
 *   <button fyDropdownItem type="button" (click)="edit()">Edit</button>
 *   <hr fyDropdownDivider />
 *   <button fyDropdownItem type="button" (click)="remove()">Delete</button>
 * </fy-dropdown-menu>
 * ```
 */
@Component({
  selector: 'fy-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-dropdown-menu',
    '[class.fy-dropdown-menu--open]': 'isOpen()',
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'close(true)',
  },
})
export class DropdownMenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** `aria-label` of the menu panel. */
  readonly label = input('');
  /** Which edge of the trigger the panel lines up with. */
  readonly align = input<'start' | 'end'>('end');
  /**
   * Which side of the trigger the panel opens on. `auto` opens it down, or up when it does not fit below and there
   * is more room above; the room is the viewport minus `--fy-dropdown-menu-viewport-inset-top|bottom`, e.g. the height
   * of a bottom navigation dock.
   */
  readonly direction = input<'auto' | 'down' | 'up'>('auto');
  /** Keep the panel open after an item is clicked. */
  readonly keepOpen = input(false, { transform: booleanAttribute });

  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);
  /** Side the open panel is on: `direction`, with `auto` resolved when the panel opens. */
  protected readonly opensUp = signal(false);

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private trigger?: HTMLElement;

  /** Called by `fyDropdownTrigger` so focus can return to it on close. */
  registerTrigger(element: HTMLElement): void {
    this.trigger = element;
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  open(): void {
    if (this.isOpen()) return;
    this.opensUp.set(this.direction() === 'up');
    this.isOpen.set(true);
    this.opened.emit();
    afterNextRender(() => {
      if (this.direction() === 'auto') this.opensUp.set(this.fitsBetterAbove());
      (this.selectedItem() ?? this.items()[0])?.focus();
    }, { injector: this.injector });
  }

  /** Closes the panel; `restoreFocus` moves focus back to the trigger. */
  close(restoreFocus = false): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.closed.emit();
    if (restoreFocus) this.trigger?.focus();
  }

  /** Called by `fyDropdownItem` after its click handlers ran. */
  itemActivated(): void {
    if (!this.keepOpen()) this.close(true);
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = (index + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'Tab':
        this.close();
        return;
      default:
        return;
    }
    event.preventDefault();
    items[next].focus();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  /**
   * Measured while the panel is open below the trigger. The insets come through the panel's `scroll-margin-*`,
   * which the CSS sets from the custom properties, so they arrive resolved to pixels.
   */
  private fitsBetterAbove(): boolean {
    const panel = this.panel().nativeElement;
    const trigger = this.host.nativeElement.getBoundingClientRect();
    const style = getComputedStyle(panel);
    const offset = panel.getBoundingClientRect().top - trigger.bottom;
    const needed = panel.offsetHeight + offset;
    const below = window.innerHeight - (parseFloat(style.scrollMarginBottom) || 0) - trigger.bottom;
    const above = trigger.top - (parseFloat(style.scrollMarginTop) || 0);
    return needed > below && above > below;
  }

  private items(): HTMLElement[] {
    return Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>('.fy-dropdown-menu__item:not([disabled])'),
    );
  }

  private selectedItem(): HTMLElement | null {
    return this.panel().nativeElement.querySelector<HTMLElement>('.fy-dropdown-menu__item[aria-checked="true"]');
  }
}
