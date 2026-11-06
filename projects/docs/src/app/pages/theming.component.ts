import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../shared/code-block.component';

const PRESET = `/* src/theme.css, loaded after @freely-ui/angular/styles/index.css */
:root,
[data-theme='light'],
[data-theme='dark'] {
  --fy-accent: #a954f6;
  --fy-gradient: linear-gradient(to bottom right, #a855f7, 55%, #6366f1);
}

[data-theme='dark'] {
  --fy-secondary-background: #1a191f;
  --fy-tertiary-background: #26252b;
}`;

const COMPONENT = `fy-chip.tag {
  --fy-chip-background: #faece7;
  --fy-chip-color: #712b13;
}`;

const THEME = `import { FyTheme } from '@freely-ui/angular';

const theme = inject(FyTheme);
theme.setPreference('dark'); // 'light', 'dark' or 'system'`;

@Component({
  selector: 'docs-theming',
  imports: [CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page.css',
  template: `
    <article class="page">
      <p class="page__eyebrow">Getting started</p>
      <h1 class="page__title">Theming</h1>
      <p class="page__lead">Colours, sizes and motion come from CSS custom properties prefixed <code>--fy-</code>.
        The palette is neutral; set your own in a stylesheet loaded after the library's.</p>

      <h2 class="page__section">Your palette</h2>
      <p>Override the colour tokens for both themes, or for one of them:</p>
      <docs-code language="css" [code]="preset" />

      <h2 class="page__section">Tokens</h2>
      <ul class="page__list">
        <li>Colours: <code>--fy-accent</code>, <code>--fy-on-accent</code>, <code>--fy-primary-background</code>,
          <code>--fy-secondary-background</code>, <code>--fy-tertiary-background</code>, <code>--fy-primary-text</code>,
          <code>--fy-secondary-text</code>, <code>--fy-danger</code>, <code>--fy-success</code>, <code>--fy-warning</code>,
          <code>--fy-info</code>.</li>
        <li>Sizes: <code>--fy-font-size-*</code>, <code>--fy-radius-*</code>, <code>--fy-space-*</code>,
          <code>--fy-button-s|m|l</code>.</li>
        <li>Depth and motion: <code>--fy-shadow-s|m|l</code>, <code>--fy-z-*</code>, <code>--fy-duration-*</code>,
          <code>--fy-ease-*</code>.</li>
        <li>Safe areas: <code>--fy-safe-top|bottom|left|right</code>, <code>env(safe-area-inset-*)</code> by default.</li>
      </ul>

      <h2 class="page__section">One component</h2>
      <p>Each component also reads its own <code>--fy-&lt;component&gt;-*</code> properties, listed on its page:</p>
      <docs-code language="css" [code]="component" />

      <h2 class="page__section">Light, dark and system</h2>
      <p><code>FyTheme</code> keeps <code>data-theme</code> in step with the scheme the user picked, kept in
        localStorage, or else with the system's. The switch in the header of this site does exactly that.</p>
      <docs-code language="ts" [code]="theme" />

      <h2 class="page__section">Font</h2>
      <p>The default is the system font. For Montserrat, install <code>&#64;fontsource/montserrat</code> and add
        <code>node_modules/&#64;freely-ui/angular/styles/fonts.css</code> after <code>index.css</code>.</p>
    </article>
  `,
})
export class ThemingComponent {
  protected readonly preset = PRESET;
  protected readonly component = COMPONENT;
  protected readonly theme = THEME;
}
