import { parseInline, parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
  it('splits headings, paragraphs and lists', () => {
    const blocks = parseMarkdown('## 1. Title\n\nFirst line\nsecond line\n\n- one\n- two\n\n### Sub');

    expect(blocks).toEqual([
      { type: 'heading', level: 2, content: [{ type: 'text', text: '1. Title' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'First line second line' }] },
      { type: 'list', items: [[{ type: 'text', text: 'one' }], [{ type: 'text', text: 'two' }]] },
      { type: 'heading', level: 3, content: [{ type: 'text', text: 'Sub' }] }
    ]);
  });

  it('continues a list item with the line under it and ends the list at a heading', () => {
    const blocks = parseMarkdown('- long\n  wrapped item\n## Next');

    expect(blocks).toEqual([
      { type: 'list', items: [[{ type: 'text', text: 'long wrapped item' }]] },
      { type: 'heading', level: 2, content: [{ type: 'text', text: 'Next' }] }
    ]);
  });

  it('starts a list right under a paragraph', () => {
    expect(parseMarkdown('Intro\n- item').map(b => b.type)).toEqual(['paragraph', 'list']);
  });

  it('reads Windows line ends', () => {
    expect(parseMarkdown('One\r\n\r\nTwo')).toHaveLength(2);
  });
});

describe('parseInline', () => {
  it('finds bold and links among text', () => {
    expect(parseInline('See **the bot** or [site](https://example.com).')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'strong', children: [{ type: 'text', text: 'the bot' }] },
      { type: 'text', text: ' or ' },
      { type: 'link', text: 'site', href: 'https://example.com' },
      { type: 'text', text: '.' }
    ]);
  });

  it('keeps a link with an unsafe address as text', () => {
    expect(parseInline('[x](javascript:alert(1))')).toEqual([{ type: 'text', text: '[x](javascript:alert(1)' }, { type: 'text', text: ')' }]);
  });

  it('keeps HTML as text', () => {
    expect(parseInline('<b>hi</b>')).toEqual([{ type: 'text', text: '<b>hi</b>' }]);
  });
});
