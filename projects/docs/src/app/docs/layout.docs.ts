import { Component, signal } from '@angular/core';
import {
  ACCORDION,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardTrend,
  CarouselComponent,
  CarouselSlideDirective,
  EmptyStateComponent,
  ImageViewerComponent,
  TabsComponent
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN } from './example-styles';

const card = `
<div class="cards">
  <fy-card [value]="12" caption="wishes on your list">
    <button cardAction fyButton variant="tertiary" size="s" iconOnly aria-label="Open the list">
      <i class="bi bi-chevron-right"></i>
    </button>
    <button cardFooter fyButton size="s" icon="bi bi-plus-lg">Add</button>
  </fy-card>

  <fy-card label="Users" [value]="1280">
    <fy-badge cardBadge tone="success" direction="up">+12</fy-badge>
    <span>Active today: 340</span>
  </fy-card>

  <fy-card caption="Loading" [loading]="true" />
</div>
`;

@Component({
  selector: 'docs-card',
  imports: [CardComponent, ButtonComponent, BadgeComponent],
  template: card,
  styles: `.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; } fy-card { min-height: 150px; }`,
})
class CardExample {}

const cardStat = `
<div class="stats">
  <fy-card label="Users" [value]="users()" [trend]="trend" [loading]="users() === null" caption="since yesterday" />
  <fy-card label="Errors" [failed]="true" (retry)="retried.set(retried() + 1)" />
</div>
<p>Retried: {{ retried() }}</p>
`;

@Component({
  selector: 'docs-card-stat',
  imports: [CardComponent],
  template: cardStat,
  styles: `.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; } fy-card { min-height: 170px; }`,
})
class CardStatExample {
  protected readonly users = signal<number | null>(12480);
  protected readonly retried = signal(0);
  protected readonly trend: CardTrend = { direction: 'up', tone: 'success', text: '2.4%', description: 'up 2.4% since yesterday' };
}

const carousel = `
<fy-carousel class="photos" [(index)]="index" label="Photos">
  @for (photo of photos; track photo.url; let i = $index) {
    <ng-template fyCarouselSlide>
      <button type="button" class="slide" (click)="viewer.open(i)">
        <img [src]="photo.url" alt="" [attr.width]="photo.width" [attr.height]="photo.height" />
      </button>
    </ng-template>
  }
</fy-carousel>
<p>Slide {{ index() + 1 }} of {{ photos.length }}</p>
<fy-image-viewer #viewer [images]="photos" />
`;

@Component({
  selector: 'docs-carousel',
  imports: [CarouselComponent, CarouselSlideDirective, ImageViewerComponent],
  template: carousel,
  host: COLUMN,
  styles: `
    .photos { --fy-carousel-aspect-ratio: 4 / 3; --fy-carousel-slide-background: var(--fy-tertiary-background); }
    .slide { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
    .slide img { display: block; width: 100%; height: 100%; object-fit: cover; }
  `,
})
class CarouselExample {
  protected readonly index = signal(0);
  protected readonly photos = [1015, 1016, 1018, 1019, 1021].map(id => ({
    url: `https://picsum.photos/id/${id}/800/600`,
    width: 800,
    height: 600,
  }));
}

const accordion = `
<fy-accordion>
  <fy-accordion-item heading="Shipping">Orders ship within a day.</fy-accordion-item>
  <fy-accordion-item heading="Returns">You can return an item within a month.</fy-accordion-item>
  <fy-accordion-item heading="Gift wrapping" [disabled]="true">Not available yet.</fy-accordion-item>
</fy-accordion>
`;

@Component({ selector: 'docs-accordion', imports: [ACCORDION], template: accordion, host: COLUMN })
class AccordionExample {}

const tabs = `
<fy-tabs [tabs]="['Friends', 'Groups', 'Requests']" [(activeIndex)]="tab" ariaLabel="People" />
<p>Showing tab {{ tab + 1 }}</p>
`;

@Component({ selector: 'docs-tabs', imports: [TabsComponent], template: tabs, host: COLUMN })
class TabsExample {
  protected tab = 0;
}

const emptyState = `
<fy-empty-state icon="bi bi-gift" label="No wishes yet" description="Add the first one, and your friends will see it.">
  <button fyButton type="button" size="s" icon="bi bi-plus-lg">Add a wish</button>
</fy-empty-state>
`;

