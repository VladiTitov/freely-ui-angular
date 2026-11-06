import { Component } from '@angular/core';
import { AvatarStackComponent, AvatarStackItem, UserAvatarComponent } from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { ROW } from './example-styles';

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
