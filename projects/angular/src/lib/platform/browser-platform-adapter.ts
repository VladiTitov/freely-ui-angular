import {
  ColorScheme,
  HomeScreenStatus,
  InvoiceStatus,
  PickFilesOptions,
  PlatformAdapter,
  PlatformBackButton,
  PlatformLaunch,
  PlatformStorage
} from './platform-adapter';
import { pickFilesWithInput } from './pick-files';

/** `localStorage`, which stays on this device; quietly empty where the browser forbids it. */
export class LocalPlatformStorage implements PlatformStorage {
  getItem(key: string): Promise<string | null> {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  }

  setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch { /* private mode: the value lasts until the app is closed */ }
    return Promise.resolve();
  }
}

/**
 * Stand-in for a plain browser, e.g. while developing outside Telegram: no haptics and no back button,
 * links open in new tabs, the colour scheme follows the system and nobody is signed in by the platform.
 */
export class BrowserPlatformAdapter implements PlatformAdapter {
  readonly platform = 'web';

  readonly haptics = { impact: () => {}, notification: () => {}, selection: () => {} };
  readonly backButton: PlatformBackButton = { show: () => {}, hide: () => {} };
  readonly storage: PlatformStorage = new LocalPlatformStorage();

  private readonly darkQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)');

  start(): void {}

  close(): void {}

  colorScheme(): ColorScheme {
    return this.darkQuery?.matches === false ? 'light' : 'dark';
  }

  onColorSchemeChanged(handler: () => void): void {
    this.darkQuery?.addEventListener?.('change', handler);
  }

  setChromeColor(): void {}

  openLink(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  openPlatformLink(url: string): void {
    this.openLink(url);
  }

  openInvoice(url: string): Promise<InvoiceStatus> {
    this.openLink(url);
    return Promise.resolve('pending');
  }

  share(url: string, text: string): void {
    if (navigator.share) {
      navigator.share({ url, text }).catch(() => { /* the user closed the share sheet */ });
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`).catch(() => {});
    }
  }

  pickFiles(options?: PickFilesOptions): Promise<File[]> {
    return pickFilesWithInput(options);
  }

  launch(): PlatformLaunch {
    const startParam = new URLSearchParams(location.search).get('startapp') ?? undefined;
    return { user: null, initData: null, startParam };
  }

  homeScreenStatus(): Promise<HomeScreenStatus> {
    return Promise.resolve('unsupported');
  }

  addToHomeScreen(): Promise<boolean> {
    return Promise.resolve(false);
  }

  requestWriteAccess(): null {
    return null;
  }
}
