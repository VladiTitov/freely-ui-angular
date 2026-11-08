import { Component, inject, signal } from '@angular/core';
import {
  BadgeComponent,
  ButtonComponent,
  FyConfirmService,
  LoaderComponent,
  PopupComponent,
  ProgressComponent,
  SkeletonComponent
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN, ROW } from './example-styles';

const badge = `
<fy-badge tone="success" direction="up">+12%</fy-badge>
<fy-badge tone="danger" direction="down">−3</fy-badge>
<fy-badge>New</fy-badge>
<fy-badge size="m" color="#ef9f27">Warnings: 18</fy-badge>
`;

@Component({ selector: 'docs-badge', imports: [BadgeComponent], template: badge, host: ROW })
class BadgeExample {}

const progress = `
<fy-progress [value]="level()" [max]="10" label="To the next level" [valueText]="level() + ' of 10'" />
<button fyButton type="button" variant="tertiary" size="s" (click)="level.set((level() + 2) % 12)">Add two</button>
`;

@Component({ selector: 'docs-progress', imports: [ProgressComponent, ButtonComponent], template: progress, host: COLUMN,
  styles: `button { align-self: flex-start; }` })
class ProgressExample {
  protected readonly level = signal(7);
}

const skeleton = `
<div class="row" aria-busy="true" aria-label="Loading">
  <fy-skeleton shape="circle" [width]="48" [height]="48" />
  <div class="lines">
    <fy-skeleton width="70%" [height]="14" />
    <fy-skeleton width="45%" [height]="14" />
  </div>
  <fy-skeleton shape="pill" [width]="88" />
</div>
`;

@Component({
  selector: 'docs-skeleton',
  imports: [SkeletonComponent],
  template: skeleton,
  styles: `.row { display: flex; align-items: center; gap: 12px; max-width: 420px; } .lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }`,
})
class SkeletonExample {}

const loader = `
<fy-loader />
<fy-loader [size]="32" label="Loading wishes" />
<button fyButton type="button" disabled><fy-loader [size]="18" [label]="null" /> Saving</button>
`;

@Component({ selector: 'docs-loader', imports: [LoaderComponent, ButtonComponent], template: loader, host: ROW })
class LoaderExample {}

const confirm = `
<button fyButton type="button" variant="secondary" (click)="leave()">Leave the group</button>
<button fyButton type="button" variant="secondary" (click)="remove()">Delete the wish</button>
<p>Answer: {{ answer() }}</p>
<!-- Once in the app, usually in the root component. -->
<fy-popup />
`;

const confirmCode = `${confirm}
// component
private readonly confirmation = inject(FyConfirmService);

async remove() {
  const yes = await this.confirmation.confirm({
    title: 'Delete the wish?',
    message: 'Friends who booked it will be told.',
    confirmText: 'Delete',
    destructive: true,
  });
  if (yes) { /* delete */ }
}`;

@Component({ selector: 'docs-confirm', imports: [ButtonComponent, PopupComponent], template: confirm, host: ROW })
class ConfirmExample {
  private readonly confirmation = inject(FyConfirmService);
  protected readonly answer = signal('—');

  protected async leave(): Promise<void> {
    const yes = await this.confirmation.confirm({ title: 'Leave the group?', message: 'You can join again with a new invite.' });
    this.answer.set(yes ? 'left' : 'stayed');
  }

  protected async remove(): Promise<void> {
    const yes = await this.confirmation.confirm({
      title: 'Delete the wish?',
      message: 'Friends who booked it will be told.',
      confirmText: 'Delete',
      destructive: true,
    });
    this.answer.set(yes ? 'deleted' : 'kept');
  }
}

