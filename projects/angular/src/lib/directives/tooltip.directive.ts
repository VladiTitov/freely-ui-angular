import { DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fieldId } from '../components/form-field/form-field.token';

/** Where the tooltip opens; it flips to the other side when there is no room. */
export type TooltipPosition = 'top' | 'bottom';

/** Delay before a hover opens the tooltip, so passing over the element does not flash it. */
const HOVER_DELAY = 400;
/** Gap between the element and the tooltip, and the least room it keeps from the viewport edges. */
const GAP = 8;

/**
 * A short text about an element, shown on hover after a moment and right away on keyboard focus; Escape,
 * leaving and blur close it. It describes the element (`aria-describedby`) unless it only repeats its
 * `aria-label`. Use it instead of `title`, which touch screens and keyboards never show.
 *
 * ```html
 * <span class="name" [fyTooltip]="fullName">{{ fullName }}</span>
 * <button type="button" aria-label="Settings" fyTooltip="Settings" fyTooltipPosition="bottom">…</button>
 * ```
 *
 * An empty text turns it off. A disabled button gets no mouse events, so put the tooltip on a wrapper.
 * Styled by `base.css` (`.fy-tooltip`).
 */
@Directive({
  selector: '[fyTooltip]',
  host: {
    '(mouseenter)': 'schedule()',
    '(mouseleave)': 'hide()',
    '(pointerdown)': 'pressed = true',
    '(focusin)': 'onFocus()',
    '(focusout)': 'hide()',
    '(click)': 'hide()',
  },
})
export class TooltipDirective {
  readonly text = input<string | null | undefined>('', { alias: 'fyTooltip' });
  readonly position = input<TooltipPosition>('top', { alias: 'fyTooltipPosition' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly id = fieldId('tooltip');
  private tip: HTMLElement | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  /** Set by a tap or a click, which focuses the element on its way. */
  protected pressed = false;

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.hide();
  };

  constructor() {
    effect(() => {
      const text = this.text();
      if (!text) this.hide();
      else if (this.tip) {
        this.tip.textContent = text;
        this.place();
      }
    });
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  protected schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.show(), HOVER_DELAY);
  }

  /** Only a focus from the keyboard opens it; a tap focuses too, and would leave a tooltip under the finger. */
  protected onFocus(): void {
    if (!this.pressed) this.show();
    this.pressed = false;
  }

  show(): void {
    clearTimeout(this.timer);
    const text = this.text();
    if (!text || this.tip) return;

    const tip = this.document.createElement('div');
    tip.className = 'fy-tooltip';
    tip.id = this.id;
    tip.setAttribute('role', 'tooltip');
    tip.textContent = text;
    this.document.body.appendChild(tip);
    this.tip = tip;
    this.place();

    if (this.host.getAttribute('aria-label') !== text) addToken(this.host, 'aria-describedby', this.id);
    this.document.addEventListener('keydown', this.onKeydown);
  }

  hide(): void {
    clearTimeout(this.timer);
    if (!this.tip) return;
    this.tip.remove();
    this.tip = null;
    removeToken(this.host, 'aria-describedby', this.id);
    this.document.removeEventListener('keydown', this.onKeydown);
  }

  private place(): void {
    const tip = this.tip;
    if (!tip) return;
    const view = this.document.defaultView;
    const width = view?.innerWidth ?? 0;
    const height = view?.innerHeight ?? 0;
    const anchor = this.host.getBoundingClientRect();
    const box = tip.getBoundingClientRect();

    const above = anchor.top - box.height - GAP;
    const below = anchor.bottom + GAP;
    const fitsAbove = above >= GAP;
    const fitsBelow = below + box.height <= height - GAP;
    const top = this.position() === 'top' ? (fitsAbove || !fitsBelow ? above : below) : (fitsBelow || !fitsAbove ? below : above);

    const centred = anchor.left + anchor.width / 2 - box.width / 2;
    const left = Math.min(Math.max(centred, GAP), Math.max(GAP, width - box.width - GAP));

    tip.style.top = `${Math.max(top, GAP)}px`;
    tip.style.left = `${left}px`;
  }
}

function addToken(element: HTMLElement, name: string, token: string): void {
  const tokens = (element.getAttribute(name) ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.includes(token)) element.setAttribute(name, [...tokens, token].join(' '));
}

function removeToken(element: HTMLElement, name: string, token: string): void {
  const tokens = (element.getAttribute(name) ?? '').split(/\s+/).filter(t => t && t !== token);
  if (tokens.length) element.setAttribute(name, tokens.join(' '));
  else element.removeAttribute(name);
}
