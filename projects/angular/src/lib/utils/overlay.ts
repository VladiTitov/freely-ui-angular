export interface OverlayOptions {
  /** How long the closing transition runs, in ms; `hidden` fires once it is over. */
  duration: number;
  /** Extra class kept on `<html>` while this overlay is open. */
  pageClass?: string;
  beforeShow?: () => void;
  hidden?: () => void;
}

const PAGE_CLASS = 'fy-overlay-open';
const VISIBLE_CLASS = 'fy-is-visible';
const OPEN_CLASS = 'fy-is-open';

/**
 * Show/hide mechanics shared by the modal, the bottom drawer, the popup and the image viewer.
 *
 * The element is moved to the end of `<body>` when shown: this keeps `position: fixed` working
 * under transformed ancestors and puts the most recently opened overlay on top. `fy-is-visible`
 * switches it on and `fy-is-open` drives the CSS transition; `<html>` carries `fy-overlay-open`
 * (page scroll locked) while anything is open. Escape closes the topmost overlay.
 */
export class Overlay {
  private static readonly stack: Overlay[] = [];
  private static escapeBound = false;

  private closing?: ReturnType<typeof setTimeout>;

  constructor(private readonly element: HTMLElement, private readonly options: OverlayOptions) {}

  get isOpen(): boolean {
    return Overlay.stack.includes(this) && this.closing === undefined;
  }

  show(): void {
    if (this.isOpen) return;

    if (this.closing !== undefined) {
      clearTimeout(this.closing);
      this.closing = undefined;
    } else {
      this.options.beforeShow?.();
      Overlay.stack.push(this);
    }

    document.body.appendChild(this.element);
    this.element.classList.add(VISIBLE_CLASS);
    // Flush styles so the transition starts from the closed state.
    void this.element.offsetHeight;
    this.element.classList.add(OPEN_CLASS);
    Overlay.syncPage();
    Overlay.bindEscape();
  }

  hide(): void {
    if (!this.isOpen) return;

    this.element.classList.remove(OPEN_CLASS);
    this.closing = setTimeout(() => {
      this.closing = undefined;
      this.detach();
      this.options.hidden?.();
    }, this.options.duration);
  }

  /** Drop the overlay without animation or `hidden`; call from `ngOnDestroy`. */
  destroy(): void {
    clearTimeout(this.closing);
    this.closing = undefined;
    this.detach();
    this.element.remove();
  }

  private detach(): void {
    this.element.classList.remove(OPEN_CLASS, VISIBLE_CLASS);

    const index = Overlay.stack.indexOf(this);
    if (index !== -1) Overlay.stack.splice(index, 1);
    Overlay.syncPage(this);
  }

  private static syncPage(closed?: Overlay): void {
    const root = document.documentElement;
    root.classList.toggle(PAGE_CLASS, Overlay.stack.length > 0);

    for (const { options } of Overlay.stack) {
      if (options.pageClass) root.classList.add(options.pageClass);
    }

    const cls = closed?.options.pageClass;
    if (cls && !Overlay.stack.some(overlay => overlay.options.pageClass === cls)) root.classList.remove(cls);
  }

  private static bindEscape(): void {
    if (Overlay.escapeBound) return;
    Overlay.escapeBound = true;

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      Overlay.stack.filter(overlay => overlay.isOpen).at(-1)?.hide();
    });
  }
}
