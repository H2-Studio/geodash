import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './app/i18n/routing'; // <-- adapte ce chemin si besoin

const locales = routing.locales ?? ['en', 'fr']; // récupère la liste des locales
const defaultLocale = routing.defaultLocale || 'en';

// Définis les routes protégées (toujours inclure le slash)
const protectedRoutes = ['/dashboard', '/chat', '/brand-monitor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirige toute route sans locale (ex : "/brand-monitor") vers locale par défaut
  const matchesLocale = locales.some(loc => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`));
  if (!matchesLocale && pathname !== '/') {
    // Ne pas rediriger les routes API ni fichiers statiques (déjà géré par le matcher)
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // 2. Redirige la racine "/" vers locale par défaut
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // 3. Protection des routes protégées (uniquement si la locale est présente)
  // On enlève le /[locale] du pathname pour checker la vraie route
  const withoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';
  const isProtectedRoute = protectedRoutes.some(route =>
    withoutLocale === route || withoutLocale.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    const sessionCookie = await getSessionCookie(request);

    if (!sessionCookie) {
      const url = new URL(`/${defaultLocale}/login`, request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 4. Headers de sécurité classiques
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

// MATCH TOUT sauf api/static/image/files
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/', // pour la racine
  ],
};
