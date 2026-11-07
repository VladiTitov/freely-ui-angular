import { Component, signal } from '@angular/core';
import { ItemCardComponent, PullToRefreshComponent, SwipeAction, SwipeActionsComponent } from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN } from './example-styles';

const swipeActions = `
@for (message of messages(); track message.id) {
  <fy-swipe-actions [startActions]="start" [endActions]="end" (action)="onAction(message.id, $event)">
    <fy-item-card [title]="message.title" [subtitle]="message.read ? 'Read' : 'New'" [accent]="!message.read" />
  </fy-swipe-actions>
}
<p>Last action: {{ last() }}</p>
`;

@Component({ selector: 'docs-swipe-actions', imports: [SwipeActionsComponent, ItemCardComponent], template: swipeActions, host: COLUMN })
class SwipeActionsExample {
  protected readonly start: SwipeAction[] = [{ id: 'read', label: 'Read', icon: 'bi bi-envelope-open' }];
  protected readonly end: SwipeAction[] = [
    { id: 'delete', label: 'Delete', icon: 'bi bi-trash3', tone: 'danger' },
    { id: 'mute', label: 'Mute', icon: 'bi bi-bell-slash', tone: 'neutral' },
  ];
  protected readonly messages = signal([
    { id: 1, title: 'Ada booked your wish', read: false },
    { id: 2, title: 'Alan added a new wish', read: false },
    { id: 3, title: 'Book club starts on Friday', read: true },
  ]);
  protected readonly last = signal('—');

  protected onAction(id: number, action: string): void {
    this.last.set(`${action} #${id}`);
    if (action === 'delete') this.messages.update(list => list.filter(message => message.id !== id));
    if (action === 'read') this.messages.update(list => list.map(message => (message.id === id ? { ...message, read: true } : message)));
  }
}

const pullToRefresh = `
<div class="frame">
  <fy-pull-to-refresh [refreshing]="loading()" (refresh)="load()">
    @for (item of items(); track item) {
      <p class="item">{{ item }}</p>
    }
  </fy-pull-to-refresh>
</div>
`;

const pullToRefreshCode = `${pullToRefresh}
// component
protected readonly loading = signal(false);

load() {
  this.loading.set(true);
  this.service.load().subscribe(items => {
    this.items.set(items);
    this.loading.set(false);
  });
}`;

@Component({
  selector: 'docs-pull-to-refresh',
  imports: [PullToRefreshComponent],
  template: pullToRefresh,
  host: COLUMN,
  styles: `
    .frame { height: 260px; overflow-y: auto; border-radius: var(--fy-radius-lg); background: var(--fy-secondary-background); }
    .item { margin: 0; padding: 12px 16px; border-bottom: 1px solid var(--fy-tertiary-background); }
  `,
})
class PullToRefreshExample {
  protected readonly loading = signal(false);
  protected readonly items = signal(['Pull this list down', 'on a touch screen', 'to load it again']);
  private loads = 0;

  protected load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loads++;
      this.items.update(items => [`Loaded ${this.loads} time${this.loads === 1 ? '' : 's'}`, ...items.slice(-3)]);
      this.loading.set(false);
    }, 1200);
  }
}

export const LIST_DOCS: ComponentDoc[] = [
  {
    slug: 'swipe-actions',
    title: 'Swipe actions',
    group: 'Lists',
    summary: 'Buttons under a list row revealed by swiping it sideways; a full swipe runs the outer one.',
    imports: `import { SwipeAction, SwipeActionsComponent } from '@freely-ui/angular';`,
    selectors: ['fy-swipe-actions'],
    examples: [{
      title: 'Messages',
      description: 'Swipe a row left for Delete and Mute, right for Read; swipe it all the way to run the outer button. With a mouse, drag the row.',
      component: SwipeActionsExample,
      code: swipeActions,
    }],
    inputs: [
      { name: 'startActions', type: 'SwipeAction[]', default: '[]', description: 'Revealed by swiping toward the end of the line; the first sits at the outer edge.' },
      { name: 'endActions', type: 'SwipeAction[]', default: '[]', description: 'Revealed by swiping toward the start; the first sits at the outer edge.' },
      { name: 'actionWidth', type: 'number', default: '76', description: 'Width of one button in px.' },
      { name: 'fullSwipe', type: 'boolean', default: 'true', description: 'Swiping past 60% of the row runs its outer action.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'The row does not move.' },
    ],
    outputs: [{ name: 'action', type: 'string', description: 'The id of the action pressed or swiped; the row closes.' }],
    cssVars: [
      { name: '--fy-swipe-actions-radius', default: 'var(--fy-radius-xl)', description: 'Corner radius; matches the item card.' },
      { name: '--fy-swipe-actions-accent / -danger / -neutral', description: 'Fill of the buttons by tone.' },
      { name: '--fy-swipe-actions-color', default: '#fff', description: 'Text and icon colour of the buttons.' },
    ],
    accessibility: [
      'The buttons are real buttons named by their label; focusing one opens its side, so it is in view.',
      'Esc and a tap anywhere else close the row; one row is open at a time.',
      'The click that ends a swipe, and a tap on an open row, do not reach the row itself.',
    ],
  },
  {
    slug: 'pull-to-refresh',
    title: 'Pull to refresh',
    group: 'Lists',
    summary: 'Pulling the content down from the top of its scroll loads it again.',
    imports: `import { PullToRefreshComponent } from '@freely-ui/angular';`,
    selectors: ['fy-pull-to-refresh'],
    examples: [{
      title: 'A list',
      description: 'Touch only. Released past the threshold it emits refresh and spins while refreshing is true; a load the page starts on its own shows nothing.',
      component: PullToRefreshExample,
      code: pullToRefreshCode,
    }],
    inputs: [
      { name: 'refreshing', type: 'boolean', default: 'false', description: 'The load the pull started is running.' },
      { name: 'threshold', type: 'number', default: '64', description: 'How far, in px, the content has to move to refresh.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Ignores the pull.' },
    ],
    outputs: [{ name: 'refresh', type: 'void', description: 'Pulled past the threshold and let go; set refreshing for the time of the load.' }],
    cssVars: [
      { name: '--fy-pull-to-refresh-color', default: 'var(--fy-secondary-text)', description: 'Colour of the arrow and the spinner.' },
      { name: '--fy-pull-to-refresh-icon-size', default: '20px', description: 'Size of the arrow.' },
    ],
    accessibility: [
      'aria-busy while it spins; the spinner is named Refreshing (refreshing of the UI labels).',
      'A gesture only: give keyboard and mouse users a refresh button of their own where it matters.',
      'In a Telegram Mini App the platform adapter turns off the swipe that closes the app, so the pull is the page’s.',
    ],
  },
];
