import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { HapticFeedbackDirective } from '../../haptics/haptic-feedback.directive';

/** A tab with a shorter label for when the full labels do not fit. */
export interface TabItem {
  label: string;
  shortLabel?: string;
}

@Component({
  selector: 'fy-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HapticFeedbackDirective],
})
export class TabsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() tabs: readonly (string | TabItem)[] = [];
  @Input() activeIndex = 0;
  @Input() ariaLabel?: string;

  @Output() activeIndexChange = new EventEmitter<number>();

  @ViewChild('indicator') private indicatorRef?: ElementRef<HTMLElement>;
  @ViewChildren('tabButton') private tabButtonRefs?: QueryList<ElementRef<HTMLButtonElement>>;

  // Tracks size changes of the host, including hidden → visible (e.g. tabs inside a closed modal),
  // which a window resize listener would miss and leave the indicator at zero width.
  private resizeObserver?: ResizeObserver;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  protected label(tab: string | TabItem): string {
    return typeof tab === 'string' ? tab : tab.label;
  }

  protected shortLabel(tab: string | TabItem): string | undefined {
    return typeof tab === 'string' ? undefined : tab.shortLabel;
  }

  protected select(index: number): void {
    if (index === this.activeIndex) return;
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
    this.moveIndicator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeIndex'] && !changes['activeIndex'].firstChange) {
      this.moveIndicator();
    }
    if (changes['tabs'] && !changes['tabs'].firstChange) {
      queueMicrotask(() => this.layout());
    }
  }

  ngAfterViewInit(): void {
    this.layout();
    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  // Short labels take over only while a full one is cut off. The class is set on the host directly,
  // like the indicator's position, since it follows the measured layout rather than the inputs.
  private layout(): void {
    const host = this.host.nativeElement;
    const buttons = this.tabButtonRefs?.map(ref => ref.nativeElement) ?? [];
    if (this.tabs.some(tab => this.shortLabel(tab))) {
      host.classList.remove('fy-tabs--compact');
      const overflows = buttons.some(button => {
        const label = button.querySelector<HTMLElement>('.fy-tabs-label');
        return !!label && label.scrollWidth > label.clientWidth;
      });
      host.classList.toggle('fy-tabs--compact', overflows);
    }
    this.moveIndicator(false);
  }

  // Layout-driven moves (first render, resize) jump into place; only tab switches animate.
  private moveIndicator(animate = true): void {
    const button = this.tabButtonRefs?.get(this.activeIndex)?.nativeElement;
    const indicator = this.indicatorRef?.nativeElement;
    if (!button || !indicator || !button.offsetWidth) return;

    if (!animate) indicator.style.transition = 'none';
    indicator.style.left = `${button.offsetLeft}px`;
    indicator.style.width = `${button.offsetWidth}px`;
    if (!animate) {
      indicator.getBoundingClientRect();
      indicator.style.transition = '';
    }
  }
}
