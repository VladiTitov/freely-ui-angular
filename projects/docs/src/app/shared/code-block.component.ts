import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ButtonComponent, FY_ICONS, TooltipDirective } from '@freely-ui/angular';

/** A block of code with a copy button. */
@Component({
  selector: 'docs-code',
  imports: [ButtonComponent, TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code">
      @if (language()) {
        <span class="code__language">{{ language() }}</span>
      }
      <button fyButton type="button" variant="ghost" size="s" iconOnly class="code__copy"
        [attr.aria-label]="copied() ? 'Copied' : 'Copy the code'" [fyTooltip]="copied() ? 'Copied' : 'Copy'" (click)="copy()">
        <i [class]="copied() ? icons.check : 'bi bi-copy'" aria-hidden="true"></i>
      </button>
      <pre><code>{{ code().trim() }}</code></pre>
    </div>
  `,
  styles: `
    .code {
      position: relative;
      border-radius: var(--fy-radius-md);
      background: var(--fy-tertiary-background);
    }
    .code__language {
      position: absolute;
      top: 12px;
      left: 16px;
      color: var(--fy-secondary-text);
      font-size: var(--fy-font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .code__copy {
      position: absolute;
      top: 6px;
      right: 6px;
    }
    pre {
      margin: 0;
      padding: 36px 16px 16px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      color: var(--fy-primary-text);
    }
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly language = input<string>();

  protected readonly icons = inject(FY_ICONS);
  protected readonly copied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code().trim());
      this.copied.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // The clipboard can be refused (an insecure page, a denied permission); the code can still be selected.
    }
  }
}
