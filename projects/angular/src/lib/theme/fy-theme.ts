import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { ColorScheme } from '../platform/platform-adapter';
import { PLATFORM_ADAPTER } from '../platform/platform-adapter.token';

/** `system` follows the colour scheme of the host platform. */
export type ColorSchemePreference = ColorScheme | 'system';

/** Same key as in the app's `theme-init.js`, which applies the choice before the first paint. */
const STORAGE_KEY = 'color_scheme';

/** Class that makes the colours fade, see `styles/base.css`; held a little longer than the fade itself. */
const TRANSITION_CLASS = 'fy-theme-transition';
const TRANSITION_MS = 350;

/**
 * Keeps `data-theme` in step with the user's choice, or with the platform's colour scheme when there is none,
 * and paints the platform's own chrome to match. The choice is stored on the device for the first paint; the app
 * keeps it in step with the user's other devices.
 */
@Injectable({
  providedIn: 'root'
})
export class FyTheme {
  private readonly document = inject(DOCUMENT);
  private readonly platform = inject(PLATFORM_ADAPTER);

  private readonly _preference = signal<ColorSchemePreference>(this.readPreference());
  readonly preference = this._preference.asReadonly();

  private transitionTimer?: ReturnType<typeof setTimeout>;

  start(): void {
    this.apply();
    this.platform.onColorSchemeChanged(() => this.apply(true));
  }

  setPreference(preference: ColorSchemePreference): void {
    this._preference.set(preference);
    this.writePreference(preference);
    this.apply(true);
  }

  private get scheme(): ColorScheme {
    const preference = this._preference();
    return preference === 'system' ? this.platform.colorScheme() : preference;
  }

  /** `animate` fades the colours over instead of switching them at once. */
  private apply(animate = false): void {
    const root = this.document.documentElement;
    const scheme = this.scheme;
    if (animate && root.getAttribute('data-theme') !== scheme) this.fade(root);
    root.setAttribute('data-theme', scheme);

    const background = getComputedStyle(root).getPropertyValue('--fy-primary-background').trim();
    if (background) this.platform.setChromeColor(background);
  }

  private fade(root: HTMLElement): void {
    root.classList.add(TRANSITION_CLASS);
    clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
  }

  private readPreference(): ColorSchemePreference {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  private writePreference(preference: ColorSchemePreference): void {
    try {
      if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, preference);
    } catch { /* private mode: the choice lasts until the app is closed */ }
  }
}
