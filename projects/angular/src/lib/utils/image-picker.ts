import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { PLATFORM_ADAPTER } from '../platform/platform-adapter.token';
import { FY_LABELS } from '../providers/fy-labels';

/** What `ImagePicker` lets through, so obviously bad files are rejected before uploading. */
export interface FyImageRules {
  /** Largest file, in bytes. */
  maxBytes: number;
  /** MIME types taken; a file the browser gives no type passes. */
  types: readonly string[];
}

export const DEFAULT_FY_IMAGE_RULES: FyImageRules = {
  maxBytes: 10 * 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
};

export const FY_IMAGE_RULES = new InjectionToken<FyImageRules>('FY_IMAGE_RULES', {
  providedIn: 'root',
  factory: () => DEFAULT_FY_IMAGE_RULES
});

/**
 * Replaces the built-in rules, e.g. with the limits of the app's server; the rules left out stay as they are.
 * Change `imageUnsupportedType` of the labels along with `types`.
 *
 * ```ts
 * providers: [
 *   provideFyImageRules({ maxBytes: 5 * 1024 * 1024 }),
 * ]
 * ```
 */
export function provideFyImageRules(rules: Partial<FyImageRules>): Provider {
  return { provide: FY_IMAGE_RULES, useValue: { ...DEFAULT_FY_IMAGE_RULES, ...rules } };
}

export interface ImageLimit {
  max: number;
  /** Images already there, counted against `max`. */
  taken: number;
}

export interface PickedImages {
  /** The files the server would take, in the order they were picked. */
  files: File[];
  /** Why the other files were left out, or null when all were kept. */
  error: string | null;
}

/**
 * Picks images through the platform's file dialog and checks them against `FY_IMAGE_RULES`.
 *
 * ```ts
 * const { files, error } = await inject(ImagePicker).pick({ multiple: true, limit: { max: 5, taken: 2 } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ImagePicker {
  private readonly platform = inject(PLATFORM_ADAPTER);
  private readonly labels = inject(FY_LABELS);
  private readonly rules = inject(FY_IMAGE_RULES);

  /** Opens the dialog; the files are not checked, for callers that convert them first (see `check`). */
  open(multiple = false): Promise<File[]> {
    return this.platform.pickFiles({ accept: 'image/*', multiple });
  }

  /** Why the rules leave this file out, or null when it looks fine. */
  check(file: File): string | null {
    const labels = this.labels();
    if (file.type && !this.rules.types.includes(file.type)) return labels.imageUnsupportedType;
    if (file.size > this.rules.maxBytes) return labels.imageTooLarge(toMegabytes(this.rules.maxBytes));
    return null;
  }

  /** Opens the dialog and keeps the files that pass `check` and fit into `limit`. */
  async pick(options: { multiple?: boolean; limit?: ImageLimit | null } = {}): Promise<PickedImages> {
    const picked = await this.open(options.multiple);
    const limit = options.limit ?? null;

    const errors = new Set<string>();
    const files: File[] = [];

    for (const file of picked) {
      const error = this.check(file);
      if (error) {
        errors.add(error);
      } else if (limit && limit.taken + files.length >= limit.max) {
        errors.add(this.labels().imageTooMany(limit.max));
      } else {
        files.push(file);
      }
    }

    return { files, error: errors.size ? [...errors].join(' ') : null };
  }
}

/** Bytes as megabytes, with at most one decimal: 10485760 → 10, 1572864 → 1.5. */
function toMegabytes(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}
