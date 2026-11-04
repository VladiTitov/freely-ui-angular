import { Component, Input, OnChanges, signal } from '@angular/core';

/** A light fill and a dark shade of the same hue for the initials: about 6:1 contrast in either theme. */
interface AvatarColor {
  background: string;
  text: string;
}

const AVATAR_COLORS: readonly AvatarColor[] = [
  { background: '#f99494', text: '#620e0e' }, // red
  { background: '#f9bd94', text: '#62300e' }, // orange
  { background: '#f9d894', text: '#62460e' }, // amber
  { background: '#f9ef94', text: '#625a0e' }, // yellow
  { background: '#d8f994', text: '#46620e' }, // lime
  { background: '#a9f994', text: '#1f620e' }, // leaf
  { background: '#94f9ae', text: '#0e6223' }, // green
  { background: '#94f9d3', text: '#0e6242' }, // mint
  { background: '#94f9f6', text: '#0e625f' }, // teal
  { background: '#94e5f9', text: '#0e5162' }, // cyan
  { background: '#94cff9', text: '#0e3f62' }, // sky
  { background: '#94b3f9', text: '#0e2762' }, // blue
  { background: '#9494f9', text: '#0e0e62' }, // indigo
  { background: '#b694f9', text: '#2a0e62' }, // violet
  { background: '#d894f9', text: '#460e62' }, // purple
  { background: '#f994f9', text: '#620e62' }, // fuchsia
  { background: '#f994cf', text: '#620e3f' }, // pink
  { background: '#f994ae', text: '#620e23' }, // rose
];

@Component({
  selector: 'fy-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent implements OnChanges {
  @Input() fullName: string = '';
  @Input() size: number = 60;
  @Input() fontSize: number = 20;
  /** Icon class shown instead of initials, e.g. `bi bi-people-fill`. */
  @Input() icon?: string;
  @Input() badge?: number | null;
  @Input() badgeLabel?: string;

  /** Profile photo; initials (or the icon) show while there is none or it fails to load. */
  @Input()
  set imageUrl(value: string | null | undefined) {
    this.image.set(value || null);
    this.imageFailed.set(false);
  }

  protected readonly image = signal<string | null>(null);
  protected readonly imageFailed = signal(false);

  initials: string = '';
  color: AvatarColor = AVATAR_COLORS[0];

  get badgeText(): string | null {
    if (!this.badge || this.badge <= 0) return null;
    return this.badge > 99 ? '99+' : String(this.badge);
  }

  getSizePx(value: number) {
    return `${value}px`;
  }

  // On every change, not once: a list that reuses the avatar for another person must redraw it.
  ngOnChanges() {
    this.generateAvatar();
  }

  private generateAvatar() {
    this.color = AVATAR_COLORS[0];
    this.initials = '';

    if (this.fullName) {
      let hash = 0;
      for (let i = 0; i < this.fullName.length; i++) {
        hash = this.fullName.charCodeAt(i) + ((hash << 5) - hash);
      }
      this.color = AVATAR_COLORS[Math.abs(hash % AVATAR_COLORS.length)];
    }

    if (!this.icon && this.fullName) {
      const names = this.fullName.split(' ');
      this.initials = names.map(n => n[0]).slice(0, 2).join('');
    }
  }
}
