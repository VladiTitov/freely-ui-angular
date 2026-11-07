import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  signal
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FY_HAPTICS } from '../../haptics/haptics';
import { HapticImpact } from '../../haptics/haptic-impact.enum';

/** `accent` — an everyday action, `danger` — one that deletes or declines, `neutral` — a quiet one. */
export type SwipeActionTone = 'accent' | 'danger' | 'neutral';

/** One button under a row, revealed by a swipe. */
export interface SwipeAction {
  /** What `action` emits when the button is pressed or the row is swiped all the way. */
  id: string;
  /** Text under the icon, and the button's accessible name. */
  label: string;
  /** Icon class echoed onto an `<i>`, e.g. `bi bi-trash3`. */
  icon?: string;
  tone?: SwipeActionTone;
}

/** Which side the row was opened to. */
type OpenSide = 'start' | 'end' | null;

/** The row that is open now: opening another one closes it. */
let openRow: SwipeActionsComponent | null = null;

/** Movement before a touch is taken as a swipe, or let go as a scroll. */
const SLOP = 8;
/** Part of the row width a swipe has to pass to run the first action on its own. */
const FULL_SWIPE = 0.6;

/**
 * Buttons under a list row, revealed by swiping it sideways: `endActions` by swiping toward the start (left in a
 * left-to-right page), `startActions` the other way. The first action of each side sits at the outer edge; swiping
 * the row all the way runs it, with `fullSwipe`. Pressing a button or swiping all the way emits `action` with its
 * `id` and closes the row.
 *
 * ```html
 * <fy-swipe-actions [endActions]="[{ id: 'delete', label: 'Delete', icon: 'bi bi-trash3', tone: 'danger' }]"
 *   [startActions]="[{ id: 'read', label: 'Read', icon: 'bi bi-envelope-open' }]" (action)="onAction(item, $event)">
 *   <fy-item-card [title]="item.title" />
 * </fy-swipe-actions>
 * ```
 *
 * Only one row is open at a time; a tap anywhere else closes it. The buttons stay reachable from the keyboard:
 * focusing one opens its side. Vertical scrolling is left to the page. Tune the look with the
 * `--fy-swipe-actions-*` custom properties.
 */
@Component({
  selector: 'fy-swipe-actions',
  templateUrl: './swipe-actions.component.html',
  styleUrls: ['./swipe-actions.component.css'],
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fy-swipe-actions',
    '[class.fy-swipe-actions--dragging]': 'dragging()',
    '[class.fy-swipe-actions--open]': 'side() !== null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(pointercancel)': 'onPointerCancel()',
    '(focusin)': 'onFocusIn($event)',
    '(keydown.escape)': 'close()'
  }
})
export class SwipeActionsComponent {
  /** Revealed by swiping toward the end; the first one sits at the start edge. */
  readonly startActions = input<readonly SwipeAction[]>([]);
  /** Revealed by swiping toward the start; the first one sits at the end edge. */
  readonly endActions = input<readonly SwipeAction[]>([]);
  /** Width of one button in px. */
  readonly actionWidth = input(76, { transform: numberAttribute });
  /** Swiping the row all the way runs the first action of that side. */
  readonly fullSwipe = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The `id` of the action pressed or swiped. */
  readonly action = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly haptics = inject(FY_HAPTICS);

  /** How far the content is moved, in px; positive toward the end of the line. */
  protected readonly offset = signal(0);
  protected readonly dragging = signal(false);
  protected readonly side = signal<OpenSide>(null);

  protected readonly startWidth = computed(() => this.startActions().length * this.actionWidth());
  protected readonly endWidth = computed(() => this.endActions().length * this.actionWidth());
  /** The swipe has gone far enough to run the first action of its side on release. */
  protected readonly armed = signal(false);

  /** The physical movement in px maps to `offset` reversed in a right-to-left page. */
  protected direction = 1;
  private start: { x: number; y: number; offset: number; pointer: number } | null = null;
  /** Null until the touch is told apart: a sideways swipe or a vertical scroll. */
  private horizontal: boolean | null = null;
  /** The last gesture moved the row, so the click that ends it is not a tap on the row. */
  private swallowClick = false;
  private readonly onOutside = (event: PointerEvent) => {
    if (!this.host.contains(event.target as Node)) this.close();
  };

