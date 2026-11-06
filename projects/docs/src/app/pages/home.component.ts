import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@freely-ui/angular';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DOCS_BY_GROUP } from '../docs/registry';

@Component({
  selector: 'docs-home',
  imports: [RouterLink, ButtonComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page.css',
  styles: `
    .hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 32px; }
    .features { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin: 0 0 16px; padding: 0; list-style: none; }
    .feature { padding: 18px; border-radius: var(--fy-radius-md); background: var(--fy-primary-background); }
    .feature i { color: var(--fy-accent); font-size: var(--fy-font-size-xl); }
    .feature h3 { margin: 10px 0 6px; font-size: var(--fy-font-size-l); }
    .feature p { margin: 0; color: var(--fy-secondary-text); }
    .groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .groups h3 { margin: 0 0 8px; font-size: var(--fy-font-size-m); color: var(--fy-secondary-text); }
    .groups ul { margin: 0; padding: 0; list-style: none; }
    .groups li + li { margin-top: 6px; }
  `,
  template: `
    <article class="page">
      <p class="page__eyebrow">Angular UI kit · MIT</p>
      <h1 class="page__title">Freely UI</h1>
      <p class="page__lead">
        A free, open-source UI kit for Angular, made for mobile-first web apps and Telegram Mini Apps:
        standalone, signal-based components, light and dark themes, haptics and safe areas, forms support and
        accessible markup.
      </p>
      <div class="hero__actions">
        <a fyButton size="l" routerLink="/installation">Get started</a>
        <a fyButton size="l" variant="tertiary" routerLink="/components">Browse components</a>
      </div>

      <docs-code language="bash" code="npm install @freely-ui/angular" />

      <h2 class="page__section">Why Freely UI</h2>
      <ul class="features">
        <li class="feature">
          <i class="bi bi-phone" aria-hidden="true"></i>
          <h3>Mobile first</h3>
          <p>Touch-sized controls, safe areas, haptics and a keyboard-aware layout.</p>
        </li>
        <li class="feature">
          <i class="bi bi-telegram" aria-hidden="true"></i>
          <h3>Telegram Mini Apps</h3>
          <p>One provider wires the theme, the back button, haptics and storage to Telegram.</p>
        </li>
        <li class="feature">
          <i class="bi bi-lightning" aria-hidden="true"></i>
          <h3>Modern Angular</h3>
          <p>Standalone components, signals, OnPush and no zone.js or @angular/animations.</p>
        </li>
        <li class="feature">
          <i class="bi bi-ui-checks" aria-hidden="true"></i>
          <h3>Forms and accessibility</h3>
          <p>Every control works with ngModel and reactive forms and has proper ARIA and keyboard support.</p>
        </li>
        <li class="feature">
          <i class="bi bi-palette" aria-hidden="true"></i>
          <h3>Themeable</h3>
          <p>Light and dark themes from --fy- tokens; each component has its own custom properties.</p>
        </li>
        <li class="feature">
          <i class="bi bi-unlock" aria-hidden="true"></i>
          <h3>Free</h3>
          <p>MIT licensed, for personal and commercial projects alike.</p>
        </li>
      </ul>

      <h2 class="page__section">Components</h2>
      <div class="groups">
        @for (section of groups; track section.group) {
          <section>
            <h3>{{ section.group }}</h3>
            <ul>
              @for (doc of section.docs; track doc.slug) {
                <li><a [routerLink]="['/components', doc.slug]">{{ doc.title }}</a></li>
              }
            </ul>
          </section>
        }
      </div>
    </article>
  `,
})
export class HomeComponent {
  protected readonly groups = DOCS_BY_GROUP;
}
