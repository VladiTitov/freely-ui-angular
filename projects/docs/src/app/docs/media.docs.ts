import { Component, signal } from '@angular/core';
import {
  ButtonComponent,
  ImageGridComponent,
  ImageGridItem,
  ImageViewerComponent,
  MarkdownTextComponent,
  ViewerImage,
} from '@freely-ui/angular';
import { ComponentDoc } from './doc.model';
import { COLUMN } from './example-styles';

const imageGrid = `
<fy-image-grid #grid label="Photos" [existing]="saved" [max]="5" />
<button fyButton type="button" variant="secondary" size="s" (click)="save(grid)">Save</button>
<p>{{ result() }}</p>
`;

const imageGridCode = `${imageGrid}
// component: the grid only keeps the picked files; uploading them is yours
save(grid: ImageGridComponent) {
  const { removedIds, files } = grid.changes;
  this.api.saveImages(removedIds, files).subscribe(() => grid.reset());
}`;

@Component({
  selector: 'docs-image-grid',
  imports: [ImageGridComponent, ButtonComponent],
  template: imageGrid,
  host: COLUMN,
  styles: `button { align-self: flex-start; } p { margin: 0; color: var(--fy-secondary-text); }`,
})
class ImageGridExample {
  protected readonly saved: ImageGridItem[] = [1015, 1016].map(id => ({ id: String(id), url: `https://picsum.photos/id/${id}/160/160` }));
  protected readonly result = signal('Add or remove a photo, then save.');

  protected save(grid: ImageGridComponent): void {
    const { removedIds, files } = grid.changes;
    this.result.set(`Removed: ${removedIds.join(', ') || 'none'}; new files: ${files.map(file => file.name).join(', ') || 'none'}`);
  }
}

const imageViewer = `
<div class="thumbs">
  @for (photo of photos; track photo.url; let i = $index) {
    <button type="button" class="thumb" [attr.aria-label]="'Open photo ' + (i + 1)" (click)="viewer.open(i)">
      <img [src]="photo.url" alt="" width="96" height="96" />
    </button>
  }
</div>
<fy-image-viewer #viewer [images]="photos" />
`;

@Component({
  selector: 'docs-image-viewer',
  imports: [ImageViewerComponent],
  template: imageViewer,
  styles: `
    .thumbs { display: flex; flex-wrap: wrap; gap: 8px; }
    .thumb { padding: 0; border: 0; border-radius: var(--fy-radius-md); overflow: hidden; cursor: zoom-in; background: var(--fy-tertiary-background); }
    .thumb img { display: block; object-fit: cover; }
  `,
})
class ImageViewerExample {
  protected readonly photos: ViewerImage[] = [1018, 1019, 1021, 1022].map(id => ({ url: `https://picsum.photos/id/${id}/1200/900` }));
}

const markdownText = `<fy-markdown-text [text]="text" />`;

const POLICY = `## Privacy policy

We keep **only what the app needs**: your name, your wishes and who you share them with.

### What you can do

- See everything we keep about you
- Delete your account at any time
- Write to us at [support](mailto:support@example.com)

A [script link](javascript:alert) stays plain text.`;

const markdownTextCode = `${markdownText}

<!-- text -->
${POLICY}`;

@Component({ selector: 'docs-markdown-text', imports: [MarkdownTextComponent], template: markdownText, host: COLUMN })
class MarkdownTextExample {
  protected readonly text = POLICY;
}

export const MEDIA_DOCS: ComponentDoc[] = [
  {
    slug: 'image-grid',
    title: 'Image grid',
    group: 'Media',
    summary: 'A row to add images and a strip of thumbnails; the picked files are kept until the owner uploads them.',
    imports: `import { ImageGridComponent, ImageGridItem } from '@freely-ui/angular';`,
    selectors: ['fy-image-grid'],
    examples: [{
      title: 'Photos of a wish',
      description: 'Files are checked by ImagePicker against the image rules (provideFyImageRules) and the max. On save read changes, upload, then call reset(); removing a saved image only marks it.',
      component: ImageGridExample,
      code: imageGridCode,
    }],
    inputs: [
      { name: 'label', type: 'string', description: 'Required. Text of the add row.' },
      { name: 'existing', type: 'ImageGridItem[]', default: '[]', description: 'Images already saved, as { id, url }; a thumbnail url is enough.' },
      { name: 'max', type: 'number | null', default: 'null', description: 'Most images there may be; null sets no limit here.' },
      { name: 'multiple', type: 'boolean', default: 'true', description: 'Several files can be picked at once.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Nothing can be added or removed, e.g. while saving.' },
      { name: 'changes', type: '{ removedIds, files }', description: 'Read-only property: the saved images removed and the new files.' },
    ],
    accessibility: [
      'The add row is a button named by its label and the "2 / 5" counter; it is disabled once the grid is full.',
      'Every remove button is named removeImage of the UI labels; a rejected file shows its reason under the strip.',
    ],
  },
  {
    slug: 'image-viewer',
    title: 'Image viewer',
    group: 'Media',
    summary: 'A full-screen viewer to swipe between images; the full-size images load only once it opens.',
    imports: `import { ImageViewerComponent, ViewerImage } from '@freely-ui/angular';`,
    selectors: ['fy-image-viewer'],
    examples: [{
      title: 'Thumbnails',
      description: 'Render it once next to the thumbnails and call open(index); close() or Escape hides it. The carousel page shows it together with a carousel.',
      component: ImageViewerExample,
      code: imageViewer,
    }],
    inputs: [{ name: 'images', type: 'ViewerImage[]', default: '[]', description: 'The images, as { url }.' }],
    accessibility: [
      'role="dialog" with aria-modal, named imageViewer of the UI labels; the close button is named close.',
      'Escape closes it; the "2 / 4" counter shows where you are.',
    ],
  },
  {
    slug: 'markdown-text',
    title: 'Markdown text',
    group: 'Media',
    summary: 'A text in a small Markdown: headings, paragraphs, lists, bold and links; nothing in it is ever rendered as HTML.',
    imports: `import { MarkdownTextComponent } from '@freely-ui/angular';`,
    selectors: ['fy-markdown-text'],
    examples: [{
      title: 'A policy',
      description: '# and ## give a level 2 heading, ### and deeper level 3; - or * start a list item. Only http, https, mailto and tg links become links.',
      component: MarkdownTextExample,
      code: markdownTextCode,
    }],
    inputs: [{ name: 'text', type: 'string | null', default: "''", description: 'The Markdown source.' }],
    cssVars: [
      { name: '--fy-markdown-block-gap', default: 'var(--fy-space-s)', description: 'Space between paragraphs and lists.' },
      { name: '--fy-markdown-heading-gap', default: 'var(--fy-space-xl)', description: 'Space above a heading.' },
      { name: '--fy-markdown-h2-size', default: '1.15em', description: 'Size of a level 2 heading.' },
      { name: '--fy-markdown-h3-size', default: '1em', description: 'Size of a level 3 heading.' },
      { name: '--fy-markdown-line-height', default: '1.5', description: 'Line height of the text.' },
      { name: '--fy-markdown-link-color', default: 'inherit', description: 'Colour of the links.' },
    ],
    accessibility: [
      'Headings are real h2 and h3, lists real ul: place the text under an h1 of the page.',
      'Links open in a new tab with rel="noopener noreferrer".',
    ],
  },
];
