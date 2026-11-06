import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '@freely-ui/angular';
import { COMPONENT_DOCS, findDoc } from '../docs/registry';
import { ApiTableComponent } from '../shared/api-table.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { ExampleComponent } from '../shared/example.component';

/** The page of one component, drawn from its entry in the registry. */
@Component({
  selector: 'docs-component-page',
  imports: [RouterLink, EmptyStateComponent, ApiTableComponent, CodeBlockComponent, ExampleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './component-page.component.html',
  styleUrl: './page.css',
})
export class ComponentPageComponent {
  /** From the route, `components/:slug`. */
  readonly slug = input.required<string>();

  protected readonly doc = computed(() => findDoc(this.slug()));
  protected readonly neighbours = computed(() => {
    const index = COMPONENT_DOCS.findIndex(doc => doc.slug === this.slug());
    return { previous: COMPONENT_DOCS[index - 1], next: COMPONENT_DOCS[index + 1] };
  });

  constructor() {
    const meta = inject(Meta);
    effect(() => {
      const doc = this.doc();
      if (doc) meta.updateTag({ name: 'description', content: `${doc.title} for Angular: ${doc.summary}` });
    });
  }
}
