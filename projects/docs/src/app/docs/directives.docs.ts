import { Component, inject, Injectable, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  FormFieldComponent,
  FY_HAPTICS,
  FyHaptics,
  HapticFeedbackDirective,
  HapticImpact,
  HapticNotification,
  KeyboardAwareDirective,
  SafeUrlPipe,
  TextareaDirective,
  TextFieldDirective,
  TooltipDirective,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN, ROW } from './example-styles';

const tooltip = `
<button fyButton type="button" variant="tertiary" iconOnly aria-label="Copy" fyTooltip="Copy the link">
  <i class="bi bi-link-45deg"></i>
</button>
<span class="name" fyTooltip="Ada Lovelace, mathematician" tabindex="0">Ada L.</span>
<button fyButton type="button" variant="secondary" fyTooltip="Opens below" fyTooltipPosition="bottom">Below</button>
`;

@Component({
  selector: 'docs-tooltip',
  imports: [TooltipDirective, ButtonComponent],
  template: tooltip,
  host: ROW,
  styles: `.name { border-bottom: 1px dashed var(--fy-secondary-text); }`,
})
class TooltipExample {}

/** Stands in for the platform's haptics, so a desktop browser shows what a phone would play. */
@Injectable()
class HapticLog implements FyHaptics {
  readonly last = signal('nothing yet');

  impact(style: HapticImpact): void {
    this.last.set(`impact ${style}`);
  }

  notification(type: HapticNotification): void {
    this.last.set(`notification ${type}`);
  }

  selection(): void {
    this.last.set('selection');
  }
}

const haptic = `
<button fyButton type="button" variant="secondary" fyHaptic="selection">A tab</button>
<button fyButton type="button" variant="secondary" [fyHaptic]="HapticImpact.Light">Open a menu</button>
<button fyButton type="button" [fyHaptic]="HapticImpact.Medium">Save</button>
<button fyButton type="button" variant="secondary" [fyHaptic]="HapticImpact.Rigid">Delete</button>
<span>Played: {{ log.last() }}</span>
`;

@Component({
  selector: 'docs-haptic',
  imports: [HapticFeedbackDirective, ButtonComponent],
  template: haptic,
  host: ROW,
  providers: [HapticLog, { provide: FY_HAPTICS, useExisting: HapticLog }],
})
class HapticExample {
  protected readonly HapticImpact = HapticImpact;
  protected readonly log = inject(HapticLog);
}

const keyboardAware = `
<div class="sheet" fyKeyboardAware>
  @for (field of fields; track field) {
    <fy-form-field [label]="field">
      <input fyTextField type="text" />
    </fy-form-field>
  }
  <fy-form-field label="Note">
    <textarea fyTextarea rows="2"></textarea>
  </fy-form-field>
</div>
`;

@Component({
  selector: 'docs-keyboard-aware',
  imports: [KeyboardAwareDirective, FormFieldComponent, TextFieldDirective, TextareaDirective],
  template: keyboardAware,
  styles: `
    .sheet { display: flex; flex-direction: column; gap: 12px; max-width: 420px; height: 300px; overflow-y: auto; padding: 16px;
      padding-bottom: calc(16px + var(--fy-kb-inset, 0px)); border-radius: var(--fy-radius-lg); background: var(--fy-secondary-background); }
  `,
})
class KeyboardAwareExample {
  protected readonly fields = ['Title', 'Link', 'Price', 'Size', 'Colour'];
}

