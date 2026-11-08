import { Component, signal } from '@angular/core';
import {
  AvatarHeaderComponent,
  AvatarLabelComponent,
  AvatarStackComponent,
  AvatarStackItem,
  ButtonComponent,
  UserAvatarComponent,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN, ROW } from './example-styles';

const avatarHeader = `
<div #scroll class="frame">
  <fy-avatar-header class="header" fullName="Ada Lovelace" secondaryLabel="@ada" [scrollRoot]="scroll"
    [(collapsed)]="collapsed">
    <button avatarHeaderEnd fyButton type="button" variant="tertiary" iconOnly aria-label="Settings">
      <i class="bi bi-gear"></i>
    </button>
  </fy-avatar-header>
  @for (n of rows; track n) {
    <p class="row">Wish {{ n }}</p>
  }
</div>
<p>Scroll the frame: {{ collapsed() ? 'collapsed' : 'expanded' }}</p>

<fy-avatar-header layout="inline" fullName="Alan Turing" primaryLabel="Alan" secondaryLabel="Friend since 2024" [collapsed]="false">
  <span avatarHeaderBelow>12 wishes · 3 booked</span>
</fy-avatar-header>
`;

@Component({
  selector: 'docs-avatar-header',
  imports: [AvatarHeaderComponent, ButtonComponent],
  template: avatarHeader,
  host: COLUMN,
  styles: `
    .frame { height: 280px; overflow-y: auto; border-radius: var(--fy-radius-lg); background: var(--fy-secondary-background); }
    .header { position: sticky; top: 0; z-index: 1; padding: 12px 16px; background: var(--fy-secondary-background); }
    .row { margin: 0; padding: 12px 16px; border-top: 1px solid var(--fy-tertiary-background); }
  `,
})
class AvatarHeaderExample {
  protected readonly collapsed = signal(false);
  protected readonly rows = Array.from({ length: 12 }, (_, i) => i + 1);
}

const avatarLabel = `
<fy-avatar-label fullName="Ada Lovelace" />
<fy-avatar-label fullName="Alan Turing" [size]="32" [fontSize]="13" />
`;

@Component({ selector: 'docs-avatar-label', imports: [AvatarLabelComponent], template: avatarLabel, host: ROW })
class AvatarLabelExample {}

const avatar = `
<fy-user-avatar fullName="Ada Lovelace" />
<fy-user-avatar fullName="Alan Turing" [size]="44" [fontSize]="16" [badge]="3" badgeLabel="3 new wishes" />
<fy-user-avatar fullName="Book club" icon="bi bi-people-fill" [size]="44" [fontSize]="18" />
`;

@Component({ selector: 'docs-avatar', imports: [UserAvatarComponent], template: avatar, host: ROW })
class AvatarExample {}

const avatarStack = `
<fy-avatar-stack [people]="people" [max]="4" />
<fy-avatar-stack [people]="[]" />
`;

@Component({ selector: 'docs-avatar-stack', imports: [AvatarStackComponent], template: avatarStack, host: ROW })
class AvatarStackExample {
  protected readonly people: AvatarStackItem[] = [
    { name: 'Ada Lovelace' },
    { name: 'Alan Turing' },
    { name: 'Grace Hopper' },
    { name: 'Book club', icon: 'bi bi-people-fill' },
    { name: 'Linus Torvalds' },
    { name: 'Margaret Hamilton' },
  ];
}

