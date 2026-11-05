import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, inject, Input, NgZone, numberAttribute, OnDestroy, Output } from '@angular/core';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

const COLLAPSED_CLASS = 'fy-avatar-header--collapsed';
const TRANSITION_MS = 280;
const TRANSITION_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

interface LayoutSnapshot {
  height: number;
  avatar: DOMRect;
  text: DOMRect;
}

@Component({
  selector: 'fy-avatar-header',
  templateUrl: './avatar-header.component.html',
  styleUrls: ['./avatar-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserAvatarComponent],
  // The collapsed class is toggled by hand so a transition can measure the layout
  // on both sides of the switch synchronously.
  host: { class: 'fy-avatar-header', '[class.fy-avatar-header--inline]': "layout === 'inline'" },
})
export class AvatarHeaderComponent implements AfterViewInit, OnDestroy {
  /** Forwarded to `fy-user-avatar`; also the fallback for `primaryLabel`. */
  @Input() fullName = '';

  /**
   * Forwarded to `fy-user-avatar`: the photo shown instead of initials.
   * Project an element with the `avatarAction` attribute to put a control on the avatar's corner.
   */
  @Input() imageUrl?: string | null;

  /**
   * `stacked` (default) centres the avatar above the text; `inline` puts the text to its right.
   * Either way, project `[avatarHeaderEnd]` (a button at the row's end) and `[avatarHeaderBelow]`
   * (content under the row); both are hidden while collapsed.
   */
  @Input() layout: 'stacked' | 'inline' = 'stacked';

  /** Top line — name / title. Falls back to `fullName` when empty. */
  @Input() primaryLabel?: string | null;

  /** Second line — `@username`, a status. Hidden when empty. */
  @Input() secondaryLabel?: string | null;

  /** Avatar diameter (px) in each mode; collapsed matches the home header avatar. */
  @Input({ transform: numberAttribute }) expandedSize = 60;
  @Input({ transform: numberAttribute }) collapsedSize = 44;

  /** Avatar initials size (px) in each mode. */
  @Input({ transform: numberAttribute }) expandedFontSize = 20;
  @Input({ transform: numberAttribute }) collapsedFontSize = 16;

  /** Scroll distance (px) past which the header auto-collapses. */
  @Input({ transform: numberAttribute }) collapseOffset = 24;

  /**
   * Scroll distance (px) at or below which a collapsed header expands again. Kept well below
   * `collapseOffset` so small scroll jitter around one threshold cannot flip the mode back and forth.
   */
  @Input({ transform: numberAttribute }) expandOffset = 4;

  /**
   * `null` (default) auto-detects from scroll. Set a boolean to control the mode
   * from the parent — this also stops the internal scroll listener.
   */
  @Input()
  get collapsed(): boolean | null {
    return this._collapsed;
  }
  set collapsed(value: boolean | null) {
    this._collapsed = value;
    if (value !== null) {
      this.teardown();
    }
    this.applyCollapsedClass();
  }
  private _collapsed: boolean | null = null;

  /** Scroll element to watch. Defaults to the nearest `.fy-page-scroll-container`. */
  @Input() scrollRoot?: HTMLElement | null;

  /** Emits whenever the auto-detected mode flips. Enables `[(collapsed)]`. */
  @Output() collapsedChange = new EventEmitter<boolean>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  private scrollTarget: HTMLElement | null = null;
  private frame: number | null = null;
  private lockTimer: ReturnType<typeof setTimeout> | null = null;
  private auto = false;

  get isCollapsed(): boolean {
    return this._collapsed ?? this.auto;
  }

  protected get resolvedPrimaryLabel(): string {
    return this.primaryLabel || this.fullName;
  }

  protected get avatarSize(): number {
    return this.isCollapsed ? this.collapsedSize : this.expandedSize;
  }

  protected get avatarFontSize(): number {
    return this.isCollapsed ? this.collapsedFontSize : this.expandedFontSize;
  }

  ngAfterViewInit(): void {
    if (this._collapsed !== null) {
      return;
    }

    this.scrollTarget =
      this.scrollRoot ??
      this.host.nativeElement.closest<HTMLElement>('.fy-page-scroll-container') ??
      null;

    if (!this.scrollTarget) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.scrollTarget!.addEventListener('scroll', this.onScroll, { passive: true });
    });
    // A restored scroll position is applied without animation.
    this.evaluate(false);
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private readonly onScroll = (): void => {
    if (this.frame !== null) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.evaluate(true);
    });
  };

  private evaluate(animate: boolean): void {
    const target = this.scrollTarget;
    if (!target || this.lockTimer !== null) {
      return;
    }

    const top = target.scrollTop;
    if (!this.auto && top > this.collapseOffset && this.staysScrolledAfterCollapse(target)) {
      this.switchMode(true, animate);
    } else if (this.auto && top <= this.expandOffset) {
      this.switchMode(false, animate);
    }
  }

  /**
   * Collapsing shrinks the header, which shrinks the scrollable height by the same amount.
   * On a short page the browser then clamps `scrollTop` back under `expandOffset` and the header
   * would expand again — a loop. Only collapse when there is enough content to stay scrolled.
   * The collapsed header is at least `collapsedSize` tall, so the real shrink never exceeds this estimate.
   */
  private staysScrolledAfterCollapse(target: HTMLElement): boolean {
    const shrink = Math.max(0, this.host.nativeElement.offsetHeight - this.collapsedSize);
    const maxScrollAfter = target.scrollHeight - target.clientHeight - shrink;
    return maxScrollAfter > this.expandOffset;
  }

  private switchMode(next: boolean, animate: boolean): void {
    const play = animate && !this.prefersReducedMotion();
    const first = play ? this.snapshot() : null;

    this.auto = next;
    this.applyCollapsedClass();
    this.cdr.detectChanges();
    this.collapsedChange.emit(next);

    if (first) {
      this.playTransition(first);
    }

    // Ignore scroll while the layout settles (the height change itself moves scrollTop),
    // then re-check once so the final mode still matches where the user stopped.
    this.lockTimer = setTimeout(() => {
      this.lockTimer = null;
      this.evaluate(true);
    }, TRANSITION_MS + 40);
  }

  /** FLIP: animate avatar, text and header height from the old layout into the new one. */
  private playTransition(first: LayoutSnapshot): void {
    const last = this.snapshot();
    const options: KeyframeAnimationOptions = { duration: TRANSITION_MS, easing: TRANSITION_EASING };
    const { avatarEl, textEl } = this.parts();

    this.host.nativeElement.animate(
      [{ height: `${first.height}px` }, { height: `${last.height}px` }],
      options
    );
    avatarEl.animate([{ transform: this.invert(first.avatar, last.avatar) }, { transform: 'none' }], options);
    textEl.animate([{ transform: this.invert(first.text, last.text) }, { transform: 'none' }], options);
  }

  private invert(from: DOMRect, to: DOMRect): string {
    const scale = to.height ? from.height / to.height : 1;
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`;
  }

  private snapshot(): LayoutSnapshot {
    const { avatarEl, textEl, circleEl } = this.parts();
    // The avatar's own size transition would report a mid-flight size; measure the final one.
    circleEl?.style.setProperty('transition', 'none');
    const shot: LayoutSnapshot = {
      height: this.host.nativeElement.getBoundingClientRect().height,
      avatar: avatarEl.getBoundingClientRect(),
      text: textEl.getBoundingClientRect(),
    };
    circleEl?.style.removeProperty('transition');
    return shot;
  }

  private parts() {
    const host = this.host.nativeElement;
    return {
      avatarEl: host.querySelector<HTMLElement>('.fy-avatar-header__avatar')!,
      textEl: host.querySelector<HTMLElement>('.fy-avatar-header__text')!,
      circleEl: host.querySelector<HTMLElement>('.fy-avatar-circle'),
    };
  }

  private applyCollapsedClass(): void {
    this.host.nativeElement.classList.toggle(COLLAPSED_CLASS, this.isCollapsed);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private teardown(): void {
    this.scrollTarget?.removeEventListener('scroll', this.onScroll);
    this.scrollTarget = null;
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.lockTimer !== null) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }
}
