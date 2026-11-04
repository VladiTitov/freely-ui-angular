import { TestBed } from '@angular/core/testing';
import { BrowserPlatformAdapter } from '../platform/browser-platform-adapter';
import { PLATFORM_ADAPTER } from '../platform/platform-adapter.token';
import { DEFAULT_FY_LABELS } from '../providers/fy-labels';
import { ImagePicker, provideFyImageRules } from './image-picker';

const MB = 1024 * 1024;

function image(bytes: number, type = 'image/png'): File {
  return new File([new Uint8Array(bytes)], 'image', { type });
}

describe('ImagePicker', () => {
  function picker(files: File[] = []): ImagePicker {
    const platform = new BrowserPlatformAdapter();
    platform.pickFiles = () => Promise.resolve(files);
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ADAPTER, useValue: platform }, provideFyImageRules({ maxBytes: 1.5 * MB })]
    });
    return TestBed.inject(ImagePicker);
  }

  it('rejects a file over the configured size and names the limit', () => {
    expect(picker().check(image(2 * MB))).toBe(DEFAULT_FY_LABELS.imageTooLarge(1.5));
    expect(DEFAULT_FY_LABELS.imageTooLarge(1.5)).toContain('1.5 MB');
  });

  it('keeps a file within the configured size', () => {
    expect(picker().check(image(MB))).toBeNull();
  });

  it('keeps the default types when only the size is configured', () => {
    expect(picker().check(image(MB, 'application/pdf'))).toBe(DEFAULT_FY_LABELS.imageUnsupportedType);
  });

  it('leaves out the files over the limit when picking', async () => {
    const small = image(MB);
    const { files, error } = await picker([small, image(2 * MB)]).pick({ multiple: true });

    expect(files).toEqual([small]);
    expect(error).toBe(DEFAULT_FY_LABELS.imageTooLarge(1.5));
  });
});
