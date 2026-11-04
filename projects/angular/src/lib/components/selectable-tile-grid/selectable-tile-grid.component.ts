import { Component, EventEmitter, forwardRef, inject, Input, Output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { FY_ICONS } from '../../providers/fy-icons';

export interface SelectableTile {
  id: string;
  label: string;
  sublabel?: string;
  /** Icon class shown instead of initials, e.g. `bi bi-people-fill` (groups). */
  icon?: string;
  /** Photo shown instead of initials. */
  imageUrl?: string | null;
  /** Overrides the hashed avatar color, e.g. `var(--fy-gradient)`. */
  background?: string;
}

/**
 * Avatars to pick from, several at a time. Pass `selectedIds` and handle `toggle`, or bind the picked ids
 * with `ngModel` or a form control (an array of ids), which toggles them itself.
 */
@Component({
  selector: 'fy-selectable-tile-grid',
  templateUrl: './selectable-tile-grid.component.html',
  styleUrls: ['./selectable-tile-grid.component.css'],
  imports: [UserAvatarComponent, HapticFeedbackDirective],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectableTileGridComponent), multi: true }]
})
export class SelectableTileGridComponent implements ControlValueAccessor {
  @Input() tiles: SelectableTile[] = [];
  @Input() selectedIds: Set<string> = new Set();
  @Output() toggle = new EventEmitter<string>();

  protected readonly icons = inject(FY_ICONS);

  /** The ids picked through a form; null while no form is bound, and `selectedIds` is in charge. */
  private readonly formIds = signal<ReadonlySet<string> | null>(null);
  protected readonly formDisabled = signal(false);
  private onChange: (ids: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  isSelected(id: string): boolean {
    return (this.formIds() ?? this.selectedIds).has(id);
  }

  onToggle(id: string): void {
    this.toggle.emit(id);
    const picked = this.formIds();
    if (!picked) return;

    const next = new Set(picked);
    if (!next.delete(id)) next.add(id);
    this.formIds.set(next);
    this.onChange([...next]);
    this.onTouched();
  }

  writeValue(ids: Iterable<string> | null): void {
    this.formIds.set(new Set(ids ?? []));
  }

  registerOnChange(fn: (ids: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