@Component({ selector: 'docs-empty-state', imports: [EmptyStateComponent, ButtonComponent], template: emptyState })
class EmptyStateExample {}

export const LAYOUT_DOCS: ComponentDoc[] = [
  {
    slug: 'card',
    title: 'Card',
    group: 'Layout',
    summary: 'A tile with a figure: a big value, what it means and room for more, with loading skeletons.',
    imports: `import { CardComponent } from '@freely-ui/angular';`,
    selectors: ['fy-card'],
    examples: [{
      title: 'Figures',
      description: 'Without a label the figure heads the card; with one the label heads it and the figure sits low. Slots: [cardAction], [cardBadge], the content and [cardFooter].',
      component: CardExample,
      code: card,
    }, {
      title: 'Dashboard figures',
      description: 'trend puts the change beside the figure; failed swaps the figure for a message and a retry button. A number value is grouped by locale.',
      component: CardStatExample,
      code: cardStat,
    }],
    inputs: [
      { name: 'label', type: 'string', description: 'Heading of the card.' },
      { name: 'value', type: 'number | string | null', description: 'The figure; a number is grouped by locale, a string is shown as it is.' },
      { name: 'caption', type: 'string | null', description: 'What the figure means.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Skeletons in place of the figure, the caption and the content.' },
      { name: 'trend', type: 'CardTrend | null', default: 'null', description: 'The change of the figure as a badge: { direction, tone, text, description? }.' },
      { name: 'failed', type: 'boolean', default: 'false', description: 'A message and a retry button in place of the figure and the content.' },
      { name: 'failedText', type: 'string', description: 'Message of the failed state; loadFailed of the UI labels by default.' },
      { name: 'retryText', type: 'string', description: 'Text of the retry button; retry of the UI labels by default.' },
      { name: 'locale', type: 'string', description: 'Locale a number value is grouped by; LOCALE_ID by default.' },
      { name: 'headingLevel', type: 'number', default: '2', description: 'Level of the label as a heading.' },
    ],
    outputs: [{ name: 'retry', type: 'void', description: 'The retry button of the failed state was pressed.' }],
    cssVars: [
      { name: '--fy-card-background', default: 'var(--fy-secondary-background)', description: 'Fill of the card.' },
      { name: '--fy-card-padding', description: 'Padding of the card.' },
      { name: '--fy-card-radius', default: 'var(--fy-radius-lg)', description: 'Corner radius.' },
      { name: '--fy-card-value-size', default: 'var(--fy-font-size-xxl)', description: 'Size of the figure.' },
      { name: '--fy-card-figure-offset', default: 'auto', description: 'Space above the figure under a label.' },
    ],
    accessibility: [
      'A labelled card is named by its label, which is a heading; a loading card has aria-busy.',
      'The trend badge is read by its description; the failed state is an alert.',
    ],
  },
  {
    slug: 'carousel',
    title: 'Carousel',
    group: 'Layout',
    summary: 'Slides swiped with native snapping, with dots, a two-way index and slides rendered only once the user gets near them.',
    imports: `import { CarouselComponent, CarouselSlideDirective } from '@freely-ui/angular';`,
    selectors: ['fy-carousel', 'ng-template[fyCarouselSlide]'],
    examples: [{
      title: 'Photos with a viewer',
      description: 'A slide is rendered once it is next to the one in view, so the photos further on load only then. A tap opens the image viewer.',
      component: CarouselExample,
      code: carousel,
    }],
    inputs: [
      { name: 'index', type: 'number', default: '0', description: 'The slide in view, also as [(index)]; setting it scrolls there.' },
      { name: 'label', type: 'string', description: 'Name of the carousel; carousel of the UI labels by default.' },
      { name: 'dots', type: 'boolean', default: 'true', description: 'Dots under the slides; never drawn for a single slide.' },
    ],
    cssVars: [
      { name: '--fy-carousel-slide-width', default: '100%', description: 'Width of a slide; less lets the next one peek in.' },
      { name: '--fy-carousel-gap', default: '0px', description: 'Space between the slides.' },
      { name: '--fy-carousel-aspect-ratio', default: 'auto', description: 'Shape of a slide, e.g. 4 / 3.' },
      { name: '--fy-carousel-radius', default: 'var(--fy-radius-md)', description: 'Corner radius of the track.' },
      { name: '--fy-carousel-slide-background', default: 'transparent', description: 'Fill behind a slide while it loads.' },
      { name: '--fy-carousel-dot-active-color', default: 'var(--fy-accent)', description: 'Colour of the dot in view.' },
    ],
    accessibility: [
      'role="region" with aria-roledescription="carousel"; each slide is a group named like "2 of 5" (carouselSlide of the UI labels).',
      'The track takes the focus: the arrow keys, Home and End move between the slides.',
      'The dots are for pointers only and hidden from screen readers.',
    ],
  },
  {
    slug: 'accordion',
    title: 'Accordion',
    group: 'Layout',
    summary: 'Sections that open and close under their heading, one at a time unless multi.',
    imports: `import { ACCORDION } from '@freely-ui/angular';`,
    selectors: ['fy-accordion', 'fy-accordion-item'],
    examples: [{ title: 'One open at a time', component: AccordionExample, code: accordion }],
    inputs: [
      { name: 'multi', type: 'boolean', default: 'false', description: 'fy-accordion: lets several sections stay open.' },
      { name: 'heading', type: 'string', default: "''", description: 'fy-accordion-item: the title of the section.' },
      { name: 'expanded', type: 'boolean', default: 'false', description: 'fy-accordion-item: open, also as [(expanded)].' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'fy-accordion-item: cannot be opened.' },
      { name: 'headingLevel', type: 'number', default: '3', description: 'fy-accordion-item: level of the heading.' },
    ],
    cssVars: [
      { name: '--fy-accordion-gap', default: 'var(--fy-space-s)', description: 'Space between the sections.' },
      { name: '--fy-accordion-title-size', default: 'var(--fy-font-size-m)', description: 'Size of the headings.' },
      { name: '--fy-accordion-panel-gap', default: 'var(--fy-space-m)', description: 'Space between a heading and its content.' },
    ],
    accessibility: ['Each heading is a button with aria-expanded and aria-controls; the content is a region labelled by it.'],
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    group: 'Layout',
    summary: 'A row of tabs with a sliding indicator; a tab can have a shorter label for narrow screens.',
    imports: `import { TabsComponent } from '@freely-ui/angular';`,
    selectors: ['fy-tabs'],
    examples: [{ title: 'Switching views', component: TabsExample, code: tabs }],
    inputs: [
      { name: 'tabs', type: '(string | TabItem)[]', default: '[]', description: 'The tabs; a TabItem has a label and a shortLabel.' },
      { name: 'activeIndex', type: 'number', default: '0', description: 'The active tab, also as [(activeIndex)].' },
      { name: 'ariaLabel', type: 'string', description: 'Name of the tab list.' },
    ],
    outputs: [{ name: 'activeIndexChange', type: 'number', description: 'A tab was picked.' }],
    cssVars: [
      { name: '--fy-tabs-track-background', description: 'Fill of the track.' },
      { name: '--fy-tabs-indicator-color', description: 'Colour of the indicator.' },
      { name: '--fy-tabs-active-label-color', description: 'Label of the active tab.' },
    ],
  },
  {
    slug: 'empty-state',
    title: 'Empty state',
    group: 'Layout',
    summary: 'An icon, a label and a description for a list with nothing in it, and room for an action.',
    imports: `import { EmptyStateComponent } from '@freely-ui/angular';`,
    selectors: ['fy-empty-state'],
    examples: [{ title: 'With an action', component: EmptyStateExample, code: emptyState }],
    inputs: [
      { name: 'icon', type: 'string | null', description: 'Icon class, e.g. bi bi-inbox.' },
      { name: 'label', type: 'string | null', description: 'What is empty.' },
      { name: 'description', type: 'string | null', description: 'What to do about it.' },
    ],
    cssVars: [
      { name: '--fy-empty-state-icon-size', description: 'Size of the round icon.' },
      { name: '--fy-empty-state-icon-bg', description: 'Fill behind the icon.' },
      { name: '--fy-empty-state-padding', description: 'Padding around the state.' },
    ],
  },
];
