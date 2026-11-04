import { Component, inject, Input } from '@angular/core';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { FY_ICONS } from '../../providers/fy-icons';

/** A person, or anything shown like one (e.g. a group) with an icon instead of initials. */
export interface AvatarStackItem {
  /** Full name, for the initials and the accessible name. */
  name: string;
  icon?: string;
  avatar?: { thumbUrl: string } | null;
}

/** Overlapping avatars with a "+N" badge for whoever doesn't fit. */
@Component({
  selector: 'fy-avatar-stack',
  templateUrl: './avatar-stack.component.html',
  styleUrls: ['./avatar-stack.component.css'],
  imports: [UserAvatarComponent]
})
export class AvatarStackComponent {
  @Input({ required: true }) people: readonly AvatarStackItem[] = [];
  /** Real number of people; defaults to `people.length` when only a preview is passed. */
  @Input() total?: number;
  /** Slots in the stack, the "+N" badge included. */
  @Input() max = 4;
  @Input() size = 36;
  /** Shown instead of avatars when there is nobody; `people` of the icons when not given. */
  @Input() emptyIcon = inject(FY_ICONS).people;

  get count(): number {
    return this.total ?? this.people.length;
  }

  /** When not everyone fits, the last slot goes to the "+N" badge. */
  get visible(): readonly AvatarStackItem[] {
    const take = this.count > this.max ? this.max - 1 : this.max;
    return this.people.slice(0, take);
  }

  get hiddenCount(): number {
    return Math.max(0, this.count - this.visible.length);
  }

  get fontSize(): number {
    return Math.round(this.size * 0.36);
  }
}
