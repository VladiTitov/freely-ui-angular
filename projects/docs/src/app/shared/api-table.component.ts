import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocProperty } from '../docs/doc.model';

/** A table of inputs, outputs or CSS custom properties. */
@Component({
  selector: 'docs-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            @if (withType()) {
              <th scope="col">Type</th>
            }
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.name) {
            <tr>
              <th scope="row"><code>{{ row.name }}</code></th>
              @if (withType()) {
                <td><code>{{ row.type ?? '—' }}</code></td>
              }
              <td>@if (row.default) {<code>{{ row.default }}</code>} @else {—}</td>
              <td>{{ row.description }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .table-scroll {
      overflow-x: auto;
      margin-bottom: 32px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--fy-font-size-m);
    }
    th,
    td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--fy-tertiary-background);
      text-align: start;
      vertical-align: top;
    }
    thead th {
      color: var(--fy-secondary-text);
      font-size: var(--fy-font-size-s);
      font-weight: 500;
    }
    tbody th {
      font-weight: 400;
      white-space: nowrap;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12.5px;
    }
  `,
})
export class ApiTableComponent {
  readonly rows = input.required<readonly DocProperty[]>();
  readonly withType = input(true);
}
