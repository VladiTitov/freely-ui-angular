import { Component, signal } from '@angular/core';
import { ButtonComponent, ChipComponent } from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { ROW } from './example-styles';

const buttonVariants = `
<button fyButton type="button">Primary</button>
<button fyButton type="button" variant="secondary">Secondary</button>
<button fyButton type="button" variant="tertiary">Tertiary</button>
<button fyButton type="button" variant="ghost">Ghost</button>
`;

@Component({ selector: 'docs-button-variants', imports: [ButtonComponent], template: buttonVariants, styles: ROW })
class ButtonVariantsExample {}

const buttonSizes = `
<button fyButton type="button" size="s" icon="bi bi-plus-lg">Add</button>
<button fyButton type="button" size="m">Medium</button>
<button fyButton type="button" size="l">Large</button>
`;

@Component({ selector: 'docs-button-sizes', imports: [ButtonComponent], template: buttonSizes, styles: ROW })
class ButtonSizesExample {}

const buttonIcons = `
<button fyButton type="button" variant="tertiary" iconOnly aria-label="Close">
  <i class="bi bi-x-lg"></i>
</button>
<button fyButton type="button" variant="secondary" size="s" iconOnly aria-label="Edit">
  <i class="bi bi-pencil"></i>
</button>
<button fyButton type="button" variant="ghost" size="l" iconOnly aria-label="Settings">
  <i class="bi bi-gear"></i>
</button>
`;

@Component({ selector: 'docs-button-icons', imports: [ButtonComponent], template: buttonIcons, styles: ROW })
class ButtonIconsExample {}

const buttonStates = `
<button fyButton type="button" [loading]="saving()" (click)="save()">
  {{ saving() ? 'Saving' : 'Save' }}
</button>
<button fyButton type="button" variant="secondary" disabled>Disabled</button>
<a fyButton variant="ghost" href="https://github.com/VladiTitov/freely-ui-angular">A link</a>
`;

@Component({ selector: 'docs-button-states', imports: [ButtonComponent], template: buttonStates, styles: ROW })
class ButtonStatesExample {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}

const buttonBlock = `
<button fyButton type="submit" size="l" block>Continue</button>
`;

@Component({ selector: 'docs-button-block', imports: [ButtonComponent], template: buttonBlock })
class ButtonBlockExample {}

const chipStatic = `
<fy-chip>Holiday</fy-chip>
<fy-chip muted><i chipLeading class="bi bi-lock"></i>Only me</fy-chip>
<fy-chip size="s" surface="secondary">Small</fy-chip>
<fy-chip size="l">Large</fy-chip>
@if (!removed()) {
  <fy-chip removable (remove)="removed.set(true)">Removable</fy-chip>
}
`;

@Component({ selector: 'docs-chip-static', imports: [ChipComponent], template: chipStatic, styles: ROW })
class ChipStaticExample {
  protected readonly removed = signal(false);
}

const chipToggle = `
@for (tag of tags; track tag) {
  <button fyChip type="button" size="l" [selected]="picked().has(tag)" (click)="toggle(tag)">
    {{ tag }}
  </button>
}
`;

@Component({ selector: 'docs-chip-toggle', imports: [ChipComponent], template: chipToggle, styles: ROW })
class ChipToggleExample {
  protected readonly tags = ['Books', 'Games', 'Travel', 'Music'];
  protected readonly picked = signal(new Set(['Books']));

  protected toggle(tag: string): void {
    const next = new Set(this.picked());
    if (!next.delete(tag)) next.add(tag);
    this.picked.set(next);
  }
}

