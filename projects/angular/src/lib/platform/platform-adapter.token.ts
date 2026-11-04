import { InjectionToken } from '@angular/core';
import { BrowserPlatformAdapter } from './browser-platform-adapter';
import { PlatformAdapter } from './platform-adapter';

/** The host the app runs in; a plain browser unless the app provides another, see `providePlatform`. */
export const PLATFORM_ADAPTER = new InjectionToken<PlatformAdapter>('PLATFORM_ADAPTER', {
  providedIn: 'root',
  factory: () => new BrowserPlatformAdapter()
});