export const FEEDBACK_DOCS: ComponentDoc[] = [
  {
    slug: 'confirm',
    title: 'Confirm dialog',
    group: 'Feedback',
    summary: 'A yes/no question in the popup that resolves to a boolean; a destructive answer turns red.',
    imports: `import { FyConfirmService, PopupComponent } from '@freely-ui/angular';`,
    selectors: ['FyConfirmService', 'fy-popup'],
    examples: [{
      title: 'Plain and destructive',
      description: 'confirm() resolves to true only on the confirm button; cancel, the close button, the backdrop and Esc give false. Needs one <fy-popup /> in the app.',
      component: ConfirmExample,
      code: confirmCode,
    }],
    inputs: [
      { name: 'title', type: 'string', description: 'The question.' },
      { name: 'message', type: 'string', description: 'A line under it.' },
      { name: 'content / contentContext', type: 'TemplateRef / object', description: 'A template in place of the message, e.g. the item at stake.' },
      { name: 'confirmText', type: 'string', description: 'Text of the confirm button; confirm of the UI labels by default.' },
      { name: 'cancelText', type: 'string', description: 'Text of the cancel button; cancel of the UI labels by default.' },
      { name: 'destructive', type: 'boolean', default: 'false', description: 'A red confirm button with a rigid haptic, for deleting or declining.' },
      { name: 'wordBreak', type: 'boolean', default: 'false', description: 'Breaks long words of the message, e.g. a link.' },
    ],
    accessibility: ['The popup is a modal dialog (role="dialog", aria-modal); Esc closes it as a cancel.'],
  },
  {
    slug: 'badge',
    title: 'Badge',
    group: 'Feedback',
    summary: 'A small label for a change or a status, with a trend arrow and a tone.',
    imports: `import { BadgeComponent } from '@freely-ui/angular';`,
    selectors: ['fy-badge'],
    examples: [{ title: 'Tones and trends', component: BadgeExample, code: badge }],
    inputs: [
      { name: 'tone', type: "'success' | 'danger' | 'neutral'", default: "'neutral'", description: 'Colour of the badge.' },
      { name: 'size', type: "'s' | 'm'", default: "'s'", description: 'Small or medium.' },
      { name: 'direction', type: "'up' | 'down' | null", default: 'null', description: 'Trend arrow before the text.' },
      { name: 'color', type: 'string | null', default: 'null', description: 'A colour of its own instead of the tone.' },
    ],
    cssVars: [{ name: '--fy-badge-color', description: 'Colour of the badge; set by color.' }],
  },
  {
    slug: 'progress',
    title: 'Progress',
    group: 'Feedback',
    summary: 'A progress bar with its value, range and a spoken text.',
    imports: `import { ProgressComponent } from '@freely-ui/angular';`,
    selectors: ['fy-progress'],
    examples: [{ title: 'Towards a goal', description: 'A value outside the range is drawn at its end.', component: ProgressExample, code: progress }],
    inputs: [
      { name: 'value', type: 'number', default: '0', description: 'The current value.' },
      { name: 'min', type: 'number', default: '0', description: 'Start of the range.' },
      { name: 'max', type: 'number', default: '100', description: 'End of the range.' },
      { name: 'label', type: 'string', description: 'What the bar measures, for assistive tech.' },
      { name: 'valueText', type: 'string', description: 'The value as it should be spoken, e.g. 7 of 10.' },
    ],
    cssVars: [
      { name: '--fy-progress-color', default: 'var(--fy-accent)', description: 'Colour of the fill.' },
      { name: '--fy-progress-track', default: 'var(--fy-tertiary-background)', description: 'Colour of the track.' },
      { name: '--fy-progress-height', default: '4px', description: 'Thickness of the bar.' },
    ],
    accessibility: ['role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax and, when given, aria-valuetext and aria-label.'],
  },
  {
    slug: 'skeleton',
    title: 'Skeleton',
    group: 'Feedback',
    summary: 'A pulsing placeholder for content that is still loading.',
    imports: `import { SkeletonComponent } from '@freely-ui/angular';`,
    selectors: ['fy-skeleton'],
    examples: [{ title: 'A loading row', description: 'Size it with width and height, a number being pixels, or with a class of the page.', component: SkeletonExample, code: skeleton }],
    inputs: [
      { name: 'shape', type: "'line' | 'circle' | 'pill'", default: "'line'", description: 'A rounded bar, an avatar or a button.' },
      { name: 'width', type: 'number | string', description: 'Width; a number is in pixels.' },
      { name: 'height', type: 'number | string', description: 'Height; a number is in pixels.' },
    ],
    accessibility: ['Skeletons are hidden from assistive tech: say "loading" on their container with aria-busy and aria-label.'],
  },
  {
    slug: 'loader',
    title: 'Loader',
    group: 'Feedback',
    summary: 'A spinning ring that follows the surrounding font size; the app can replace it with an indicator of its own.',
    imports: `import { LoaderComponent } from '@freely-ui/angular';`,
    selectors: ['fy-loader'],
    examples: [{ title: 'Sizes and inside a button', component: LoaderExample, code: loader }],
    inputs: [
      { name: 'size', type: 'number | null', default: 'null', description: 'Font size in pixels; the surrounding font size without it.' },
      { name: 'label', type: 'string | null', description: 'Spoken name; loading of the labels by default, null for a decorative loader.' },
      { name: 'indicator', type: 'Type<unknown> | null', default: 'null', description: 'A component drawn instead of the ring; provideLoaderIndicator sets one app-wide.' },
    ],
    accessibility: ['role="status" with the label, so screen readers announce it.'],
  },
];
