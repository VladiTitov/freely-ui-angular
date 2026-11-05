# Changelog

All notable changes to `@freely-ui/angular` are listed here. The project follows
[Semantic Versioning](https://semver.org); while the version is `0.x`, a minor release may break the API.

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
