import { Directive, HostListener, inject, Input } from '@angular/core';
import { HapticImpact } from './haptic-impact.enum';
import { HapticFeedback, playHaptic, FY_HAPTICS } from './haptics';

/** Plays `HapticFeedback` on click; see `HapticFeedback` for which one fits the tap. */
@Directive({
  selector: '[fyHaptic]'
})
export class HapticFeedbackDirective {
  @Input('fyHaptic') feedback: HapticFeedback = HapticImpact.Light;

  private readonly haptics = inject(FY_HAPTICS);

  @HostListener('click')
  onClick() {
    playHaptic(this.haptics, this.feedback);
  }
}
