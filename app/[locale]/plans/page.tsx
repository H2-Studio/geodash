'use client';

import PricingTable from '@/components/autumn/pricing-table';
import StaticPricingTable from '@/components/static-pricing-table';
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';

export default function PricingPage() {
  const { data: session } = useSession();
  const t = useTranslations('home.pricing');

  // Map les produits statiques avec les traductions
  const staticProducts = [
    {
      id: "free",
      name: t('plans.free.name'),
      description: t('plans.free.desc'),
      price: {
        primaryText: t('plans.free.priceMain'),
        secondaryText: t('plans.free.priceSub')
      },
      items: t.raw('plans.free.items'),
    },
    {
      id: "pro",
      name: t('plans.pro.name'),
      description: t('plans.pro.desc'),
      recommendText: t('plans.pro.recommend'),
      price: {
        primaryText: t('plans.pro.priceMain'),
        secondaryText: t('plans.pro.priceSub')
      },
      items: t.raw('plans.pro.items'),
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-[3rem] lg:text-[4.5rem] font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-tr from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          {session && (
            <p className="text-sm text-zinc-500 mt-4">
              {t('loggedInAs', { email: session.user?.email })}
            </p>
          )}
        </div>

        <div className="bg-white rounded-[20px] shadow-xl p-8 border border-zinc-200">
          {session ? (
            <PricingTable />
          ) : (
            <StaticPricingTable products={staticProducts} />
          )}
        </div>
      </div>
    </div>
  );
}
