'use client';

import { usePathname, useRouter } from 'next/navigation';

const locales = [
  { code: 'en', label: '🇬🇧' },
  { code: 'fr', label: '🇫🇷' },
];

export default function LocaleToggle({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = (nextLocale: string) => {
    if (nextLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    const nextPath = segments.join('/') || '/';
    router.replace(nextPath);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1 self-start">
      {locales.map((opt) => (
        <button
          key={opt.code}
          onClick={() => handleToggle(opt.code)}
          className={`px-2 py-1 rounded-full text-base transition-all
            ${opt.code === locale
              ? 'bg-white shadow font-semibold'
              : 'text-gray-500 hover:bg-gray-200'}
          `}
          disabled={opt.code === locale}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