  constructor() {
    // In the capture phase, so the click ending a swipe never reaches the row's own links and buttons.
    const onClick = (event: MouseEvent) => this.onClick(event);
    this.host.addEventListener('click', onClick, true);
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('click', onClick, true);
      this.unlisten();
      if (openRow === this) openRow = null;
    });
  }

  /** Slides the row back over its buttons. */
  close(): void {
    this.moveTo(0, null);
  }

  /** Opens the row to show the buttons of `side`. */
  open(side: 'start' | 'end'): void {
    const width = side === 'start' ? this.startWidth() : this.endWidth();
    if (width === 0) return;
    this.moveTo(side === 'start' ? width : -width, side);
  }

  protected onActionClick(action: SwipeAction): void {
    this.action.emit(action.id);
    this.close();
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled() || event.button !== 0) return;
    this.direction = getComputedStyle(this.host).direction === 'rtl' ? -1 : 1;
    this.start = { x: event.clientX, y: event.clientY, offset: this.offset(), pointer: event.pointerId };
    this.horizontal = null;
    this.swallowClick = false;
  }

  protected onPointerMove(event: PointerEvent): void {
    const start = this.start;
    if (!start || event.pointerId !== start.pointer) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (this.horizontal === null) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      this.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!this.horizontal) {
        this.start = null;
        return;
      }
      this.host.setPointerCapture?.(event.pointerId);
      this.dragging.set(true);
      this.swallowClick = true;
      if (openRow && openRow !== this) openRow.close();
    }

    const offset = this.limit(start.offset + dx * this.direction);
    this.offset.set(offset);
    this.arm(offset);
  }

  protected onPointerUp(): void {
    if (!this.start) return;
    this.start = null;
    if (!this.dragging()) return;
    this.dragging.set(false);

    const offset = this.offset();
    const sideNow: 'start' | 'end' = offset > 0 ? 'start' : 'end';
    const actions = sideNow === 'start' ? this.startActions() : this.endActions();
    const width = sideNow === 'start' ? this.startWidth() : this.endWidth();

    if (this.armed() && actions.length) {
      this.armed.set(false);
      this.action.emit(actions[0].id);
      this.close();
    } else if (width > 0 && Math.abs(offset) > width / 2) {
      this.open(sideNow);
    } else {
      this.close();
    }
  }

  protected onPointerCancel(): void {
    this.start = null;
    this.dragging.set(false);
    const side = this.side();
    if (side) this.open(side);
    else this.close();
  }

  /** A tap on an open row closes it instead of opening what the row leads to; so does the click ending a swipe. */
  private onClick(event: MouseEvent): void {
    const onButton = (event.target as Element).closest?.('.fy-swipe-actions__button');
    if (onButton) return;
    if (this.swallowClick || this.side() !== null) {
      event.preventDefault();
      event.stopPropagation();
      this.swallowClick = false;
      if (this.side() !== null) this.close();
    }
  }

  /** Tabbing to a button opens its side, so the focused button is in view. */
  protected onFocusIn(event: FocusEvent): void {
    const button = (event.target as Element).closest?.('.fy-swipe-actions__actions');
    if (!button) return;
    this.open(button.classList.contains('fy-swipe-actions__actions--start') ? 'start' : 'end');
  }

  /** Within the buttons the row follows the finger; past them it follows on for a full swipe, or else resists. */
  private limit(offset: number): number {
    const max = this.startWidth();
    const min = -this.endWidth();
    if (offset > max) return max === 0 ? 0 : max + this.beyond(offset - max);
    if (offset < min) return min === 0 ? 0 : min - this.beyond(min - offset);
    return offset;
  }

  private beyond(over: number): number {
    return this.fullSwipe() ? Math.min(over, this.host.clientWidth) : Math.min(over * 0.2, 24);
  }

  private arm(offset: number): void {
    const width = this.host.clientWidth;
    const armed = this.fullSwipe() && width > 0 && Math.abs(offset) > width * FULL_SWIPE;
    if (armed === this.armed()) return;
    this.armed.set(armed);
    if (!armed) return;
    const actions = offset > 0 ? this.startActions() : this.endActions();
    this.haptics.impact(actions[0]?.tone === 'danger' ? HapticImpact.Rigid : HapticImpact.Medium);
  }

  private moveTo(offset: number, side: OpenSide): void {
    const wasOpen = this.side() !== null;
    this.offset.set(offset);
    this.side.set(side);
    this.armed.set(false);

    if (side !== null) {
      if (openRow && openRow !== this) openRow.close();
      openRow = this;
      if (!wasOpen) {
        this.haptics.selection();
        document.addEventListener('pointerdown', this.onOutside, true);
      }
    } else {
      if (openRow === this) openRow = null;
      this.unlisten();
    }
  }

  private unlisten(): void {
    document.removeEventListener('pointerdown', this.onOutside, true);
  }
}
