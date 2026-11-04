import { DropdownMenuComponent } from './dropdown-menu.component';
import { DropdownDivider, DropdownItem, DropdownTrigger } from './dropdown-menu.directives';

export { DropdownMenuComponent } from './dropdown-menu.component';
export { DropdownDivider, DropdownItem, DropdownTrigger } from './dropdown-menu.directives';

export const DROPDOWN_MENU = [DropdownMenuComponent, DropdownTrigger, DropdownItem, DropdownDivider] as const;
