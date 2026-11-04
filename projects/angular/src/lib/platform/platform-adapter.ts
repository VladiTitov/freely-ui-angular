import { FyHaptics } from '../haptics/haptics';

export type ColorScheme = 'light' | 'dark';

/** Account the host platform opened the app for. */
export interface PlatformUser {
  id: number;
  isBot: boolean;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  languageCode?: string | null;
  /** Whether the platform's bot may message the user. */
  allowsWriteToPm: boolean;
}

/** What the app was opened with; the server checks `initData` and takes the user from it. */
export interface PlatformLaunch {
  user: PlatformUser | null;
  /** Signed launch data; `null` when the platform gives none. */
  initData: string | null;
  /** Parameter of the link that opened the app, e.g. an invite code. */
  startParam?: string;
}

export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

/** `unsupported` where the platform has no home screen shortcuts. */
export type HomeScreenStatus = 'added' | 'missed' | 'unknown' | 'unsupported';

/** Key-value storage that follows the user to their other devices where the platform can. */
export interface PlatformStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/** The platform's own back button, drawn outside the page. */
export interface PlatformBackButton {
  show(onClick: () => void): void;
  hide(): void;
}

export interface PickFilesOptions {
  /** As the `accept` of a file input, e.g. `image/*`. */
  accept?: string;
  multiple?: boolean;
}

/**
 * Everything the UI needs from the host it runs in, e.g. the Telegram Mini App or a plain browser.
 * Components reach the host only through this, so the app runs wherever there is an adapter for it.
 */
export interface PlatformAdapter {
  /** Short name of the host, set as `data-platform` on `<body>`, e.g. `ios` in Telegram or `web`. */
  readonly platform: string;

  /** Tells the host the app is ready and takes as much of the screen as the host allows. */
  start(): void;
  /** Closes the app; does nothing where the app cannot close itself. */
  close(): void;

  // Theme
  /** Colour scheme of the host, followed when the user has not picked one. */
  colorScheme(): ColorScheme;
  onColorSchemeChanged(handler: () => void): void;
  /** Paints the host's own header and background to match the page. */
  setChromeColor(color: string): void;

  readonly haptics: FyHaptics;
  readonly backButton: PlatformBackButton;
  readonly storage: PlatformStorage;

  // Links and payments
  /** Opens an external page outside the app. */
  openLink(url: string): void;
  /** Opens a link of the platform itself, e.g. a chat with a bot; the app stays open behind it. */
  openPlatformLink(url: string): void;
  openInvoice(url: string): Promise<InvoiceStatus>;
  /** Lets the user send `url` with `text` to someone of their choice. */
  share(url: string, text: string): void;

  pickFiles(options?: PickFilesOptions): Promise<File[]>;

  /** Launch data for the login. */
  launch(): PlatformLaunch;

  homeScreenStatus(): Promise<HomeScreenStatus>;
  /** Resolves `true` once the shortcut is created. */
  addToHomeScreen(): Promise<boolean>;
  /** Asks the user to let the bot message them; `null` where the platform cannot ask. */
  requestWriteAccess(): Promise<boolean> | null;
}
