import {
  ColorScheme,
  HomeScreenStatus,
  InvoiceStatus,
  PickFilesOptions,
  pickFilesWithInput,
  PlatformAdapter,
  PlatformBackButton,
  PlatformLaunch
} from '@freely-ui/angular';
import { TelegramHaptics } from './telegram-haptics';
import { TelegramStorage } from './telegram-storage';

const MOBILE_PLATFORMS = ['android', 'ios', 'android_x'];

/** The Telegram Mini App; `webApp` is `Telegram.WebApp`. */
export class TelegramPlatformAdapter implements PlatformAdapter {
  readonly haptics: TelegramHaptics;
  readonly storage: TelegramStorage;
  readonly backButton: PlatformBackButton;

  private backHandler?: () => void;

  constructor(private readonly webApp: any) {
    this.haptics = new TelegramHaptics(webApp);
    this.storage = new TelegramStorage(webApp);
    this.backButton = {
      show: onClick => {
        if (this.backHandler) webApp.BackButton.offClick(this.backHandler);
        this.backHandler = onClick;
        webApp.BackButton.onClick(onClick);
        webApp.BackButton.show();
      },
      hide: () => {
        if (this.backHandler) webApp.BackButton.offClick(this.backHandler);
        this.backHandler = undefined;
        webApp.BackButton.hide();
      }
    };
  }

  get platform(): string {
    return this.webApp.platform;
  }

  start(): void {
    this.webApp.ready();
    this.webApp.expand();

    if (this.webApp.requestFullscreen && MOBILE_PLATFORMS.includes(this.webApp.platform)) {
      this.webApp.requestFullscreen();
    }

    if (this.webApp.isVerticalSwipesEnabled) {
      this.webApp.disableVerticalSwipes();
    }
  }

  close(): void {
    this.webApp.close();
  }

  colorScheme(): ColorScheme {
    return this.webApp.colorScheme === 'light' ? 'light' : 'dark';
  }

  onColorSchemeChanged(handler: () => void): void {
    this.webApp.onEvent('themeChanged', handler);
  }

  setChromeColor(color: string): void {
    this.webApp.setHeaderColor(color);
    this.webApp.setBackgroundColor(color);
  }

  openLink(url: string): void {
    this.webApp.openLink(url);
  }

  openPlatformLink(url: string): void {
    this.webApp.openTelegramLink(url);
  }

  openInvoice(url: string): Promise<InvoiceStatus> {
    return new Promise(resolve => this.webApp.openInvoice(url, (status: InvoiceStatus) => resolve(status)));
  }

  share(url: string, text: string): void {
    this.webApp.openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  }

  pickFiles(options?: PickFilesOptions): Promise<File[]> {
    return pickFilesWithInput(options);
  }

  launch(): PlatformLaunch {
    const data = this.webApp.initDataUnsafe ?? {};
    const user = data.user;

    return {
      user: user
        ? {
            id: user.id,
            isBot: user.is_bot ?? false,
            firstName: user.first_name,
            lastName: user.last_name ?? null,
            username: user.username ?? null,
            languageCode: user.language_code ?? null,
            allowsWriteToPm: user.allows_write_to_pm === true
          }
        : null,
      initData: this.webApp.initData || null,
      startParam: data.start_param
    };
  }

  /** `unsupported` as well on clients older than Bot API 8.0. */
  homeScreenStatus(): Promise<HomeScreenStatus> {
    if (!this.webApp.isVersionAtLeast?.('8.0')) return Promise.resolve('unsupported');
    return new Promise(resolve => this.webApp.checkHomeScreenStatus((status: HomeScreenStatus) => resolve(status)));
  }

  /** Telegram reports only a created shortcut, so a dismissed dialog leaves the promise pending. */
  addToHomeScreen(): Promise<boolean> {
    return new Promise(resolve => {
      const handler = () => {
        this.webApp.offEvent('homeScreenAdded', handler);
        resolve(true);
      };
      this.webApp.onEvent('homeScreenAdded', handler);
      this.webApp.addToHomeScreen();
    });
  }

  /** `null` on clients older than Bot API 6.9, which cannot ask. */
  requestWriteAccess(): Promise<boolean> | null {
    if (!this.webApp.isVersionAtLeast?.('6.9')) return null;
    return new Promise(resolve => this.webApp.requestWriteAccess((granted: boolean) => resolve(granted)));
  }
}
