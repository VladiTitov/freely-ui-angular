import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, EmptyStateComponent } from '@freely-ui/angular';

@Component({
  selector: 'docs-not-found',
  imports: [RouterLink, ButtonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fy-empty-state icon="bi bi-signpost-split" label="Page not found" description="The address may be mistyped, or the page has moved.">
      <a fyButton size="s" routerLink="/">Go to the start</a>
    </fy-empty-state>
  `,
})
export class NotFoundComponent {}
