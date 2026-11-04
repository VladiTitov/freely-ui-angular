import { Component, Input } from '@angular/core';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'fy-avatar-label',
  templateUrl: './avatar-label.component.html',
  imports: [UserAvatarComponent]
})
export class AvatarLabelComponent {
  @Input() fullName: string = '';
  @Input() size: number = 25;
  @Input() fontSize: number = 10;
  @Input() imageUrl?: string | null;
}
