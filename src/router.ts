/**
 * Sistema de Enrutamiento URL Ligero para SPA (HTML5 History API)
 * Soporta navegación con back/forward, deep-linking (#/dashboard, #/docs, #/api)
 * y protección de rutas seguras.
 */

export type AppRoute = 'home' | 'dashboard' | 'docs' | 'api' | 'security';

export function getRouteFromHash(): AppRoute {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (hash === 'dashboard') return 'dashboard';
  if (hash === 'docs') return 'docs';
  if (hash === 'api') return 'api';
  if (hash === 'security') return 'security';
  return 'home';
}

export function setRouteHash(route: AppRoute) {
  if (typeof window !== 'undefined') {
    window.location.hash = route === 'home' ? '' : `#/${route}`;
  }
}
