import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  output,
  signal,
  untracked
} from '@angular/core';
import { FY_HAPTICS } from '../../haptics/haptics';
import { HapticImpact } from '../../haptics/haptic-impact.enum';
import { FY_ICONS } from '../../providers/fy-icons';
import { FY_LABELS } from '../../providers/fy-labels';
import { LoaderComponent } from '../loader/loader.component';

/** How much of the finger's travel the content follows. */
const RESISTANCE = 0.5;
/** Height the indicator keeps while refreshing, in px. */
const HOLD = 52;

/**
 * Pulling the content down from the top of its scroll reloads it. On release past `threshold` it emits `refresh`
 * and keeps the indicator spinning while `refreshing` is true; the page sets it for the time of the load.
 *
 * ```html
 * <fy-pull-to-refresh [refreshing]="loader.loading()" (refresh)="load()">
 *   <fy-item-list [items]="items()">...</fy-item-list>
 * </fy-pull-to-refresh>
 * ```
 *
 * It reacts to touch only, from wherever the nearest scrolling container (or the page) is at its top. In a Telegram
 * Mini App the platform adapter turns off the swipe that closes the app, so the pull is the page's. Tune the look
 * with the `--fy-pull-to-refresh-*` custom properties.
 */
@Component({
  selector: 'fy-pull-to-refresh',
  templateUrl: './pull-to-refresh.component.html',
  styleUrls: ['./pull-to-refresh.component.css'],
  imports: [LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-pull-to-refresh',
    '[class.fy-pull-to-refresh--pulling]': 'pulling()',
    '[attr.aria-busy]': 'spinning() ? "true" : null'
  }
})
export class PullToRefreshComponent {
  /** The load the pull started is running; the indicator spins until it is false again. */
  readonly refreshing = input(false, { transform: booleanAttribute });
  /** How far the content has to move, in px, to refresh on release. */
  readonly threshold = input(64, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The user pulled past the threshold and let go: load again and set `refreshing` meanwhile. */
  readonly refresh = output<void>();

  protected readonly labels = inject(FY_LABELS);
  protected readonly icons = inject(FY_ICONS);
  private readonly haptics = inject(FY_HAPTICS);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** How far the content is moved down, in px. */
  protected readonly distance = signal(0);
  protected readonly pulling = signal(false);
  /**
   * Released past the threshold; spins until the page's load ends. Only a pull spins it: a load the page starts on
   * its own, e.g. the first one, shows nothing here.
   */
  protected readonly spinning = signal(false);
  protected readonly offset = computed(() => (this.spinning() && !this.pulling() ? HOLD : this.distance()));
  /** 0 to 1 on the way to the threshold, for the arrow's turn and the indicator's fade. */
  protected readonly progress = computed(() => Math.min(this.distance() / this.threshold(), 1));

  private start: { y: number; scroller: Element } | null = null;
  private armed = false;
  /** `refreshing` went up since the pull, so its coming down ends the spin. */
  private sawRefreshing = false;

  constructor() {
    effect(() => {
      const refreshing = this.refreshing();
      untracked(() => {
        if (!this.spinning()) return;
        if (refreshing) this.sawRefreshing = true;
        else if (this.sawRefreshing) this.spinning.set(false);
      });
    });

    // Listened by hand: `touchmove` has to be non-passive to keep the browser from scrolling the pull away.
    afterNextRender(() => {
      const start = (event: TouchEvent) => this.onTouchStart(event);
      const move = (event: TouchEvent) => this.onTouchMove(event);
      const end = () => this.onTouchEnd();
      this.host.addEventListener('touchstart', start, { passive: true });
      this.host.addEventListener('touchmove', move, { passive: false });
      this.host.addEventListener('touchend', end);
      this.host.addEventListener('touchcancel', end);
      this.destroyRef.onDestroy(() => {
        this.host.removeEventListener('touchstart', start);
        this.host.removeEventListener('touchmove', move);
        this.host.removeEventListener('touchend', end);
        this.host.removeEventListener('touchcancel', end);
      });
    });
  }

  private onTouchStart(event: TouchEvent): void {
    if (this.disabled() || this.spinning() || event.touches.length !== 1) return;
    const scroller = scrollParent(this.host);
    if (scroller.scrollTop > 0) return;
    this.start = { y: event.touches[0].clientY, scroller };
    this.armed = false;
  }

  private onTouchMove(event: TouchEvent): void {
    const start = this.start;
    if (!start) return;
    const travel = event.touches[0].clientY - start.y;

    // Up, or the content scrolled meanwhile: the gesture is a scroll, not a pull.
    if (travel <= 0 || start.scroller.scrollTop > 0) {
      if (this.pulling()) this.reset();
      if (travel < 0) this.start = null;
      return;
    }

    if (event.cancelable) event.preventDefault();
    this.pulling.set(true);
    const distance = Math.min(travel * RESISTANCE, this.threshold() * 2);
    this.distance.set(distance);

    const armed = distance >= this.threshold();
    if (armed && !this.armed) this.haptics.impact(HapticImpact.Light);
    this.armed = armed;
  }

  private onTouchEnd(): void {
    if (!this.start) return;
    this.start = null;
    const armed = this.armed;
    this.reset();
    if (!armed) return;
    this.sawRefreshing = this.refreshing();
    this.spinning.set(true);
    this.refresh.emit();
    // A page that sets nothing in its handler, or loads synchronously, has nothing to wait for. Checked after the
    // next render, once a `refreshing` the handler set has reached this input.
    afterNextRender(() => {
      if (!this.sawRefreshing && !this.refreshing()) this.spinning.set(false);
    }, { injector: this.injector });
  }

  private reset(): void {
    this.pulling.set(false);
    this.distance.set(0);
    this.armed = false;
  }
}

/** The nearest ancestor that scrolls vertically, or the page's scrolling element. */
function scrollParent(element: HTMLElement): Element {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return document.scrollingElement ?? document.documentElement;
}
