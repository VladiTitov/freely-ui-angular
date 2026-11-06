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
npm start       # the documentation site with the examples, at http://localhost:4200
npm run build   # packages the library into dist/angular
npm test        # runs the unit tests once
npm run test:watch
```

## The documentation site

The site is the `docs` application in `projects/docs`. It uses the library from its sources, so it always shows the
current code. A component page is an entry of `projects/docs/src/app/docs/*.docs.ts`: its examples are small
components whose template is a constant, shown both rendered and as code. Add the page of a new component there.
Every merge into `master` publishes the site on GitHub Pages (`.github/workflows/docs.yml`).

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

## Releasing

A version tag publishes the package: `.github/workflows/release.yml` builds it, runs the tests and publishes it to
npm through Trusted Publishing, with provenance and without a token.

1. In a pull request, raise `version` in `projects/angular/package.json` following [Semantic Versioning](https://semver.org)
   and turn the "Unreleased" heading of `projects/angular/CHANGELOG.md` into that version.
2. Merge it into `master`.
3. Tag the merge commit with the same version and push the tag:

   ```bash
   git checkout master && git pull
   git tag v0.1.2 && git push origin v0.1.2
   ```

The workflow stops if the tag does not match the version in `package.json`. A pre-release such as `v0.2.0-beta.1`
goes out under the `next` dist-tag, so `npm install @freely-ui/angular` keeps giving the latest stable version.
