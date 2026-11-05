import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { foldSearchText, ITEM_LIST_SEARCH } from './item-list.search';

/** A slice of text; `match` is true for the part equal to the search query. */
export interface ItemListHighlightPart {
  text: string;
  match: boolean;
}

/** Splits `text` around every case-insensitive occurrence of `query`. */
export function splitHighlight(text: string | null | undefined, query: string | null | undefined): ItemListHighlightPart[] {
  const source = text ?? '';
  const needle = foldSearchText(query?.trim() ?? '');
  if (!source || !needle) {
    return source ? [{ text: source, match: false }] : [];
  }

  const haystack = foldSearchText(source);
  if (haystack.length !== source.length) {
    return [{ text: source, match: false }];
  }

  const parts: ItemListHighlightPart[] = [];
  let from = 0;
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, from)) {
    if (at > from) parts.push({ text: source.slice(from, at), match: false });
    parts.push({ text: source.slice(at, at + needle.length), match: true });
    from = at + needle.length;
  }
  if (from < source.length) parts.push({ text: source.slice(from), match: false });
  return parts;
}

/**
 * Renders `text` with matches of the enclosing `<fy-item-list>` query wrapped in
 * `<mark>`. Reads the query itself, so a row only passes the text:
 *
 * ```html
 * <h2><fy-item-list-highlight [text]="item.title" /></h2>
 * ```
 *
 * Outside a searchable list it renders plain text. Style the mark with
 * `--fy-item-list-highlight-bg` / `--fy-item-list-highlight-color`.
 */
@Component({
  selector: 'fy-item-list-highlight',
  template: `@for (part of parts(); track $index) {@if (part.match) {<mark class="fy-item-list-highlight__match">{{ part.text }}</mark>} @else {<ng-container>{{ part.text }}</ng-container>}}`,
  styles: `
    .fy-item-list-highlight__match {
      padding: 0;
      border-radius: 3px;
      background: var(--fy-item-list-highlight-bg, rgba(255, 214, 0, 0.4));
      color: var(--fy-item-list-highlight-color, inherit);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListHighlightComponent {
  private readonly search = inject(ITEM_LIST_SEARCH, { optional: true });

  readonly text = input<string | null | undefined>('');

  protected readonly parts = computed(() => splitHighlight(this.text(), this.search?.query()));
}
