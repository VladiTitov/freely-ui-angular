/** A run of text inside a block. */
export type MarkdownInline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: MarkdownInline[] }
  | { type: 'link'; text: string; href: string };

export type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3; content: MarkdownInline[] }
  | { type: 'paragraph'; content: MarkdownInline[] }
  | { type: 'list'; items: MarkdownInline[][] };

// `**bold**` or `[text](url)`; whichever comes first in the rest of the line.
const INLINE = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const HEADING = /^(#{1,6})\s+(.*)$/;
const LIST_ITEM = /^[-*]\s+(.*)$/;
// Anything else (javascript:, data:…) is shown as text, not as a link.
const SAFE_HREF = /^(https?:|mailto:|tg:)/i;

/**
 * Parses the small part of Markdown that texts edited in the admin panel use: `#`/`##` headings (shown as level 2),
 * `###` and deeper (level 3), paragraphs, `- ` lists, `**bold**` and `[links](https://…)`. HTML is never produced:
 * the result is a tree that a template renders, so whatever the text contains stays text.
 */
export function parseMarkdown(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] | null = null;

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) });
    if (list) blocks.push({ type: 'list', items: list.map(parseInline) });
    paragraph = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();

    if (!line) {
      flush();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: 'heading', level: heading[1].length <= 2 ? 2 : 3, content: parseInline(heading[2]) });
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      if (paragraph.length) flush();
      (list ??= []).push(item[1]);
      continue;
    }

    // A line under a list item that is not an item itself continues it, as a wrapped line would.
    if (list) list[list.length - 1] += ' ' + line;
    else paragraph.push(line);
  }

  flush();
  return blocks;
}

export function parseInline(text: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = [];
  let last = 0;

  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push({ type: 'text', text: text.slice(last, match.index) });

    const [whole, strong, linkText, href] = match;
    if (strong !== undefined) nodes.push({ type: 'strong', children: parseInline(strong) });
    else if (SAFE_HREF.test(href)) nodes.push({ type: 'link', text: linkText, href });
    else nodes.push({ type: 'text', text: whole });

    last = match.index + whole.length;
  }

  if (last < text.length) nodes.push({ type: 'text', text: text.slice(last) });
  return nodes;
}
