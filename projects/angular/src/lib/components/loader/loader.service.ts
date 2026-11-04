import { computed, Injectable, signal } from '@angular/core';
import { defer, finalize, Observable } from 'rxjs';

/**
 * A self-contained, reference-counted loading indicator for one component or
 * one operation. Overlapping calls keep {@link loading} `true` until the last
 * one settles. Create instances via {@link LoaderService.scope}.
 */
export class LoaderScope {
  private readonly pending = signal(0);

  /** `true` while at least one tracked operation in this scope is running. */
  readonly loading = computed(() => this.pending() > 0);

  /** Mark an operation as started; call the returned function once to finish it. */
  begin(): () => void {
    this.pending.update((count) => count + 1);

    let settled = false;
    return () => {
      if (settled) return;
      settled = true;
      this.pending.update((count) => Math.max(0, count - 1));
    };
  }

  /**
   * Wrap an Observable so this scope reports `loading` from the moment it is
   * subscribed until it completes, errors, or is unsubscribed.
   */
  track<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      const done = this.begin();
      return source.pipe(finalize(done));
    });
  }
}

/**
 * Factory for {@link LoaderScope}s. Inject where a component needs a local
 * spinner and wrap its async calls with `scope.track(...)`.
 */
@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  /** Create an independent loading scope. */
  scope(): LoaderScope {
    return new LoaderScope();
  }
}