export const PEOPLE_DOCS: ComponentDoc[] = [
  {
    slug: 'avatar-header',
    title: 'Avatar header',
    group: 'People',
    summary: 'A profile header with an avatar and two lines that collapses into a row as the page scrolls.',
    imports: `import { AvatarHeaderComponent } from '@freely-ui/angular';`,
    selectors: ['fy-avatar-header'],
    examples: [{
      title: 'Collapsing on scroll and inline',
      description: 'It watches scrollRoot, or the nearest .fy-page-scroll-container of fy-page, and animates between the two layouts. A boolean collapsed takes over from the scroll. Slots: [avatarAction] on the avatar, [avatarHeaderEnd] at the end of the row, [avatarHeaderBelow] under it; the last two hide while collapsed.',
      component: AvatarHeaderExample,
      code: avatarHeader,
    }],
    inputs: [
      { name: 'fullName', type: 'string', default: "''", description: 'Gives the initials and the first line.' },
      { name: 'imageUrl', type: 'string | null', description: 'A photo instead of the initials.' },
      { name: 'layout', type: "'stacked' | 'inline'", default: "'stacked'", description: 'Avatar above the text, or the text to its right.' },
      { name: 'primaryLabel', type: 'string | null', description: 'The first line; fullName by default.' },
      { name: 'secondaryLabel', type: 'string | null', description: 'The second line, e.g. @username; hidden when empty.' },
      { name: 'collapsed', type: 'boolean | null', default: 'null', description: 'null follows the scroll; a boolean sets the mode. Also as [(collapsed)].' },
      { name: 'scrollRoot', type: 'HTMLElement | null', description: 'The element to watch; the nearest .fy-page-scroll-container by default.' },
      { name: 'collapseOffset', type: 'number', default: '24', description: 'Scrolled past this, in px, the header collapses.' },
      { name: 'expandOffset', type: 'number', default: '4', description: 'Scrolled back to this, in px, it expands again.' },
      { name: 'expandedSize / collapsedSize', type: 'number', default: '60 / 44', description: 'Size of the avatar in each mode.' },
      { name: 'expandedFontSize / collapsedFontSize', type: 'number', default: '20 / 16', description: 'Size of the initials in each mode.' },
    ],
    outputs: [{ name: 'collapsedChange', type: 'boolean', description: 'The mode followed from the scroll flipped.' }],
    cssVars: [
      { name: '--fy-avatar-header-gap', default: '10px', description: 'Space between the avatar and the text, stacked.' },
      { name: '--fy-avatar-header-gap-inline', default: '14px', description: 'The same, inline.' },
      { name: '--fy-avatar-header-gap-collapsed', default: 'var(--fy-space-m)', description: 'The same, collapsed.' },
      { name: '--fy-avatar-header-primary-size', default: 'var(--fy-font-size-xl)', description: 'Size of the first line.' },
      { name: '--fy-avatar-header-primary-size-collapsed', default: 'var(--fy-font-size-l)', description: 'The same, collapsed.' },
      { name: '--fy-avatar-header-secondary-size', default: 'var(--fy-font-size-m)', description: 'Size of the second line.' },
      { name: '--fy-avatar-header-secondary-size-collapsed', default: 'var(--fy-font-size-s)', description: 'The same, collapsed.' },
    ],
    accessibility: ['The lines are plain text: put the name into a heading of the page when the header is its title.'],
  },
  {
    slug: 'avatar-label',
    title: 'Avatar label',
    group: 'People',
    summary: 'A small avatar with the name next to it, e.g. who booked a wish.',
    imports: `import { AvatarLabelComponent } from '@freely-ui/angular';`,
    selectors: ['fy-avatar-label'],
    examples: [{ title: 'Default and larger', component: AvatarLabelExample, code: avatarLabel }],
    inputs: [
      { name: 'fullName', type: 'string', default: "''", description: 'The name shown, and the initials and the colour.' },
      { name: 'imageUrl', type: 'string | null', description: 'A photo instead of the initials.' },
      { name: 'size', type: 'number', default: '25', description: 'Size of the avatar in pixels.' },
      { name: 'fontSize', type: 'number', default: '10', description: 'Size of the initials in pixels.' },
    ],
  },
  {
    slug: 'user-avatar',
    title: 'User avatar',
    group: 'People',
    summary: 'A photo, or initials on a colour picked from the name, or an icon, with an optional badge.',
    imports: `import { UserAvatarComponent } from '@freely-ui/angular';`,
    selectors: ['fy-user-avatar'],
    examples: [{ title: 'Initials, a badge and an icon', component: AvatarExample, code: avatar }],
    inputs: [
      { name: 'fullName', type: 'string', default: "''", description: 'Gives the initials and the colour.' },
      { name: 'imageUrl', type: 'string | null', description: 'A photo; the initials show while there is none or it fails to load.' },
      { name: 'icon', type: 'string', description: 'Icon class shown instead of the initials.' },
      { name: 'size', type: 'number', default: '60', description: 'Size in pixels.' },
      { name: 'fontSize', type: 'number', default: '20', description: 'Size of the initials in pixels.' },
      { name: 'badge', type: 'number | null', description: 'A count in the corner.' },
      { name: 'badgeLabel', type: 'string', description: 'Spoken text of the badge.' },
    ],
  },
  {
    slug: 'avatar-stack',
    title: 'Avatar stack',
    group: 'People',
    summary: 'Overlapping avatars with a +N badge for whoever does not fit.',
    imports: `import { AvatarStackComponent, AvatarStackItem } from '@freely-ui/angular';`,
    selectors: ['fy-avatar-stack'],
    examples: [{ title: 'A group and an empty one', component: AvatarStackExample, code: avatarStack }],
    inputs: [
      { name: 'people', type: 'AvatarStackItem[]', description: 'The people, as { name, icon?, avatar? }; required.' },
      { name: 'total', type: 'number', description: 'The real number when only a preview is passed.' },
      { name: 'max', type: 'number', default: '4', description: 'Slots in the stack, the +N badge included.' },
      { name: 'size', type: 'number', default: '36', description: 'Size of each avatar in pixels.' },
      { name: 'emptyIcon', type: 'string', description: 'Shown when there is nobody; people of the icons by default.' },
    ],
    cssVars: [
      { name: '--fy-avatar-stack-ring', default: 'var(--fy-secondary-background)', description: 'Ring that separates the avatars.' },
    ],
  },
];
