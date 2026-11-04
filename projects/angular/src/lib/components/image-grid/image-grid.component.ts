import { booleanAttribute, Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { ChipComponent } from '../chip/chip.component';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { ImagePicker } from '../../utils/image-picker';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { ButtonComponent } from '../button/button.component';

export interface ImageGridItem {
  id: string;
  /** A thumbnail is enough: tiles are small. */
  url: string;
}

export interface ImageGridChanges {
  removedIds: string[];
  files: File[];
}

interface PendingImage {
  key: number;
  file: File;
  previewUrl: string;
}

/**
 * A row to add images with a strip of thumbnails under it. Picked files are checked by `ImagePicker`
 * and only kept here; the owner reads `changes` on save and uploads them, then calls `reset()`.
 *
 * ```html
 * <fy-image-grid label="Photos" [existing]="images" [max]="maxImages" [disabled]="busy" />
 * ```
 */
@Component({
  selector: 'fy-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.css'],
  imports: [ButtonComponent, ChipComponent, HapticFeedbackDirective]
})
export class ImageGridComponent implements OnDestroy {
  readonly label = input.required<string>();
  /** Images already saved; removing one only marks it in `changes`. */
  readonly existing = input<ImageGridItem[]>([]);
  /** How many images there may be at most; null (e.g. not loaded yet) — no limit here, the server still checks. */
  readonly max = input<number | null>(null);
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);
  private readonly picker = inject(ImagePicker);

  protected readonly HapticImpact = HapticImpact;

  private readonly removedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly pending = signal<PendingImage[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly kept = computed(() => this.existing().filter(image => !this.removedIds().has(image.id)));
  protected readonly count = computed(() => this.kept().length + this.pending().length);
  protected readonly full = computed(() => {
    const max = this.max();
    return max !== null && this.count() >= max;
  });

  private nextKey = 0;

  get changes(): ImageGridChanges {
    return {
      removedIds: [...this.removedIds()],
      files: this.pending().map(image => image.file)
    };
  }

  reset(): void {
    this.pending().forEach(image => URL.revokeObjectURL(image.previewUrl));
    this.pending.set([]);
    this.removedIds.set(new Set());
    this.error.set(null);
  }

  ngOnDestroy(): void {
    this.reset();
  }

  protected async pickFiles(): Promise<void> {
    const max = this.max();
    const { files, error } = await this.picker.pick({
      multiple: this.multiple(),
      limit: max === null ? null : { max, taken: this.count() }
    });
    if (!files.length && !error) return;

    const added = files.map(file => ({ key: this.nextKey++, file, previewUrl: URL.createObjectURL(file) }));
    this.pending.update(current => [...current, ...added]);
    this.error.set(error);
  }

  protected removeExisting(id: string): void {
    this.removedIds.update(ids => new Set(ids).add(id));
    this.error.set(null);
  }

  protected removePending(key: number): void {
    const image = this.pending().find(item => item.key === key);
    if (image) URL.revokeObjectURL(image.previewUrl);

    this.pending.update(current => current.filter(item => item.key !== key));
    this.error.set(null);
  }
}
