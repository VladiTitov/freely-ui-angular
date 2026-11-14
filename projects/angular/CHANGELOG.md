# Changelog

All notable changes to `@freely-ui/angular` are listed here. The project follows
[Semantic Versioning](https://semver.org); while the version is `0.x`, a minor release may break the API.

## 0.2.1

### Fixed

- `fy-item-card`: long titles and subtitles can wrap onto several lines with the new `wrap` input, instead of being
  truncated with an ellipsis.
- `fy-slide-sheet`: the "Skip" button in full mode no longer shows the browser's default button border and padding, and
  has a focus ring.
- `fy-avatar-stack`: the "+N" badge is drawn on top of the last avatar instead of being overlapped by it.
- `fy-swipe-actions`: the actions are round icon buttons instead of a filled rectangular panel, which removes the
  square edge and the leftover fill under the row.

### Changed

- `fy-swipe-actions`: the `--fy-swipe-actions-radius` variable is replaced by `--fy-swipe-actions-button-size`
  (52px by default).

## 0.2.0

### Added

- `fy-number-field`: a field for amounts with a `number | null` value. Digits are grouped as the user types, both
  `,` and `.` work as the decimal separator, `min` / `max` apply on blur, the arrow keys step by `step`; `decimals`,
  `locale`, `prefix` and `suffix`. Its text helpers `formatNumber` and `readNumberEdit` are exported too.
- `fy-range-field`: a "from – to" pair of number fields with a `{ min, max }` value and the `fyRange` validation
  error while the lower end is above the upper one.
- `revealable` on `input[fyTextField]`: inside `fy-form-field` a password gets a show/hide button.
- UI labels `rangeFrom`, `rangeTo`, `showPassword`, `hidePassword`; icons `reveal`, `conceal`.
- `fy-carousel`: slides declared with `ng-template fyCarouselSlide`, swiped with native snapping, with dots, a
  two-way `index` and arrow-key navigation. A slide is rendered once it is next to the one in view, so its images
  load only then. UI labels `carousel`, `carouselSlide`.
- `fy-card` for dashboard figures: `trend` draws the change as a badge beside the value, `failed` swaps the figure
  for a message and a retry button (`retry` output, `failedText`, `retryText`, UI label `loadFailed`).
- `FyConfirmService.confirm()`: a yes/no dialog on the popup that resolves to a `boolean`; `destructive` paints the
  confirm button red and plays a rigid haptic. UI labels `confirm`, `cancel`; popup button style `danger`.
- `fy-swipe-actions`: buttons under a list row revealed by swiping it sideways (`startActions`, `endActions`);
  a full swipe runs the outer action with a haptic, one row is open at a time, the buttons stay reachable from the
  keyboard.
- `fy-pull-to-refresh`: pulling the content down from the top of its scroll emits `refresh` and spins while
  `refreshing` is true. UI label `refreshing`, icon `pullToRefresh`.
- `@freely-ui/angular/charts`, a separate entry point, so the main one stays free of chart code: `fy-bar-chart`
  (stacked or side by side) and `fy-line-chart` (with a wash under the line) over `data` and `ChartSeries`, with
  a legend, a value axis on clean numbers, and a readout that hover or the arrow keys open for one item. Series
  colours default to `--fy-chart-1` … `--fy-chart-6`, which fall back to the theme colours.

### Changed

- `fy-card` groups a number `value` by `locale` (`LOCALE_ID` by default): `1280` shows as `1,280`. Pass a string to
  show the value as it is.

- The package homepage is the documentation site, https://vladititov.github.io/freely-ui-angular/.

## 0.1.2

### Fixed

- `fy-modal` and `fy-popup-modal` open again: their styles still waited for `is-visible` / `is-open`, while the
  overlay sets `fy-is-visible` / `fy-is-open` since 0.1.0.
- `fy-radio` options rendered by `@for` no longer throw NG0950 (a required input read before it was set), which
  stopped the rest of the page from rendering, e.g. the `fy-tabs` indicator.
- `fy-tabs` switches to the short labels again when the full ones do not fit.
- `fy-data-grid` highlights the selected rows and lays out the selection cell on narrow screens again.
- `fy-markdown-text` gives `##` and `###` headings their own sizes again.
- `fy-avatar-header` collapses on scroll again instead of throwing: it looked its parts up by the old class names.
- `fy-item-list` highlights the search matches again.
- `fy-data-grid` focuses the search field when the search opens on a narrow screen.
- `fy-page` publishes `--fy-page-sticky-height` for a sticky header inside the body of a `bare` page too.

### Changed

- `fy-dropdown-menu` and `fy-select-field` take `direction="auto"`, now the default: the menu opens up when it does
  not fit below the trigger and there is more room above. Keep it clear of a fixed bar with
  `--fy-dropdown-menu-viewport-inset-top|bottom`. The `dropdown-menu-in` keyframes are now `fy-dropdown-menu-in`.

## 0.1.1

### Changed

- Releases are published from GitHub Actions with npm provenance, so each version links back to the commit it
  was built from. The library itself is the same as in 0.1.0.

## 0.1.0

The first public release.

### Components

- Actions: `fyButton`, `fy-chip`, `fy-dropdown-menu`, `fy-filter-toggle`, `fy-sort-menu`.
- Text fields: `fyTextField`, `fyTextarea`, `fy-form-field`, `fy-code-input`, `fy-search-bar`, `fy-search-panel`.
- Choices: `fy-checkbox`, `fy-switch`, `fy-radio-group`, `fy-select-field`, `fy-date-picker`,
  `fy-selectable-tile-grid`, `fy-tabs`; all of them work with `ngModel` and reactive forms.
- Lists and data: `fy-item-list`, `fy-item-card`, `fy-data-grid`, `fy-pagination`, `fy-empty-state`.
- Layout: `fy-page`, `fy-card`, `fy-accordion`, `fy-modal`, `fy-modal-panel`, `fy-bottom-drawer`, `fy-slide-sheet`.
- Feedback: `fy-loader`, `fy-skeleton`, `fy-progress`, `fy-badge`, `fyTooltip`, `ToastService`, `PopupService`.
- People and media: `fy-user-avatar`, `fy-avatar-stack`, `fy-avatar-header`, `fy-avatar-label`, `fy-image-grid`,
  `fy-image-viewer`, `fy-markdown-text`.

### Entry points

- `@freely-ui/angular` — everything above except the navigation; needs no router.
- `@freely-ui/angular/navigation` — `fy-nav-header`, `fy-navigation-dock`, `fy-navigation-drawer`.
- `@freely-ui/angular/telegram` — `provideTelegramUi()` and the Telegram Mini App platform adapter.

### Foundations

- Design tokens prefixed `--fy-` with light and dark themes and per-component `--fy-<component>-*` properties.
- Replaceable icons (`FY_ICONS`), labels (`FY_LABELS`, English by default) and image rules (`FY_IMAGE_RULES`).
- A platform adapter for haptics, the colour scheme, safe areas, storage and the file dialog.
- Animations with CSS and `animate.enter` / `animate.leave`, without `@angular/animations`.
