import { EnvironmentProviders } from '@angular/core';
import { BrowserPlatformAdapter, providePlatform } from '@freely-ui/angular';
import { TelegramPlatformAdapter } from './telegram-platform-adapter';
import { isInsideTelegram, telegramWebApp } from './telegram-web-app';

/**
 * Hosts the UI inside a Telegram Mini App, or in a plain browser when Telegram did not open the page.
 * The safe-area insets are CSS, see `styles/telegram.css`.
 */
export function provideTelegramUi(): EnvironmentProviders {
  return providePlatform(() =>
    isInsideTelegram() ? new TelegramPlatformAdapter(telegramWebApp()) : new BrowserPlatformAdapter());
}
