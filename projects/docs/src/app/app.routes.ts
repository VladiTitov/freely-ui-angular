import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { findDoc } from './docs/registry';

const SITE = 'Freely UI';

/** Title of a component page, e.g. "Button — Freely UI"; the slug comes from the URL. */
function componentTitle(route: ActivatedRouteSnapshot): string {
  const doc = findDoc(route.paramMap.get('slug') ?? '');
  return doc ? `${doc.title} for Angular — ${SITE}` : `Not found — ${SITE}`;
}

export const routes: Routes = [
  { path: '', title: `${SITE} — free Angular UI kit`, loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'installation', title: `Installation — ${SITE}`, loadComponent: () => import('./pages/installation.component').then(m => m.InstallationComponent) },
  { path: 'theming', title: `Theming — ${SITE}`, loadComponent: () => import('./pages/theming.component').then(m => m.ThemingComponent) },
  { path: 'telegram', title: `Telegram Mini Apps — ${SITE}`, loadComponent: () => import('./pages/telegram.component').then(m => m.TelegramComponent) },
  { path: 'components', title: `Components — ${SITE}`, loadComponent: () => import('./pages/components.component').then(m => m.ComponentsComponent) },
  {
    path: 'components/:slug',
    title: route => componentTitle(route),
    loadComponent: () => import('./pages/component-page.component').then(m => m.ComponentPageComponent),
  },
  { path: '**', title: `Not found — ${SITE}`, loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent) },
];
