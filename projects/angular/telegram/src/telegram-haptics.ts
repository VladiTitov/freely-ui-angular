import { HapticImpact, HapticNotification, FyHaptics } from '@freely-ui/angular';

const MOBILE_PLATFORMS = ['android', 'ios', 'android_x'];

/** Telegram's haptic feedback; silent outside the mobile clients, which are the only ones that vibrate. */
export class TelegramHaptics implements FyHaptics {
  constructor(private readonly webApp: any) {}

  private get haptic() {
    return MOBILE_PLATFORMS.includes(this.webApp.platform) ? this.webApp.HapticFeedback : undefined;
  }

  impact(style: HapticImpact = HapticImpact.Light): void {
    this.haptic?.impactOccurred(style);
  }

  notification(type: HapticNotification): void {
    this.haptic?.notificationOccurred(type);
  }

  selection(): void {
    this.haptic?.selectionChanged();
  }
}
