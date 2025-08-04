'use client';

import { useState } from "react";
// import { useTranslations } from 'next-intl';
// import LocalizedLink from "@/components/localized-link";
import { Hero } from "@/components/hero";
import { Companies } from "@/components/companies";
import { Features } from "@/components/features";
import { GridFeatures } from "@/components/grid-features";
import { Testimonials } from "@/components/testimonials";
import { Background } from "@/components/background";
import { Container } from "@/components/container";
import { CTA } from "@/components/cta";

export default function Home() {
  // const t = useTranslations('home');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 h-full w-full overflow-hidden ">
        <Background />
      </div>
      <Container className="flex min-h-screen flex-col items-center justify-between ">
        <Hero />
        <Companies />
        <Features />
        <GridFeatures />
        <Testimonials />
      </Container>
      <div className="relative">
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <Background />
        </div>
        <CTA />
      </div>
        {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in-up">
              <span className="block text-zinc-900">{t('hero.title1')}</span>
              <span className="block bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">
                  {t('hero.title2')}
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-zinc-600 max-w-3xl mx-auto mb-6 animate-fade-in-up animation-delay-200">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <LocalizedLink
                href="/brand-monitor"
                className="btn-firecrawl-blue inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-medium transition-all duration-200 h-12 px-8"
              >
                {t('hero.cta.analyze')}
              </LocalizedLink>
              <LocalizedLink
                href="/plans"
                className="btn-firecrawl-default inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-medium transition-all duration-200 h-12 px-8"
              >
                {t('hero.cta.pricing')}
              </LocalizedLink>
            </div>
            <p className="mt-6 text-sm text-zinc-500 animate-fade-in-up animation-delay-600">
              {t('hero.powered')}
            </p>
          </div> */}

          {/* Stats */}
          {/*  <div className="mt-20 bg-zinc-900 rounded-[20px] p-12 animate-fade-in-scale animation-delay-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center animate-fade-in-up animation-delay-1000">
                <div className="text-4xl font-bold text-white">{t('stats.chatgpt')}</div>
                <div className="text-sm text-zinc-400 mt-1">{t('stats.providers')}</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-1000" style={{animationDelay: '1100ms'}}>
                <div className="text-4xl font-bold text-white">{t('stats.realtime')}</div>
                <div className="text-sm text-zinc-400 mt-1">{t('stats.realtime_detail')}</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-1000" style={{animationDelay: '1200ms'}}>
                <div className="text-4xl font-bold text-white">{t('stats.competitor')}</div>
                <div className="text-sm text-zinc-400 mt-1">{t('stats.competitor_detail')}</div>
              </div>
              <div className="text-center animate-fade-in-up animation-delay-1000" style={{animationDelay: '1300ms'}}>
                <div className="text-4xl font-bold text-white">{t('stats.actionable')}</div>
                <div className="text-sm text-zinc-400 mt-1">{t('stats.actionable_detail')}</div>
              </div>
            </div>
          </div>
        </div> 
      </section> */} 

      {/* Pricing Section */}
      {/* <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-[30px] p-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 mb-4">
                {t('pricing.title')}
              </h2>
              <p className="text-xl text-zinc-600">
                {t('pricing.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"> */}
              {/* Starter */}
              {/* <div className="bg-white p-8 rounded-[20px] border border-zinc-200 animate-fade-in-up animation-delay-400 hover:scale-105 transition-all duration-200">
                <h3 className="text-2xl font-bold mb-2">{t('pricing.starter.label')}</h3>
                <p className="text-zinc-600 mb-6">{t('pricing.starter.desc')}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{t('pricing.starter.price')}</span>
                  <span className="text-zinc-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.starter.analyses')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.starter.providers')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.starter.reports')}
                  </li>
                </ul>
                <LocalizedLink
                  href="/register"
                  className="btn-firecrawl-outline w-full inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-10 px-4"
                >
                  {t('pricing.starter.cta')}
                </LocalizedLink>
              </div> */}

              {/* Pro - Featured */}
              {/* <div className="bg-white p-8 rounded-[20px] border-2 border-blue-500 relative animate-fade-in-up animation-delay-600 hover:scale-105 transition-all duration-200">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t('pricing.pro.popular')}
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('pricing.pro.label')}</h3>
                <p className="text-zinc-600 mb-6">{t('pricing.pro.desc')}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{t('pricing.pro.price')}</span>
                  <span className="text-zinc-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.pro.analyses')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.pro.providers')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.pro.alerts')}
                  </li>
                </ul>
                <LocalizedLink
                  href="/register"
                  className="btn-firecrawl-blue w-full inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-10 px-4"
                >
                  {t('pricing.pro.cta')}
                </LocalizedLink>
              </div> */}

              {/* Enterprise */}
              {/* <div className="bg-white p-8 rounded-[20px] border border-zinc-200 animate-fade-in-up animation-delay-800 hover:scale-105 transition-all duration-200">
                <h3 className="text-2xl font-bold mb-2">{t('pricing.enterprise.label')}</h3>
                <p className="text-zinc-600 mb-6">{t('pricing.enterprise.desc')}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{t('pricing.enterprise.price')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.enterprise.multiple')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.enterprise.api')}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('pricing.enterprise.whitelabel')}
                  </li>
                </ul>
                <LocalizedLink
                  href="/contact"
                  className="btn-firecrawl-outline w-full inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 h-10 px-4"
                >
                  {t('pricing.enterprise.cta')}
                </LocalizedLink>
              </div>
            </div>
            <div className="text-center mt-12">
              <LocalizedLink href="/plans" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('pricing.link_detail')}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section 1 */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[30px] p-16 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('cta.subtitle')}
            </p>
            <LocalizedLink
              href="/brand-monitor"
              className="btn-firecrawl-default inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-base font-medium transition-all duration-200 h-12 px-8"
            >
              {t('cta.analyze')}
            </LocalizedLink>
          </div>
        </div>
      </section> */}

      {/* FAQs */}
      {/* <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-900 mb-4 animate-fade-in-up">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-zinc-600 animate-fade-in-up animation-delay-200">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <div
                key={n}
                className={`bg-gray-50 rounded-[15px] overflow-hidden animate-fade-in-up animation-delay-${400 + i * 100}`}
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {t(`faq.${n}.q`)}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-zinc-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 py-6">
                    <p className="text-zinc-600 leading-relaxed">
                      {t(`faq.${n}.a`)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Final CTA */}
      {/* <section className="py-24 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('finalcta.title')}
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            {t('finalcta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedLink
              href="/brand-monitor"
              className="btn-firecrawl-blue inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-base font-medium transition-all duration-200 h-12 px-8"
            >
              {t('finalcta.analyze')}
            </LocalizedLink>
            <LocalizedLink
              href="/plans"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-base font-medium transition-all duration-200 h-12 px-8 bg-zinc-800 text-white hover:bg-zinc-700"
            >
              {t('finalcta.pricing')}
            </LocalizedLink>
          </div>
        </div>
      </section> */}
    </div>
  );
}
