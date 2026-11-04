import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';
import { DropdownMenuComponent } from './dropdown-menu.component';

/** The element that opens and closes the enclosing `<fy-dropdown-menu>`. */
@Directive({
  selector: '[fyDropdownTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'menu.isOpen()',
    '(click)': 'menu.toggle()',
    '(keydown.arrowdown)': 'onArrowDown($event)',
  },
})
export class DropdownTrigger {
  protected readonly menu = inject(DropdownMenuComponent);

  constructor() {
    this.menu.registerTrigger(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  }

  protected onArrowDown(event: Event): void {
    event.preventDefault();
    this.menu.open();
  }
}

/**
 * One entry of a `<fy-dropdown-menu>`; clicking it closes the menu (unless
 * `keepOpen`). Set `[checked]` to make it a radio-style option — a child with
 * class `fy-dropdown-menu__check` is then shown only on the checked entry.
 */
@Directive({
  selector: '[fyDropdownItem]',
  host: {
    class: 'fy-dropdown-menu__item',
    '[attr.role]': 'checked() === undefined ? "menuitem" : "menuitemradio"',
    '[attr.aria-checked]': 'checked() ?? null',
    tabindex: '-1',
    '(click)': 'menu.itemActivated()',
  },
})
export class DropdownItem {
  protected readonly menu = inject(DropdownMenuComponent);

  readonly checked = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value)),
  });
}

/** A separator line between groups of `fyDropdownItem`s. */
@Directive({
  selector: '[fyDropdownDivider]',
  host: { class: 'fy-dropdown-menu__divider', role: 'separator' },
})
export class DropdownDivider {}
