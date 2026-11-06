import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_BY_GROUP } from '../docs/registry';

@Component({
  selector: 'docs-components',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page.css',
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
    .tile { display: flex; flex-direction: column; gap: 6px; height: 100%; box-sizing: border-box; padding: 16px 18px;
      border-radius: var(--fy-radius-md); background: var(--fy-primary-background); color: var(--fy-primary-text); text-decoration: none; }
    .tile:hover { outline: 1.5px solid var(--fy-accent); }
    .tile strong { font-size: var(--fy-font-size-l); }
    .tile span { color: var(--fy-secondary-text); line-height: 1.45; }
  `,
  template: `
    <article class="page">
      <p class="page__eyebrow">Components</p>
      <h1 class="page__title">Components</h1>
      <p class="page__lead">Every component is standalone and imported from <code>&#64;freely-ui/angular</code>.</p>
      @for (section of groups; track section.group) {
        <h2 class="page__section">{{ section.group }}</h2>
        <ul class="grid">
          @for (doc of section.docs; track doc.slug) {
            <li>
              <a class="tile" [routerLink]="['/components', doc.slug]">
                <strong>{{ doc.title }}</strong>
                <span>{{ doc.summary }}</span>
              </a>
            </li>
          }
        </ul>
      }
    </article>
  `,
})
export class ComponentsComponent {
  protected readonly groups = DOCS_BY_GROUP;
}
