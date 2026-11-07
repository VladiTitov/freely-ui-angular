import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';

const STYLES = `"styles": [
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "node_modules/@freely-ui/angular/styles/index.css",
  "src/styles.css"
]`;

const USAGE = `import { Component } from '@angular/core';
import { ButtonComponent, FormFieldComponent, TextFieldDirective } from '@freely-ui/angular';

@Component({
  selector: 'app-profile',
  imports: [ButtonComponent, FormFieldComponent, TextFieldDirective],
  template: \`
    <fy-form-field label="Name">
      <input fyTextField autocomplete="name" />
    </fy-form-field>
    <button fyButton type="submit" size="l" block>Save</button>
  \`,
})
export class ProfileComponent {}`;

const LABELS = `import { provideFyLabels } from '@freely-ui/angular';

providers: [
  provideFyLabels(() => () => ({ close: 'Закрыть', loading: 'Загрузка' })),
]`;

@Component({
  selector: 'docs-installation',
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page.css',
  template: `
    <article class="page">
      <p class="page__eyebrow">Getting started</p>
      <h1 class="page__title">Installation</h1>
      <p class="page__lead">Freely UI needs Angular 21 and RxJS 7. The router is needed only for the navigation entry point.</p>

      <h2 class="page__section">1. Install the package</h2>
      <docs-code language="bash" code="npm install @freely-ui/angular bootstrap-icons" />
      <p>The default icons are <a href="https://icons.getbootstrap.com">Bootstrap Icons</a> classes; they can be replaced
        with any icon font through <code>provideFyIcons</code>.</p>

      <h2 class="page__section">2. Add the styles</h2>
      <p>In <code>angular.json</code>, before the app's own stylesheet:</p>
      <docs-code language="json" [code]="styles" />
      <p><code>index.css</code> holds the design tokens with both themes and the classes the components rely on.</p>

      <h2 class="page__section">3. Use a component</h2>
      <p>Every component is standalone: import it where it is used.</p>
      <docs-code language="ts" [code]="usage" />

      <h2 class="page__section">4. Translate the built-in texts</h2>
      <p>The texts the components say themselves, mostly accessible names, are English by default. Replace any of
        them; the ones left out stay English. A signal makes them follow a language switch.</p>
      <docs-code language="ts" [code]="labels" />

      <h2 class="page__section">Entry points</h2>
      <ul class="page__list">
        <li><code>&#64;freely-ui/angular</code> — everything but the navigation; needs no router.</li>
        <li><code>&#64;freely-ui/angular/navigation</code> — the nav header, dock and drawer, built on the router.</li>
        <li><code>&#64;freely-ui/angular/telegram</code> — the Telegram Mini App platform.</li>
        <li><code>&#64;freely-ui/angular/charts</code> — the bar and line charts, kept apart so an app without charts
          does not carry them.</li>
      </ul>
    </article>
  `,
})
export class InstallationComponent {
  protected readonly styles = STYLES;
  protected readonly usage = USAGE;
  protected readonly labels = LABELS;
}