export const DIRECTIVE_DOCS: ComponentDoc[] = [
  {
    slug: 'haptic-feedback',
    title: 'Haptic feedback',
    group: 'Directives',
    summary: 'Plays a tactile tick of the platform on click; the controls of the library already use it.',
    imports: `import { HapticFeedbackDirective, HapticImpact, HapticNotification } from '@freely-ui/angular';`,
    selectors: ['[fyHaptic]'],
    examples: [{
      title: 'By what the tap does',
      description: "selection for picking a value, Light for opening or closing something, Medium for the main action, Rigid for a destructive one. A plain browser has no haptics: here a stand-in for FY_HAPTICS shows what a phone would play. HapticNotification is for outcomes, played from code with playHaptic(inject(FY_HAPTICS), …).",
      component: HapticExample,
      code: haptic,
    }],
    inputs: [{
      name: 'fyHaptic',
      type: "HapticImpact | HapticNotification | 'selection'",
      default: 'HapticImpact.Light',
      description: 'What the click plays; always give it a value, an empty attribute is not read as Light.',
    }],
    accessibility: ['Haptics only add to what the control already shows and says; nothing is lost without them.'],
  },
  {
    slug: 'keyboard-aware',
    title: 'Keyboard aware',
    group: 'Directives',
    summary: 'Keeps the focused field of a scroll container above the on-screen keyboard, e.g. in a bottom drawer on iOS.',
    imports: `import { KeyboardAwareDirective } from '@freely-ui/angular';`,
    selectors: ['[fyKeyboardAware]'],
    examples: [{
      title: 'A form in a drawer',
      description: 'On a phone, focus a field low in the sheet: the host scrolls just enough to show it. The host gets the height the keyboard covers as --fy-kb-inset; add it to the bottom padding so the last field can scroll up. On a desktop nothing changes.',
      component: KeyboardAwareExample,
      code: keyboardAware,
    }],
    cssVars: [{ name: '--fy-kb-inset', description: 'Set by the directive on the host: the height covered by the keyboard, 0px while it is closed.' }],
    accessibility: ['Only the host scrolls, by the least amount that shows the field, so the focus and the caret stay in view.'],
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    group: 'Directives',
    summary: 'A short text about an element, on hover after a moment and right away on keyboard focus; use it instead of title.',
    imports: `import { TooltipDirective } from '@freely-ui/angular';`,
    selectors: ['[fyTooltip]'],
    examples: [{ title: 'On buttons and text', description: 'Hover, or focus with Tab; Escape closes it.', component: TooltipExample, code: tooltip }],
    inputs: [
      { name: 'fyTooltip', type: 'string | null', description: 'The text; empty turns the tooltip off.' },
      { name: 'fyTooltipPosition', type: "'top' | 'bottom'", default: "'top'", description: 'Where it opens; it flips when there is no room.' },
    ],
    cssVars: [
      { name: '--fy-tooltip-background', default: 'var(--fy-primary-text)', description: 'Fill of the tooltip.' },
      { name: '--fy-tooltip-color', default: 'var(--fy-primary-background)', description: 'Text of the tooltip.' },
    ],
    accessibility: [
      'role="tooltip", linked with aria-describedby unless it only repeats the aria-label of the element.',
      'Opens on keyboard focus but not on a tap; Escape, blur and leaving close it.',
      'A disabled button gets no mouse events: put the tooltip on a wrapper.',
    ],
  },
];

const safeUrl = `
<input fyTextField type="text" [(ngModel)]="link" placeholder="Paste a link" />
@if (link | safeUrl; as url) {
  <a [href]="url" target="_blank" rel="noopener noreferrer">{{ url }}</a>
} @else {
  <span>Not a link</span>
}
`;

@Component({ selector: 'docs-safe-url', imports: [SafeUrlPipe, TextFieldDirective, FormsModule], template: safeUrl, host: COLUMN })
class SafeUrlExample {
  protected link = 'example.com/wishes';
}

export const PIPE_DOCS: ComponentDoc[] = [
  {
    slug: 'safe-url',
    title: 'Safe URL',
    group: 'Pipes',
    summary: 'Turns what a user typed into an http(s) link, or null when it does not look like one.',
    imports: `import { SafeUrlPipe } from '@freely-ui/angular';`,
    selectors: ['safeUrl'],
    examples: [{
      title: 'A link of a wish',
      description: 'An address without a scheme, like example.com/wishes, gets https://. Anything else, javascript: included, gives null, so the link is never rendered.',
      component: SafeUrlExample,
      code: safeUrl,
    }],
    inputs: [{ name: 'value', type: 'string | null | undefined', description: 'The text to check; returns string | null.' }],
  },
];
