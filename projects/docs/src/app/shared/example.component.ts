import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DocExample } from '../docs/doc.model';
import { CodeBlockComponent } from './code-block.component';

/** An example: its title, the rendered component and the code under it. */
@Component({
  selector: 'docs-example',
  imports: [NgComponentOutlet, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="example" [attr.aria-labelledby]="id()">
      <h3 class="example__title" [id]="id()">{{ example().title }}</h3>
      @if (example().description; as description) {
        <p class="example__description">{{ description }}</p>
      }
      <div class="example__preview">
        <ng-container [ngComponentOutlet]="example().component" />
      </div>
      <docs-code [code]="example().code" language="html" />
    </section>
  `,
  styles: `
    .example {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 40px;
    }
    .example__title {
      margin: 0;
      font-size: var(--fy-font-size-l);
      font-weight: 600;
    }
    .example__description {
      margin: 0;
      color: var(--fy-secondary-text);
    }
    .example__preview {
      padding: 24px;
      border: 1px solid var(--fy-tertiary-background);
      border-radius: var(--fy-radius-md);
      background: var(--fy-primary-background);
      overflow-x: auto;
    }
  `,
})
export class ExampleComponent {
  readonly example = input.required<DocExample>();
  readonly id = input.required<string>();
}
