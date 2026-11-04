import { InjectionToken, Provider, Type } from '@angular/core';

/** The component `<fy-loader>` draws, plus inputs to set on it once. */
export interface LoaderIndicator {
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
}

export const LOADER_INDICATOR = new InjectionToken<LoaderIndicator>('LOADER_INDICATOR');

/**
 * Replace the built-in ring of `<fy-loader>` with any component, app-wide or for one subtree.
 * The component should be sized in `em`, so it follows the loader's `size`.
 *
 * ```ts
 * provideLoaderIndicator(DotsLoaderComponent, { label: null })
 * ```
 */
export function provideLoaderIndicator(component: Type<unknown>, inputs?: Record<string, unknown>): Provider {
  return { provide: LOADER_INDICATOR, useValue: { component, inputs } };
}
