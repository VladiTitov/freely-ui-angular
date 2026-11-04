import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { parseMarkdown } from '../../utils/markdown';

/**
 * Shows a text written in the small Markdown of `parseMarkdown`: headings, paragraphs, lists, bold and links.
 * Nothing in the text is ever rendered as HTML. Colour and font come from the host; tune the spacing and the heading
 * sizes with the `--fy-markdown-*` custom properties.
 *
 * ```html
 * <fy-markdown-text [text]="policy.text" />
 * ```
 */
@Component({
  selector: 'fy-markdown-text',
  templateUrl: './markdown-text.component.html',
  styleUrls: ['./markdown-text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'fy-markdown-text' }
})
export class MarkdownTextComponent {
  readonly text = input<string | null | undefined>('');

  protected readonly blocks = computed(() => parseMarkdown(this.text() ?? ''));
}
