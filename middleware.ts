import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware'; // Importer le middleware de next-intl
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './app/i18n/routing'; // Chemin vers votre fichier routing.ts

// Récupérer les locales et la locale par défaut depuis routing.ts
const locales = routing.locales ?? ['en', 'fr'];
const defaultLocale = routing.defaultLocale || 'en';

// Créer le middleware next-intl pour gérer les locales
const intlMiddleware = createMiddleware({
  locales, // ['en', 'fr']
  defaultLocale, // 'en'
  localePrefix: 'always' // Forcer les préfixes de locale dans les URLs (ex: /fr/plans)
});

// Définir les routes protégées
const protectedRoutes = ['/dashboard', '/chat', '/brand-monitor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Appliquer le middleware next-intl pour gérer les locales
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    // Si next-intl retourne une réponse (par exemple, une redirection pour ajouter la locale),
    // on la retourne immédiatement
    return intlResponse;
  }

  // 2. Rediriger la racine "/" vers la locale par défaut
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // 3. Protection des routes protégées
  // Extraire le chemin sans la locale (ex: /fr/dashboard -> /dashboard)
  const localeMatch = pathname.match(/^\/(en|fr)(\/.*)?$/);
  const withoutLocale = localeMatch ? localeMatch[2] || '/' : pathname;
  const isProtectedRoute = protectedRoutes.some(
    (route) => withoutLocale === route || withoutLocale.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    const sessionCookie = await getSessionCookie(request);
    if (!sessionCookie) {
      const url = new URL(`/${defaultLocale}/login`, request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 4. Ajouter les en-têtes de sécurité
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

// Configurer le matcher pour toutes les routes sauf api, fichiers statiques, etc.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/', // Inclure la racine
  ],
};