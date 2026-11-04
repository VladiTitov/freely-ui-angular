# Contributing to Freely UI

Thanks for helping. Issues and pull requests are welcome, in English or Russian.

## Setting up

You need Node.js 20.19+, 22.12+ or 24+.

```bash
git clone https://github.com/VladiTitov/freely-ui-angular.git
cd freely-ui-angular
npm ci
```

## Working on the library

The library is the `angular` project in `projects/angular`:

- `src/` — the main entry point, `@freely-ui/angular`;
- `navigation/` — `@freely-ui/angular/navigation`, the components built on the router;
- `telegram/` — `@freely-ui/angular/telegram`, the Telegram Mini App platform adapter;
- `styles/` — the design tokens and the global classes the components rely on.

```bash
npm run build   # packages the library into dist/angular
npm test        # runs the unit tests once
npm run test:watch
```

## Conventions

- Every selector, class and CSS custom property starts with `fy` (`fy-button`, `.fy-chip--selected`,
  `--fy-accent`), so the library never clashes with the app around it.
- Components are standalone, use signals and `OnPush`, and work without zone.js.
- A form control implements `ControlValueAccessor`, so it works with `ngModel` and reactive forms.
- Texts the components show go through `FY_LABELS` and icons through `FY_ICONS`; nothing is hard-coded.
- Colours, sizes and motion come from the `--fy-*` tokens; a component exposes its own `--fy-<component>-*`
  properties and lists them in its doc comment.
- Every change comes with unit tests, including keyboard and ARIA behaviour where it applies.

## Pull requests

Branch off `master`, keep one change per pull request and describe what it changes for the people using the
library. CI builds the package and runs the tests on every pull request. Add a line to `projects/angular/CHANGELOG.md`
under an "Unreleased" heading for anything a user would notice.
