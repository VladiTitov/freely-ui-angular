# Freely UI for Angular

Free, open-source Angular UI kit for mobile-first web apps and Telegram Mini Apps: standalone, signal-based
components, light and dark themes, haptics and safe areas, forms support and accessible markup.

Бесплатный UI kit для Angular с открытым исходным кодом: мобильные веб-приложения и Telegram Mini Apps.

**Documentation and examples: [vladititov.github.io/freely-ui-angular](https://vladititov.github.io/freely-ui-angular/)**

> The API may still change while the version is `0.x`.

## Installation

```bash
npm install @freely-ui/angular
```

It needs Angular 21 (`@angular/core`, `@angular/common`, `@angular/forms`) and RxJS 7. Optional peers:
`@angular/router` for the `navigation` entry point, `bootstrap-icons` for the default icons and
`@fontsource/montserrat` for the optional font.

Add the styles to `angular.json`, before the app's own stylesheet:

```json
"styles": [
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "node_modules/@freely-ui/angular/styles/index.css",
  "src/styles.css"
]
```

`index.css` holds the design tokens with both themes (`tokens.css`) and the classes the components rely on
(`base.css`). Then import what a component needs:

```ts
import { ButtonComponent, TextFieldDirective } from '@freely-ui/angular';

@Component({
  imports: [ButtonComponent, TextFieldDirective],
  template: `<input fyTextField placeholder="Name" /> <button fyButton type="submit">Save</button>`,
})
export class ProfileForm {}
```

## Components

| Area | What there is |
|---|---|
| Actions | `fyButton`, `fy-chip`, `fy-dropdown-menu`, `fy-filter-toggle`, `fy-sort-menu` |
| Text fields | `fyTextField`, `fyTextarea`, `fy-form-field`, `fy-code-input`, `fy-search-bar`, `fy-search-panel` |
| Choices | `fy-checkbox`, `fy-switch`, `fy-radio-group`, `fy-select-field`, `fy-date-picker`, `fy-selectable-tile-grid`, `fy-tabs` |
| Lists and data | `fy-item-list`, `fy-item-card`, `fy-data-grid`, `fy-pagination`, `fy-empty-state` |
| Layout | `fy-page`, `fy-card`, `fy-accordion`, `fy-modal`, `fy-modal-panel`, `fy-bottom-drawer`, `fy-slide-sheet` |
| Feedback | `fy-loader`, `fy-skeleton`, `fy-progress`, `fy-badge`, `fyTooltip`, `ToastService`, `PopupService` |
| People and media | `fy-user-avatar`, `fy-avatar-stack`, `fy-avatar-header`, `fy-avatar-label`, `fy-image-grid`, `fy-image-viewer`, `fy-markdown-text` |
| Navigation | `fy-nav-header`, `fy-navigation-dock`, `fy-navigation-drawer` (`@freely-ui/angular/navigation`) |

Every selector, class and custom property of the library starts with `fy`, so it does not clash with the app.

## Theming

Every token is prefixed `--fy-`: colours (`--fy-accent`, `--fy-on-accent`, `--fy-primary-background`, `--fy-danger`,
`--fy-success`, `--fy-warning`, `--fy-info`…), `--fy-font-size-*`, `--fy-radius-*`, `--fy-space-*`,
`--fy-shadow-s|m|l`, the stacking layers `--fy-z-*` and the motion `--fy-duration-*` / `--fy-ease-*`.

Each component also reads its own `--fy-<component>-*` custom properties (e.g. `--fy-chip-background`,
`--fy-search-bar-height`), listed in its doc comment, which fall back to the tokens above.

The palette is neutral. Set your own in a stylesheet loaded after `index.css`, overriding the colour tokens
under `[data-theme='light']` and `[data-theme='dark']`:

```css
:root,
[data-theme='light'],
[data-theme='dark'] {
  --fy-accent: #a954f6;
}
```

`FyTheme` keeps `data-theme` in step with the user's colour scheme (see [Platform](#platform)).

### Font

The default is the system font. For Montserrat, install `@fontsource/montserrat` and add
`node_modules/@freely-ui/angular/styles/fonts.css` after `index.css`; it bundles the font and sets `--fy-font-family`.

## Buttons

`<button fyButton>` and `<a fyButton>` are the buttons of the library: `variant` (`primary`, `secondary`, `tertiary`,
`ghost`), `size` (`s`, `m`, `l`), `iconOnly` for a round icon button, `block` for a full-width main action, `icon`,
`loading` and `disabled`. They stay the native elements, so `type`, forms, `routerLink` and `[fyHaptic]` work as usual.

```html
<button fyButton type="submit" size="l" block [loading]="saving()">Save</button>
<button fyButton type="button" variant="tertiary" iconOnly aria-label="Close"><i class="bi bi-x-lg"></i></button>
```

## Text fields

`input[fyTextField]` and `textarea[fyTextarea]` style the native elements, so `formControlName`, `ngModel`, `type` and
`autocomplete` work as usual; `appearance="plain"` drops the box for a row inside a card the page draws. The
textarea grows with its text. `fy-form-field` adds a label, a hint or an error and a counter, and links them to
the control. `fy-code-input` takes a one-time code in cells and works with `ngModel` and reactive forms.

```html
<fy-form-field label="Email" [error]="emailError()" required>
  <input fyTextField type="email" formControlName="email" />
</fy-form-field>

<fy-form-field label="Code from the app">
  <fy-code-input [(ngModel)]="code" name="code" />
</fy-form-field>
```

## Choices

`fy-checkbox`, `fy-switch`, `fy-radio-group` with `fy-radio`, `fy-date-picker`, `fy-select-field`, `fy-search-bar`,
`fy-selectable-tile-grid` and a `<button fyChip>` toggle all work with `ngModel` and reactive forms, and take their
disabled state from the form. A radio group has one tab stop and moves the choice with the arrow keys;
`appearance="plain"` leaves drawing the options to the page.

```html
<fy-checkbox formControlName="terms">I accept the terms</fy-checkbox>

<fy-radio-group formControlName="size" aria-label="Size">
  <fy-radio value="s">Small</fy-radio>
  <fy-radio value="m">Medium</fy-radio>
</fy-radio-group>

<fy-date-picker formControlName="date" placeholder="Pick a date" />
```

## Cards and feedback

- `fy-card` — a tile with a figure: `label`, `value`, `caption` and `loading`, with slots for an action, a badge,
  more lines and a footer.
- `fy-progress` — a progress bar with `role="progressbar"`, its value and range.
- `fy-skeleton` — a pulsing placeholder, `line`, `circle` or `pill`.
- `[fyTooltip]` — a short text on hover and keyboard focus, closed by Escape; use it instead of `title`.
- `fy-accordion` with `fy-accordion-item` — sections that open under their heading, one at a time unless `multi`.

```html
<fy-card label="Users" [value]="users()" [loading]="loading()">
  <fy-badge cardBadge tone="success">+12</fy-badge>
</fy-card>

<fy-progress [value]="7" [max]="10" label="To the next level" />

<fy-accordion-item heading="Daily table">…</fy-accordion-item>
```

## Icons, labels and image rules

Everything the components draw or say themselves can be replaced; whatever is left out keeps its default.

- **Icons** — `FY_ICONS`, Bootstrap Icons classes by default: `provideFyIcons({ close: 'ph ph-x' })`.
- **Labels** — `FY_LABELS`, English by default, read on every render so they can follow a language switch:
  `provideFyLabels(() => { const i18n = inject(I18n); return () => i18n.t().ui; })`.
- **Image rules** — `FY_IMAGE_RULES`, the size and types `ImagePicker` and the image grid let through
  (10 MB; JPEG, PNG, WebP, GIF, BMP): `provideFyImageRules({ maxBytes: 5 * 1024 * 1024 })`.

## Platform hooks

- **Haptics** — `[fyHaptic]` and the components that give tactile feedback go through `FY_HAPTICS`,
  which is silent by default.
- **Safe areas** — the components keep clear of `--fy-safe-top|bottom|left|right`, which default to
  `env(safe-area-inset-*)`.

## Platform

Components reach the host the app runs in only through `PLATFORM_ADAPTER` (`PlatformAdapter`): the colour
scheme and the host's chrome, haptics, the back button, links and invoices, sharing, storage, the file
dialog and the launch data for the login. Without a provider it is `BrowserPlatformAdapter`, a stand-in for
a plain browser: no haptics, links in new tabs, the system's colour scheme and nobody signed in.

`providePlatform(() => adapter)` runs the app on another host: it starts the adapter, sets
`data-platform` on `<body>` and starts `FyTheme`, which keeps `data-theme` and the host's chrome in step
with the user's colour scheme: the one picked through `FyTheme.setPreference()` (kept in `localStorage`),
else the host's. `FY_HAPTICS` is the adapter's haptics.

## Navigation

`@freely-ui/angular/navigation` holds the components built on the router: `fy-nav-header`, `fy-navigation-dock`
and `fy-navigation-drawer`. Only this entry point needs `@angular/router`; the main one does not.

```ts
import { NavHeaderComponent, NavigationDockComponent } from '@freely-ui/angular/navigation';
```

## Animations

The components animate with CSS and Angular's `animate.enter` / `animate.leave`, so the app needs neither
`@angular/animations` nor `provideAnimations()`.

## Telegram Mini App

`@freely-ui/angular/telegram` is a separate entry point, the only part of the library that knows about
Telegram; an app outside Telegram does not import it.

```ts
import { provideTelegramUi } from '@freely-ui/angular/telegram';

providers: [provideTelegramUi()]
```

It provides `TelegramPlatformAdapter` when Telegram opened the page, and the browser stand-in otherwise, so
the same build also runs in a plain browser. Add `node_modules/@freely-ui/angular/telegram/styles/telegram.css` to
the app's `styles` after `index.css`: it points the safe areas at the Telegram insets and defines
`--tg-safe-top|bottom|left|right` for the app's own layout.

The icons are [Bootstrap Icons](https://icons.getbootstrap.com) classes, so the app has to load that font.

## Browser support

The evergreen browsers and the Telegram in-app browsers on iOS and Android. A few touches need recent engines and
degrade quietly elsewhere: a growing textarea (`field-sizing`, with a script fallback) and the row height animation
of `fy-item-list` (`interpolate-size`).

## Development

The library is the `angular` project of the [freely-ui-angular](https://github.com/VladiTitov/freely-ui-angular)
workspace. `npm run build` packages it into `dist/angular` with the `navigation` and `telegram` entry points and the
styles; `npm test` runs the unit tests. See [CONTRIBUTING.md](https://github.com/VladiTitov/freely-ui-angular/blob/master/CONTRIBUTING.md).

## License

[MIT](LICENSE)
