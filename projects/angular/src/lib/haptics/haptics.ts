import { inject, InjectionToken } from '@angular/core';
import { HapticImpact } from './haptic-impact.enum';
import { HapticNotification } from './haptic-notification.enum';
import { PLATFORM_ADAPTER } from '../platform/platform-adapter.token';

/**
 * What a tap plays, by what it does:
 * - `'selection'` — picks a value without leaving the screen: a tab, a chip, an option, a switch;
 * - `HapticImpact.Light` — opens or closes something: a row, a menu, a modal, back;
 * - `HapticImpact.Medium` — the main action of the screen: save, create, apply;
 * - `HapticImpact.Rigid` — a destructive action: delete, decline;
 * - `HapticNotification` — the outcome of an action, played from code once it is known.
 */
export type HapticFeedback = HapticImpact | HapticNotification | 'selection';

/** Tactile feedback of the host platform, e.g. the Telegram Mini App or a native shell. */
export interface FyHaptics {
  impact(style: HapticImpact): void;
  notification(type: HapticNotification): void;
  /** A tick for a changed choice, lighter than any impact. */
  selection(): void;
}

/** Haptics of the platform the app runs on, see `PLATFORM_ADAPTER`. */
export const FY_HAPTICS = new InjectionToken<FyHaptics>('FY_HAPTICS', {
  providedIn: 'root',
  factory: () => inject(PLATFORM_ADAPTER).haptics,
});

/** Plays any `HapticFeedback` on `haptics`. */
export function playHaptic(haptics: FyHaptics, feedback: HapticFeedback): void {
  if (feedback === 'selection')
    haptics.selection();
  else if (Object.values(HapticNotification).includes(feedback as HapticNotification))
    haptics.notification(feedback as HapticNotification);
  else
    haptics.impact(feedback as HapticImpact);
}
