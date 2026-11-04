import { PickFilesOptions } from './platform-adapter';

/**
 * The browser's file dialog, through a file input that lives only as long as the dialog.
 * Resolves an empty list when the user cancels, in browsers that report it.
 */
export function pickFilesWithInput(options: PickFilesOptions = {}): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    if (options.accept) input.accept = options.accept;
    input.multiple = options.multiple ?? false;

    // Some mobile web views open the dialog only for an input in the document.
    document.body.appendChild(input);

    const finish = (files: File[]) => {
      input.remove();
      resolve(files);
    };
    input.addEventListener('change', () => finish(Array.from(input.files ?? [])), { once: true });
    input.addEventListener('cancel', () => finish([]), { once: true });

    input.click();
  });
}
