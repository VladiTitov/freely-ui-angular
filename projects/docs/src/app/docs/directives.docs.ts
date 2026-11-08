import { Component } from '@angular/core';
import { ButtonComponent, TooltipDirective } from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { ROW } from './example-styles';

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

export const DIRECTIVE_DOCS: ComponentDoc[] = [
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
