import { Component, inject, signal } from '@angular/core';
import {
  BottomDrawerComponent,
  ButtonComponent,
  DROPDOWN_MENU,
  ModalComponent,
  ModalPanelComponent,
  PopupComponent,
  PopupService,
  PromptModalComponent,
  SlideSheetComponent,
  SlideSheetSlideDirective,
  ToastHostComponent,
  ToastService,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { ROW } from './example-styles';

/** Escape, the backdrop and the page scroll lock are shared by every overlay of the library. */
const OVERLAY_NOTE = 'Escape and a click on the backdrop close the topmost overlay; the page does not scroll while one is open.';

const modal = `
<button fyButton type="button" variant="secondary" (click)="modal.show()">Open a dialog</button>
<button fyButton type="button" variant="secondary" (click)="tall.show()">Open a tall one</button>

<fy-modal #modal (hidden)="closed.set(closed() + 1)">
  <fy-modal-panel title="Rename the list" (close)="modal.hide()">
    <p>The panel gives the title, the close button and the footer.</p>
    <button panelFooter fyButton type="button" size="l" block (click)="modal.hide()">Done</button>
  </fy-modal-panel>
</fy-modal>

<fy-modal #tall>
  <fy-modal-panel title="My friends" height="tall" (close)="tall.hide()">
    <button panelActions fyButton type="button" variant="tertiary" iconOnly aria-label="Add a friend">
      <i class="bi bi-person-plus"></i>
    </button>
    <div class="scroll-area">
      @for (n of rows; track n) {
        <p>Friend {{ n }}</p>
      }
    </div>
  </fy-modal-panel>
</fy-modal>
<span>Closed {{ closed() }} times</span>
`;

@Component({
  selector: 'docs-modal',
  imports: [ModalComponent, ModalPanelComponent, ButtonComponent],
  template: modal,
  host: ROW,
  styles: `.scroll-area { overflow-y: auto; min-height: 0; } .scroll-area p { margin: 0; padding: 10px 0; }`,
})
class ModalExample {
  protected readonly closed = signal(0);
  protected readonly rows = Array.from({ length: 30 }, (_, i) => i + 1);
}

const modalPanel = `
<button fyButton type="button" variant="secondary" (click)="auto.show()">Auto</button>
<button fyButton type="button" variant="secondary" (click)="full.show()">Full</button>

<fy-modal #auto>
  <fy-modal-panel title="Grows with the content" (close)="auto.hide()">
    <p>A short note.</p>
  </fy-modal-panel>
</fy-modal>

<fy-modal #full>
  <fy-modal-panel title="Takes the screen" height="full" closeLabel="Close the filters" (close)="full.hide()">
    <p>The content is a flex column; the part that scrolls is yours.</p>
    <button panelFooter fyButton type="button" size="l" block (click)="full.hide()">Apply</button>
  </fy-modal-panel>
</fy-modal>
`;

@Component({ selector: 'docs-modal-panel', imports: [ModalComponent, ModalPanelComponent, ButtonComponent], template: modalPanel, host: ROW })
class ModalPanelExample {}

const promptModal = `
<button fyButton type="button" variant="secondary" (click)="ask(prompt)">New group</button>
<span>Created: {{ name() }}</span>
<fy-prompt-modal #prompt />
`;

const promptModalCode = `${promptModal}
// component
async ask(prompt: PromptModalComponent) {
  const name = await prompt.open({ title: 'New group', confirmText: 'Create', placeholder: 'Name', maxLength: 30 });
  if (name !== null) this.name.set(name);
}`;

@Component({ selector: 'docs-prompt-modal', imports: [PromptModalComponent, ButtonComponent], template: promptModal, host: ROW })
class PromptModalExample {
  protected readonly name = signal('—');

  protected async ask(prompt: PromptModalComponent): Promise<void> {
    const name = await prompt.open({ title: 'New group', confirmText: 'Create', placeholder: 'Name', maxLength: 30 });
    if (name !== null) this.name.set(name);
  }
}

const popup = `
<button fyButton type="button" variant="secondary" (click)="ask()">Book the wish</button>
<span>Answer: {{ answer() }}</span>
<!-- Once in the app, usually in the root component. -->
<fy-popup />
`;

const popupCode = `${popup}
// component
private readonly popup = inject(PopupService);

async ask() {
  const answer = await this.popup.open({
    title: 'Book the wish?',
    message: 'Ada will not see who booked it.',
    buttons: [
      { value: 'book', text: 'Book', style: 'accent' },
      { value: 'later', text: 'Remind me later' },
      { value: 'no', text: 'Not now', style: 'muted' },
    ],
  });
  this.answer.set(answer); // 'dismiss' for the close button, the backdrop and Escape
}`;

@Component({ selector: 'docs-popup', imports: [PopupComponent, ButtonComponent], template: popup, host: ROW })
class PopupExample {
  private readonly popup = inject(PopupService);
  protected readonly answer = signal('—');

  protected async ask(): Promise<void> {
    const answer = await this.popup.open({
      title: 'Book the wish?',
      message: 'Ada will not see who booked it.',
      buttons: [
        { value: 'book', text: 'Book', style: 'accent' },
        { value: 'later', text: 'Remind me later' },
        { value: 'no', text: 'Not now', style: 'muted' },
      ],
    });
    this.answer.set(answer);
  }
}

const bottomDrawer = `
<button fyButton type="button" variant="secondary" (click)="drawer.show()">Add a wish</button>
<span>Opened {{ opened() }} times</span>

<fy-bottom-drawer #drawer (beforeShow)="opened.set(opened() + 1)">
  <div class="form">
    <h3>New wish</h3>
    <p>The drawer hosts a full-height form; the form can inject the drawer to close it.</p>
    <button fyButton type="button" size="l" block (click)="drawer.hide()">Save</button>
  </div>
</fy-bottom-drawer>
`;

@Component({
  selector: 'docs-bottom-drawer',
  imports: [BottomDrawerComponent, ButtonComponent],
  template: bottomDrawer,
  host: ROW,
  styles: `.form { display: flex; flex-direction: column; gap: 12px; padding: 20px; } .form h3, .form p { margin: 0; }`,
})
class BottomDrawerExample {
  protected readonly opened = signal(0);
}

const slideSheet = `
<button fyButton type="button" variant="secondary" (click)="mode.set('sheet')">What's new</button>
<button fyButton type="button" variant="secondary" (click)="mode.set('full')">Onboarding</button>

@if (mode(); as current) {
  <fy-slide-sheet [mode]="current" caption="What's new" label="Tour" (closed)="mode.set(null)">
    @for (slide of slides; track slide.title) {
      <ng-template fySlideSheetSlide>
        <div class="slide">
          <i [class]="slide.icon"></i>
          <h3>{{ slide.title }}</h3>
          <p>{{ slide.text }}</p>
        </div>
      </ng-template>
    }
  </fy-slide-sheet>
}
`;

@Component({
  selector: 'docs-slide-sheet',
  imports: [SlideSheetComponent, SlideSheetSlideDirective, ButtonComponent],
  template: slideSheet,
  host: ROW,
  styles: `
    .slide { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; text-align: center; }
    .slide i { font-size: 48px; color: var(--fy-accent); }
    .slide h3, .slide p { margin: 0; }
  `,
})
class SlideSheetExample {
  protected readonly mode = signal<'sheet' | 'full' | null>(null);
  protected readonly slides = [
    { icon: 'bi bi-gift', title: 'Wishes', text: 'Make a list of what you would like to get.' },
    { icon: 'bi bi-people', title: 'Friends', text: 'See what your friends wish for.' },
    { icon: 'bi bi-bookmark-check', title: 'Bookings', text: 'Book a gift so nobody else buys it.' },
  ];
}

const dropdownMenu = `
<fy-dropdown-menu label="Wish actions">
  <button fyDropdownTrigger fyButton type="button" variant="tertiary" iconOnly aria-label="Wish actions">
    <i class="bi bi-three-dots"></i>
  </button>
  <button fyDropdownItem type="button" (click)="last.set('Edit')">Edit</button>
  <button fyDropdownItem type="button" (click)="last.set('Share')">Share</button>
  <hr fyDropdownDivider />
  <button fyDropdownItem type="button" (click)="last.set('Delete')">Delete</button>
</fy-dropdown-menu>

<fy-dropdown-menu label="Size" align="start" keepOpen>
  <button fyDropdownTrigger fyButton type="button" variant="secondary">Size: {{ size() }}</button>
  @for (option of sizes; track option) {
    <button fyDropdownItem type="button" [checked]="option === size()" (click)="size.set(option)">
      {{ option }} <i class="fy-dropdown-menu__check bi bi-check2"></i>
    </button>
  }
</fy-dropdown-menu>
<span>Last action: {{ last() }}</span>
`;

@Component({ selector: 'docs-dropdown-menu', imports: [DROPDOWN_MENU, ButtonComponent], template: dropdownMenu, host: ROW })
class DropdownMenuExample {
  protected readonly last = signal('—');
  protected readonly sizes = ['S', 'M', 'L'];
  protected readonly size = signal('M');
}

const toast = `
<button fyButton type="button" variant="secondary" (click)="info()">Copy the link</button>
<button fyButton type="button" variant="secondary" (click)="error()">Fail to save</button>
<!-- Once in the app shell. -->
<fy-toast-host />
`;

const toastCode = `${toast}
// component
private readonly toasts = inject(ToastService);

info() {
  this.toasts.show({ message: 'The link is copied' });
}

error() {
  this.toasts.show({ message: 'The wish was not saved', tone: 'error', action: { text: 'Retry', run: () => this.save() } });
}`;

@Component({ selector: 'docs-toast', imports: [ToastHostComponent, ButtonComponent], template: toast, host: ROW })
class ToastExample {
  private readonly toasts = inject(ToastService);

  protected info(): void {
    this.toasts.show({ message: 'The link is copied' });
  }

  protected error(): void {
    this.toasts.show({ message: 'The wish was not saved', tone: 'error', action: { text: 'Retry', run: () => this.info() } });
  }
}

export const OVERLAY_DOCS: ComponentDoc[] = [
  {
    slug: 'bottom-drawer',
    title: 'Bottom drawer',
    group: 'Overlays',
    summary: 'A sheet that slides up from the bottom and hosts a full-height form.',
    imports: `import { BottomDrawerComponent } from '@freely-ui/angular';`,
    selectors: ['fy-bottom-drawer'],
    examples: [{
      title: 'A form',
      description: 'Open and close it with show() and hide(). The projected form can inject BottomDrawerComponent to close the drawer itself.',
      component: BottomDrawerExample,
      code: bottomDrawer,
    }],
    outputs: [
      { name: 'beforeShow', type: 'void', description: 'Right before the drawer starts opening, e.g. to reset the form.' },
      { name: 'hidden', type: 'void', description: 'The drawer has finished closing.' },
    ],
    accessibility: [
      'role="dialog" with aria-modal; name it with aria-label or aria-labelledby on the element.',
      OVERLAY_NOTE,
      'The focus stays where it was: move it into the form when it opens.',
    ],
  },
  {
    slug: 'dropdown-menu',
    title: 'Dropdown menu',
    group: 'Overlays',
    summary: 'A menu anchored to a trigger, with plain or radio entries and separators.',
    imports: `import { DROPDOWN_MENU } from '@freely-ui/angular';`,
    selectors: ['fy-dropdown-menu', '[fyDropdownTrigger]', '[fyDropdownItem]', '[fyDropdownDivider]'],
    examples: [{
      title: 'Actions and a pick',
      description: '[checked] turns an entry into a radio option and shows its .fy-dropdown-menu__check child. keepOpen leaves the menu open after a click.',
      component: DropdownMenuExample,
      code: dropdownMenu,
    }],
    inputs: [
      { name: 'label', type: 'string', default: "''", description: 'Name of the menu.' },
      { name: 'align', type: "'start' | 'end'", default: "'end'", description: 'Edge of the trigger the menu lines up with.' },
      { name: 'direction', type: "'auto' | 'down' | 'up'", default: "'auto'", description: 'Side it opens on; auto opens up when there is no room below.' },
      { name: 'keepOpen', type: 'boolean', default: 'false', description: 'Keeps the menu open after an entry is clicked.' },
      { name: 'checked', type: 'boolean', description: 'fyDropdownItem: makes the entry a radio option.' },
    ],
    outputs: [
      { name: 'opened', type: 'void', description: 'The menu opened.' },
      { name: 'closed', type: 'void', description: 'The menu closed.' },
    ],
    cssVars: [
      { name: '--fy-dropdown-menu-panel-width', default: '220px', description: 'Width of the menu.' },
      { name: '--fy-dropdown-menu-panel-bg', default: 'var(--fy-secondary-background)', description: 'Fill of the menu.' },
      { name: '--fy-dropdown-menu-panel-radius', default: '18px', description: 'Corner radius.' },
      { name: '--fy-dropdown-menu-panel-shadow', default: 'var(--fy-shadow-m)', description: 'Shadow.' },
      { name: '--fy-dropdown-menu-offset', default: '8px', description: 'Gap between the trigger and the menu.' },
      { name: '--fy-dropdown-menu-font-size', default: '14px', description: 'Size of the entries.' },
      { name: '--fy-dropdown-menu-color', default: 'inherit', description: 'Text of the entries.' },
      { name: '--fy-dropdown-menu-accent', default: 'currentColor', description: 'Colour of the checked entry.' },
      { name: '--fy-dropdown-menu-item-hover-bg', description: 'Fill of an entry on hover.' },
      { name: '--fy-dropdown-menu-divider-color', description: 'Colour of the separators.' },
      { name: '--fy-dropdown-menu-viewport-inset-top / -bottom', default: 'the safe areas', description: 'Room kept free when deciding to open up, e.g. a bottom navigation.' },
      { name: '--fy-dropdown-menu-z-index', default: '10', description: 'Layer of the menu.' },
    ],
    accessibility: [
      'The trigger has aria-haspopup="menu" and aria-expanded; the menu is role="menu" named by label.',
      'Entries are menuitem, or menuitemradio with aria-checked; separators are role="separator".',
      'The arrow keys, Home and End move between the entries; Escape and a click outside close the menu and return the focus to the trigger.',
    ],
  },
  {
    slug: 'modal',
    title: 'Modal',
    group: 'Overlays',
    summary: 'A centred dialog over a backdrop; put a modal panel inside for the title, the close button and the footer.',
    imports: `import { ModalComponent, ModalPanelComponent } from '@freely-ui/angular';`,
    selectors: ['fy-modal'],
    examples: [{
      title: 'Short and tall',
      description: 'Open and close it with show() and hide(); the panel only asks to be closed, the owner hides the modal.',
      component: ModalExample,
      code: modal,
    }],
    outputs: [{ name: 'hidden', type: 'void', description: 'The modal has finished closing.' }],
    cssVars: [
      { name: '--fy-modal-width', default: '600px', description: 'Width of the dialog.' },
      { name: '--fy-modal-gap-x / -gap-y', description: 'Space between the dialog and the edges of the screen.' },
    ],
    accessibility: ['role="dialog" with aria-modal.', OVERLAY_NOTE, 'The focus stays where it was: move it into the dialog when it opens.'],
  },
  {
    slug: 'modal-panel',
    title: 'Modal panel',
    group: 'Overlays',
    summary: 'The card of a dialog: a title with a close button, the content and a footer.',
    imports: `import { ModalPanelComponent } from '@freely-ui/angular';`,
    selectors: ['fy-modal-panel'],
    examples: [{
      title: 'Auto and full height',
      description: 'Slots: [panelActions] next to the close button and [panelFooter] under the content. In a tall or full panel the content is a flex column: give the part that scrolls overflow-y: auto.',
      component: ModalPanelExample,
      code: modalPanel,
    }],
    inputs: [
      { name: 'title', type: 'string', default: "''", description: 'Heading of the panel.' },
      { name: 'height', type: "'auto' | 'tall' | 'full'", default: "'auto'", description: 'auto grows with the content; tall and full take a share of the screen and scroll inside.' },
      { name: 'closeLabel', type: 'string', description: 'Name of the close button; close of the UI labels by default.' },
    ],
    outputs: [{ name: 'close', type: 'void', description: 'The close button was pressed; hide the modal.' }],
    cssVars: [
      { name: '--fy-modal-panel-max-width', default: '375px', description: 'Width of the panel.' },
      { name: '--fy-modal-panel-max-height', description: 'Height of a tall panel.' },
    ],
    accessibility: ['The close button is named by closeLabel.'],
  },
  {
    slug: 'popup',
    title: 'Popup',
    group: 'Overlays',
    summary: 'A question with buttons of your own, asked through PopupService and answered with the value of the button pressed.',
    imports: `import { PopupComponent, PopupService } from '@freely-ui/angular';`,
    selectors: ['fy-popup'],
    examples: [{
      title: 'Three answers',
      description: 'Place one fy-popup in the app; open() resolves with the value of the button, or dismissValue for the close button, the backdrop and Escape. For a yes or no, FyConfirmService is shorter.',
      component: PopupExample,
      code: popupCode,
    }],
    inputs: [
      { name: 'title', type: 'string', description: 'open(): heading of the popup.' },
      { name: 'message', type: 'string', description: 'open(): text under the heading.' },
      { name: 'content, contentContext', type: 'TemplateRef, object', description: 'open(): a template shown under the message, and its context.' },
      { name: 'buttons', type: 'PopupButton[]', description: "open(): { value, text, style?: 'accent' | 'danger' | 'muted', haptic? }." },
      { name: 'dismissValue', type: 'string', default: "'dismiss'", description: 'open(): the answer when the popup is dismissed.' },
      { name: 'showClose', type: 'boolean', default: 'true', description: 'open(): the close button in the corner.' },
      { name: 'wordBreak', type: 'boolean', default: 'false', description: 'open(): breaks long words, e.g. a link.' },
    ],
    accessibility: ['role="dialog" with aria-modal; the close button is named close of the UI labels.', OVERLAY_NOTE],
  },
  {
    slug: 'prompt-modal',
    title: 'Prompt modal',
    group: 'Overlays',
    summary: 'A dialog that asks for one line of text and resolves with it.',
    imports: `import { PromptModalComponent } from '@freely-ui/angular';`,
    selectors: ['fy-prompt-modal'],
    examples: [{
      title: 'Naming a group',
      description: 'open() resolves with the trimmed text, or null when dismissed. Enter confirms; the button is off while the field is blank.',
      component: PromptModalExample,
      code: promptModalCode,
    }],
    inputs: [
      { name: 'title', type: 'string', description: 'open(): heading of the dialog.' },
      { name: 'confirmText', type: 'string', description: 'open(): text of the button.' },
      { name: 'placeholder', type: 'string', description: 'open(): placeholder of the field.' },
      { name: 'initialValue', type: 'string', description: 'open(): text the field starts with.' },
      { name: 'maxLength', type: 'number', default: '50', description: 'open(): longest text allowed.' },
    ],
    accessibility: ['The field takes the focus when the dialog opens.', OVERLAY_NOTE],
  },
  {
    slug: 'slide-sheet',
    title: 'Slide sheet',
    group: 'Overlays',
    summary: 'Swipeable slides with dots and a next button, as a sheet or over the whole screen.',
    imports: `import { SlideSheetComponent, SlideSheetSlideDirective } from '@freely-ui/angular';`,
    selectors: ['fy-slide-sheet', 'ng-template[fySlideSheetSlide]'],
    examples: [{
      title: "What's new and an onboarding",
      description: 'Mount it while it should be shown; it starts on the first slide. A sheet has a caption and a close button, full has a skip button instead.',
      component: SlideSheetExample,
      code: slideSheet,
    }],
    inputs: [
      { name: 'mode', type: "'sheet' | 'full'", default: "'sheet'", description: 'Slides up from the bottom, or covers the screen.' },
      { name: 'caption', type: 'string | null', default: 'null', description: 'Shown above the slides of a sheet.' },
      { name: 'label', type: 'string | null', default: 'null', description: 'Name of the dialog; the caption by default.' },
      { name: 'doneLabel', type: 'string | null', default: 'null', description: 'Button on the last slide; slideDone of the UI labels by default.' },
      { name: 'quietDone', type: 'boolean', default: 'false', description: 'Tones the last button down when the last slide has an action of its own.' },
    ],
    outputs: [{ name: 'closed', type: 'void', description: 'Close, skip, the backdrop of a sheet or the button on the last slide; unmount it.' }],
    accessibility: [
      'role="dialog" with aria-modal, named by label or the caption.',
      'The dots are hidden from screen readers; the next button moves on and names the last step.',
    ],
  },
  {
    slug: 'toast',
    title: 'Toast',
    group: 'Overlays',
    summary: 'A short message above the bottom of the screen that does not stop the user, with an optional action.',
    imports: `import { ToastHostComponent, ToastService } from '@freely-ui/angular';`,
    selectors: ['fy-toast-host'],
    examples: [{
      title: 'A note and an error with a retry',
      description: 'Place one fy-toast-host in the app shell. One toast at a time: a new one replaces the shown one. An error toast also plays the error haptic; a tap hides it.',
      component: ToastExample,
      code: toastCode,
    }],
    inputs: [
      { name: 'message', type: 'string', description: 'show(): the text.' },
      { name: 'tone', type: "'info' | 'error'", default: "'info'", description: 'show(): an error gets an icon and the error haptic.' },
      { name: 'action', type: '{ text, run }', description: 'show(): a button next to the message; pressing it hides the toast.' },
      { name: 'duration', type: 'number', default: '4000, 6000 with an action', description: 'show(): how long it stays, in ms.' },
    ],
    cssVars: [{ name: '--fy-toast-bottom', default: 'calc(72px + var(--fy-safe-bottom))', description: 'Lifts the toast over a bottom navigation.' }],
    accessibility: ['The region is aria-live="polite" and every toast role="status", so screen readers read it without moving the focus.'],
  },
];