export const ACTION_DOCS: ComponentDoc[] = [
  {
    slug: 'button',
    title: 'Button',
    group: 'Actions',
    summary: 'A button or a link drawn as one, in four variants and three sizes, with an icon, a loading state and a full-width form.',
    imports: `import { ButtonComponent } from '@freely-ui/angular';`,
    selectors: ['button[fyButton]', 'a[fyButton]'],
    examples: [
      { title: 'Variants', description: 'Primary for the main action, secondary and tertiary on the app backgrounds, ghost without a fill.', component: ButtonVariantsExample, code: buttonVariants },
      { title: 'Sizes', description: 'Small next to a title or in dense rows, medium by default, large for the main action of a screen.', component: ButtonSizesExample, code: buttonSizes },
      { title: 'Icon buttons', description: 'A round button around a single icon; give it an aria-label.', component: ButtonIconsExample, code: buttonIcons },
      { title: 'Loading, disabled and links', description: 'While loading the button shows a loader and does not react. A link keeps its href and router link.', component: ButtonStatesExample, code: buttonStates },
      { title: 'Full width', description: 'The main action at the bottom of a screen; it keeps clear of the bottom safe area.', component: ButtonBlockExample, code: buttonBlock },
    ],
    inputs: [
      { name: 'variant', type: "'primary' | 'secondary' | 'tertiary' | 'ghost'", default: "'primary'", description: 'The fill of the button.' },
      { name: 'size', type: "'s' | 'm' | 'l'", default: "'m'", description: 'Height, padding and font size.' },
      { name: 'icon', type: 'string', description: 'Icon class drawn before the label, e.g. bi bi-plus-lg.' },
      { name: 'iconOnly', type: 'boolean', default: 'false', description: 'A round button around a single icon.' },
      { name: 'block', type: 'boolean', default: 'false', description: 'Full width, clear of the bottom safe area except inside a modal.' },
      { name: 'appear', type: 'boolean', default: 'false', description: 'Plays a short enter animation when the button is inserted.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loader in place of the icon and stops the button from reacting.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables a button; takes a link out of the tab order.' },
    ],
    cssVars: [
      { name: '--fy-button-primary-background', default: 'var(--fy-accent)', description: 'Fill of the primary button.' },
      { name: '--fy-button-primary-color', default: 'var(--fy-on-accent)', description: 'Text of the primary button.' },
      { name: '--fy-button-secondary-background', default: 'var(--fy-secondary-background)', description: 'Fill of the secondary button.' },
      { name: '--fy-button-tertiary-background', default: 'var(--fy-tertiary-background)', description: 'Fill of the tertiary button.' },
      { name: '--fy-button-radius', description: 'Corner radius; round by default, medium for the large size.' },
      { name: '--fy-button-gap', default: '6px', description: 'Space between the icon and the label.' },
      { name: '--fy-button-disabled-opacity', default: '0.5', description: 'Opacity of a disabled button.' },
    ],
    accessibility: [
      'It stays a native button or link, so focus, Enter and Space work as the browser has them.',
      'A loading button gets aria-busy and is disabled until it is done.',
      'A disabled link gets aria-disabled and tabindex="-1".',
      'An icon-only button needs an aria-label.',
    ],
  },
  {
    slug: 'chip',
    title: 'Chip',
    group: 'Actions',
    summary: 'A pill with a short label: a tag, a status, a person or a choice to tap.',
    imports: `import { ChipComponent } from '@freely-ui/angular';`,
    selectors: ['fy-chip', 'button[fyChip]'],
    examples: [
      { title: 'Static chips', description: 'Sizes, the second surface, a muted chip with a leading icon and a removable one.', component: ChipStaticExample, code: chipStatic },
      { title: 'Toggles', description: 'A button chip with selected works as a toggle; bound to a form control it flips by itself.', component: ChipToggleExample, code: chipToggle },
    ],
    inputs: [
      { name: 'size', type: "'s' | 'm' | 'l'", default: "'m'", description: 'Dense rows, default, a row of choices to tap.' },
      { name: 'surface', type: "'secondary' | 'tertiary'", default: "'tertiary'", description: 'Which app background fills the chip.' },
      { name: 'muted', type: 'boolean', default: 'false', description: 'Secondary text colour, for chips that only annotate.' },
      { name: 'selected', type: 'boolean | undefined', description: 'Pressed state of a toggle chip; leave unset for a plain chip.' },
      { name: 'iconOnly', type: 'boolean', default: 'false', description: 'A round chip around a single icon.' },
      { name: 'removable', type: 'boolean', default: 'false', description: 'Adds a cross after the label.' },
      { name: 'removeLabel', type: 'string', description: 'aria-label of the cross; remove of the labels by default.' },
    ],
    outputs: [{ name: 'remove', type: 'void', description: 'The cross of a removable chip was tapped.' }],
    cssVars: [
      { name: '--fy-chip-background', description: 'Fill of the chip.' },
      { name: '--fy-chip-color', description: 'Text colour.' },
      { name: '--fy-chip-selected-background', default: 'var(--fy-accent)', description: 'Fill of a selected chip.' },
      { name: '--fy-chip-selected-color', default: 'var(--fy-on-accent)', description: 'Text of a selected chip.' },
      { name: '--fy-chip-padding-inline', description: 'Horizontal padding.' },
    ],
    accessibility: [
      'A toggle chip has aria-pressed.',
      'The label stays on one line and is cut with an ellipsis when the chip runs out of room.',
    ],
  },
];
