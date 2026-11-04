import { LocalPlatformStorage, PlatformStorage } from '@freely-ui/angular';

/**
 * Telegram CloudStorage, which follows the user to their other devices, with a copy in `localStorage`
 * for clients older than Bot API 6.9 and for values written before the cloud had them.
 */
export class TelegramStorage implements PlatformStorage {
  private readonly local = new LocalPlatformStorage();

  constructor(private readonly webApp: any) {}

  private get cloud(): any {
    return this.webApp.isVersionAtLeast?.('6.9') ? this.webApp.CloudStorage : null;
  }

  async getItem(key: string): Promise<string | null> {
    const cloud = this.cloud;
    const remote = cloud
      ? await new Promise<string | null>(resolve =>
          cloud.getItem(key, (error: unknown, value?: string) => resolve(error ? null : value || null)))
      : null;
    return remote ?? this.local.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.local.setItem(key, value);
    this.cloud?.setItem(key, value);
  }
}
