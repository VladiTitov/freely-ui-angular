import { DOCUMENT, EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { FyTheme } from '../theme/fy-theme';
import { PlatformAdapter } from './platform-adapter';
import { PLATFORM_ADAPTER } from './platform-adapter.token';

/** Runs the app on the host `adapter` creates: starts it and keeps the theme in step with it. */
export function providePlatform(adapter: () => PlatformAdapter): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: PLATFORM_ADAPTER, useFactory: adapter },
    provideAppInitializer(() => {
      const platform = inject(PLATFORM_ADAPTER);
      platform.start();
      inject(DOCUMENT).body.setAttribute('data-platform', platform.platform);
      inject(FyTheme).start();
    })
  ]);
}
