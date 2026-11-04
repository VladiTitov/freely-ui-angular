# tabs

Presentational tab switcher. Renders a full-width row of equal-width labels
(a label wider than its share keeps its natural width, the rest is
redistributed to the others) with a sliding underline indicator under the
active one. It does not render any content itself — the parent decides what
to show for the active tab (`@switch`/`@if` on the emitted index).

No UIkit, no app services. The selector carries the library prefix:
`fy-tabs`.

## Usage

```ts
import { TabsComponent } from '@freely-ui/angular';

@Component({ imports: [TabsComponent /* , ... */] })
```

```html
<fy-tabs [tabs]="['Friends', 'Groups']" [(activeIndex)]="activeTabIndex" ariaLabel="My friends" />

@switch (activeTabIndex) {
  @case (0) { <!-- friends list --> }
  @case (1) { <!-- groups grid --> }
}
```

### Inputs

| Input | Type | Default |
| --- | --- | --- |
| `tabs` | `(string \| TabItem)[]` | `[]` |
| `activeIndex` | `number` | `0` |
| `ariaLabel` | `string` | — |

A `TabItem` is `{ label, shortLabel? }`. While any full label is cut off, every
tab that has a `shortLabel` shows it instead (the full label stays its
`aria-label`):

```html
<fy-tabs [tabs]="[{ label: 'Warnings', shortLabel: 'Warn.' }, 'Errors']" />
```

### Outputs

| Output | Type |
| --- | --- |
| `activeIndexChange` | `number` |

Supports two-way binding (`[(activeIndex)]`).

### Styling

Tune via CSS custom properties: `--fy-tabs-label-color`, `--fy-tabs-active-label-color`,
`--fy-tabs-indicator-color`, `--fy-tabs-border-color`. Defaults resolve to the app's
`--fy-secondary-text`, `--fy-primary-text`, `--fy-accent` and
`--fy-tertiary-background` tokens respectively.
