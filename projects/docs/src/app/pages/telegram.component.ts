import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';

const PROVIDE = `import { provideTelegramUi } from '@freely-ui/angular/telegram';

export const appConfig: ApplicationConfig = {
  providers: [provideTelegramUi()],
};`;

const STYLES = `"styles": [
  "node_modules/@freely-ui/angular/styles/index.css",
  "node_modules/@freely-ui/angular/telegram/styles/telegram.css",
  "src/styles.css"
]`;

const SCRIPT = `<script src="https://telegram.org/js/telegram-web-app.js"></script>`;

@Component({
  selector: 'docs-telegram',
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page.css',
  template: `
    <article class="page">
      <p class="page__eyebrow">Getting started</p>
      <h1 class="page__title">Telegram Mini Apps</h1>
      <p class="page__lead">One provider runs the app inside Telegram: its theme, back button, haptics, storage and
        safe areas. The same build still runs in a plain browser.</p>

      <h2 class="page__section">1. Load the Telegram script</h2>
      <p>In <code>index.html</code>, before the app:</p>
      <docs-code language="html" [code]="script" />

      <h2 class="page__section">2. Provide the platform</h2>
      <docs-code language="ts" [code]="provide" />
      <p>It provides the Telegram platform when Telegram opened the page, and the browser stand-in otherwise.</p>

      <h2 class="page__section">3. Add the Telegram styles</h2>
      <p>After <code>index.css</code>: they point the safe areas at the Telegram insets and define
        <code>--tg-safe-top|bottom|left|right</code> for your own layout.</p>
      <docs-code language="json" [code]="styles" />

      <h2 class="page__section">What changes inside Telegram</h2>
      <ul class="page__list">
        <li>The colour scheme and the header and background colours follow Telegram.</li>
        <li><code>[fyHaptic]</code> and the controls give tactile feedback through Telegram.</li>
        <li>The nav header drives Telegram's own back button.</li>
        <li>Storage goes to Telegram's cloud storage, links and invoices open the Telegram way.</li>
      </ul>
    </article>
  `,
})
export class TelegramComponent {
  protected readonly provide = PROVIDE;
  protected readonly styles = STYLES;
  protected readonly script = SCRIPT;
}
