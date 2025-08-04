'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomer } from '@/hooks/useAutumnCustomer';
import { BrandLogo } from './ui/BrandLogo';
import LocaleSwitcher from './locale-switcher';
import { Menu } from 'lucide-react';
import LocalizedLink from './localized-link';
import { useTranslations } from 'next-intl';

function UserCredits() {
  const { customer } = useCustomer();
  const t = useTranslations('navbar');
  const messageUsage =
    customer?.features?.messages ??
    customer?.features?.['pro-messages'] ??
    customer?.features?.['free-messages'];
  const remainingMessages = messageUsage ? (messageUsage.balance || 0) : 0;
  return (
    <div className="flex items-center text-sm font-medium text-gray-700">
      <span>{remainingMessages}</span>
      <span className="ml-1">{t('credits')}</span>
    </div>
  );
}

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('navbar');
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setTimeout(() => {
        router.refresh();
        setIsLoggingOut(false);
      }, 100);
    } catch (error) {
      setIsLoggingOut(false);
    }
  };

  const links = (
    <>
      {session && (
        <LocalizedLink
          href="/brand-monitor"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {t('brandMonitor')}
        </LocalizedLink>
      )}
      <LocalizedLink
        href="/plans"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {t('plans')}
      </LocalizedLink>
      {session && <UserCredits />}
      {isPending ? (
        <div className="text-sm text-gray-400">{t('loading')}</div>
      ) : session ? (
        <>
          <LocalizedLink
            href="/dashboard"
            className="btn-firecrawl-blue inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-8 px-3"
          >
            {t('dashboard')}
          </LocalizedLink>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-firecrawl-default inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 h-8 px-3"
          >
            {isLoggingOut ? t('loggingOut') : t('logout')}
          </button>
        </>
      ) : (
        <>
          <LocalizedLink
            href="/login"
            className="bg-black text-white hover:bg-gray-800 inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-8 px-3 shadow-sm hover:shadow-md"
          >
            {t('login')}
          </LocalizedLink>
          <LocalizedLink
            href="/register"
            className="btn-firecrawl-blue inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-8 px-3"
          >
            {t('register')}
          </LocalizedLink>
        </>
      )}
      <LocaleSwitcher locale={locale} />
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <LocalizedLink href="/" className="flex items-center">
            <BrandLogo />
          </LocalizedLink>
          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {links}
          </div>
          {/* Mobile burger */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setOpen((o) => !o)}
              aria-label={t('openMenu')}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-3 flex flex-col space-y-2 z-50">
          {links}
        </div>
      )}
    </nav>
  );
}
