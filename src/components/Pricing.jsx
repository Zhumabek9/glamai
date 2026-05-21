import React, { useState } from 'react';
import { Check, Coins, ShieldCheck, Sparkles, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { t } from '../utils/i18n';

const PLANS = {
  monthly: [
    {
      id: "lite-monthly",
      name: "Lite",
      badge: "Best Starter",
      price: "$9.90",
      originalPrice: "$19.90",
      savePercent: 50,
      tokens: 200,
      generations: 20,
      billingPeriod: "monthly",
      features: [
        "pricing.feat.liteGens",
        "pricing.feat.liteCredits",
        "pricing.feat.styles100",
        "pricing.feat.highQuality",
        "pricing.feat.colorChoices",
        "pricing.feat.instantDownload"
      ],
      highlighted: false
    },
    {
      id: "pro-monthly",
      name: "Pro",
      badge: "Most Popular",
      price: "$19.60",
      originalPrice: "$39.90",
      savePercent: 51,
      tokens: 3000,
      generations: 300,
      billingPeriod: "monthly",
      features: [
        "pricing.feat.proGens",
        "pricing.feat.proCredits",
        "pricing.feat.styles100",
        "pricing.feat.highestPriority",
        "pricing.feat.advancedTexture",
        "pricing.feat.vipSupport",
        "pricing.feat.proGrade"
      ],
      highlighted: true
    }
  ],
  yearly: [
    {
      id: "lite-yearly",
      name: "Lite",
      badge: "Best Starter",
      price: "$4.50",
      originalPrice: "$9.90",
      savePercent: 55,
      tokens: 200,
      generations: 20,
      billingPeriod: "yearly",
      features: [
        "pricing.feat.liteGens",
        "pricing.feat.liteCredits",
        "pricing.feat.styles100",
        "pricing.feat.highQuality",
        "pricing.feat.colorChoices",
        "pricing.feat.instantDownload"
      ],
      highlighted: false
    },
    {
      id: "pro-yearly",
      name: "Pro",
      badge: "Most Popular",
      price: "$7.50",
      originalPrice: "$19.60",
      savePercent: 62,
      tokens: 3000,
      generations: 300,
      billingPeriod: "yearly",
      features: [
        "pricing.feat.proGens",
        "pricing.feat.proCredits",
        "pricing.feat.styles100",
        "pricing.feat.highestPriority",
        "pricing.feat.advancedTexture",
        "pricing.feat.vipSupport",
        "pricing.feat.proGrade"
      ],
      highlighted: true
    }
  ],
  "one-time": [
    {
      id: "lite-onetime",
      name: "Lite",
      badge: null,
      price: "$14.50",
      originalPrice: null,
      savePercent: null,
      tokens: 200,
      generations: 20,
      billingPeriod: "one-time",
      features: [
        "pricing.feat.liteGensOT",
        "pricing.feat.liteCreditsOT",
        "pricing.feat.styles100",
        "pricing.feat.highQuality",
        "pricing.feat.instantDownload",
        "pricing.feat.neverExpire"
      ],
      highlighted: false
    },
    {
      id: "pro-onetime",
      name: "Pro",
      badge: "Best Value",
      price: "$28.50",
      originalPrice: "$57.00",
      savePercent: 50,
      tokens: 3000,
      generations: 300,
      billingPeriod: "one-time",
      features: [
        "pricing.feat.proGensOT",
        "pricing.feat.proCreditsOT",
        "pricing.feat.styles100",
        "pricing.feat.prioritySpeed",
        "pricing.feat.advancedTexture",
        "pricing.feat.proGrade",
        "pricing.feat.neverExpire"
      ],
      highlighted: true
    },
    {
      id: "ultra-onetime",
      name: "Ultra",
      badge: null,
      price: "$40.00",
      originalPrice: "$80.00",
      savePercent: 50,
      tokens: 6000,
      generations: 600,
      billingPeriod: "one-time",
      features: [
        "pricing.feat.ultraGensOT",
        "pricing.feat.ultraCreditsOT",
        "pricing.feat.stylesAllColors",
        "pricing.feat.highestPriority",
        "pricing.feat.vipSupport",
        "pricing.feat.bestValue",
        "pricing.feat.proGrade",
        "pricing.feat.neverExpire"
      ],
      highlighted: false
    }
  ]
};

export default function Pricing({ user, onSelectPlan, onOpenAuth }) {
  const [billingPeriod, setBillingPeriod] = useState('one-time');
  const [openFaq, setOpenFaq] = useState(null);

  const handleBuyClick = (plan) => {
    if (!user) {
      onOpenAuth();
    } else {
      onSelectPlan(plan);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const activePlans = PLANS[billingPeriod];

  return (
    <div style={{ background: 'var(--color-bg-light)', padding: '5rem 0 6rem' }}>
      <section className="pricing-section container animate-fade-in" style={{ padding: '0' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', tracking: '0.1em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem' }}>
          {t('pricing.title')}
        </p>
        <h1 className="pricing-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          {t('pricing.chooseYourPlan')}
        </h1>
        <p className="pricing-subtitle" style={{ maxWidth: '600px', margin: '0 auto 2.5rem', color: 'var(--text-secondary)' }}>
          {t('pricing.subtitle')}
        </p>

        {/* Free trial promo badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 46, 147, 0.08)', border: '1px solid rgba(255, 46, 147, 0.15)', borderRadius: '100px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', color: 'var(--color-pink-primary)', marginBottom: '3rem', fontWeight: 500 }}>
          <Sparkles size={14} />
          <span>
            {t('pricing.freeTrial')}{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); if(!user) onOpenAuth(); }} style={{ textDecoration: 'underline', fontWeight: 700, color: 'var(--color-pink-primary)' }}>
              {t('pricing.tryFree')} &rarr;
            </a>
          </span>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 46, 147, 0.1)', padding: '0.25rem', borderRadius: '100px', boxShadow: '0 4px 15px rgba(255, 46, 147, 0.02)' }}>
            <button 
              onClick={() => setBillingPeriod('monthly')}
              className={`btn`}
              style={{
                borderRadius: '100px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: billingPeriod === 'monthly' ? 'var(--gradient-pink-purple)' : 'transparent',
                color: billingPeriod === 'monthly' ? '#fff' : 'var(--text-secondary)',
                boxShadow: billingPeriod === 'monthly' ? '0 4px 12px var(--color-pink-glow)' : 'none',
                border: 'none'
              }}
            >
              {t('pricing.monthly')}
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              className={`btn`}
              style={{
                borderRadius: '100px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: billingPeriod === 'yearly' ? 'var(--gradient-pink-purple)' : 'transparent',
                color: billingPeriod === 'yearly' ? '#fff' : 'var(--text-secondary)',
                boxShadow: billingPeriod === 'yearly' ? '0 4px 12px var(--color-pink-glow)' : 'none',
                border: 'none'
              }}
            >
              <span>{t('pricing.yearly')}</span>
              <span style={{ fontSize: '0.7rem', background: billingPeriod === 'yearly' ? 'rgba(255,255,255,0.25)' : 'rgba(255,46,147,0.1)', color: billingPeriod === 'yearly' ? '#fff' : 'var(--color-pink-primary)', padding: '0.1rem 0.35rem', borderRadius: '100px' }}>-55%</span>
            </button>
            <button 
              onClick={() => setBillingPeriod('one-time')}
              className={`btn`}
              style={{
                borderRadius: '100px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: billingPeriod === 'one-time' ? 'var(--gradient-pink-purple)' : 'transparent',
                color: billingPeriod === 'one-time' ? '#fff' : 'var(--text-secondary)',
                boxShadow: billingPeriod === 'one-time' ? '0 4px 12px var(--color-pink-glow)' : 'none',
                border: 'none'
              }}
            >
              <span>{t('pricing.oneTime')}</span>
              <span style={{ fontSize: '0.7rem', background: billingPeriod === 'one-time' ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.1)', color: billingPeriod === 'one-time' ? '#fff' : '#10b981', padding: '0.1rem 0.35rem', borderRadius: '100px' }}>&infin;</span>
            </button>
          </div>
        </div>

        {/* Never expires notice for one-time */}
        {billingPeriod === 'one-time' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2.5rem' }}>
            <ShieldCheck size={16} />
            <span>{t('pricing.neverExpires')}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="pricing-grid" style={{ maxWidth: '1024px', display: 'grid', gridTemplateColumns: activePlans.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '2rem', marginBottom: '6rem' }}>
          {activePlans.map((plan) => (
            <div 
              key={plan.id}
              className={`pricing-card glass-panel ${plan.highlighted ? 'featured' : ''}`}
              style={{
                padding: '3rem 2rem 2.5rem',
                borderRadius: '24px',
                border: plan.highlighted ? '2px solid var(--color-pink-primary)' : '1px solid rgba(255, 46, 147, 0.08)',
                boxShadow: plan.highlighted ? '0 12px 40px rgba(255, 46, 147, 0.08)' : '0 4px 20px rgba(0,0,0,0.01)',
                background: plan.highlighted ? 'linear-gradient(180deg, rgba(255, 46, 147, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%)' : '#ffffff'
              }}
            >
              {plan.badge && (
                <div className="featured-badge" style={{ top: '-14px', background: plan.highlighted ? 'var(--gradient-pink-purple)' : 'rgba(255, 46, 147, 0.1)', color: plan.highlighted ? '#fff' : 'var(--color-pink-primary)', boxShadow: plan.highlighted ? '0 4px 10px var(--color-pink-glow)' : 'none', padding: '0.35rem 1rem' }}>
                  {plan.badge}
                </div>
              )}

              <span className="tier-name" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {plan.name}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem', margin: '0.75rem 0 0.5rem' }}>
                <span className="tier-price" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {billingPeriod === 'monthly' || billingPeriod === 'yearly' ? t('pricing.perMonth') : ` / ${t('pricing.oneTimePayment')}`}
                </span>
              </div>

              {plan.originalPrice && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{plan.originalPrice}</span>
                  {plan.savePercent && (
                    <span style={{ color: '#10b981', fontWeight: 700 }}>
                      {t('pricing.save', { percent: plan.savePercent })}
                    </span>
                  )}
                </div>
              )}

              {billingPeriod === 'yearly' && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                  {t('pricing.billedAnnually')}
                </p>
              )}

              {/* Credits Callout Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: plan.highlighted ? 'rgba(255, 46, 147, 0.05)' : 'rgba(0,0,0,0.02)', padding: '0.75rem 1.25rem', borderRadius: '12px', width: '100%', marginBottom: '2rem' }}>
                <Coins size={18} color="var(--color-pink-primary)" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {plan.tokens} {t('nav.credits')}{' '}
                    {billingPeriod !== 'one-time' && (
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>/{t('pricing.month')}</span>
                    )}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    = {plan.generations} {t('pricing.aiGenerations')}
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="tier-features" style={{ margin: '0 0 2.5rem', width: '100%' }}>
                {plan.features.map((featKey, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Check size={14} color="var(--color-pink-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ textAlign: 'left' }}>{t(featKey)}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleBuyClick(plan)}
                style={{ width: '100%', padding: '0.8rem 0' }}
              >
                {t('pricing.getStarted')}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Badges section */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid rgba(255, 46, 147, 0.08)', padding: '3.5rem 2rem 3rem', marginBottom: '6rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3rem' }}>
            {t('pricing.trustTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255, 46, 147, 0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--color-pink-primary)' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t('pricing.trustSecure')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('pricing.trustSecureDesc')}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255, 46, 147, 0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--color-pink-primary)' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t('pricing.trustInstant')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('pricing.trustInstantDesc')}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255, 46, 147, 0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--color-pink-primary)' }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t('pricing.trustGuarantee')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('pricing.trustGuaranteeDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
            {t('pricing.faq.title')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[1, 2, 3, 4, 5].map((index) => {
              const qKey = `pricing.faq.q${index}`;
              const aKey = `pricing.faq.a${index}`;
              const isOpened = openFaq === index;

              return (
                <div 
                  key={index}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(255, 46, 147, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={16} color="var(--color-pink-primary)" style={{ flexShrink: 0 }} />
                      {t(qKey)}
                    </span>
                    {isOpened ? (
                      <ChevronUp size={18} color="var(--text-muted)" />
                    ) : (
                      <ChevronDown size={18} color="var(--text-muted)" />
                    )}
                  </button>

                  {isOpened && (
                    <div style={{ padding: '0 1.5rem 1.25rem 2.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid rgba(0,0,0,0.02)' }}>
                      {t(aKey)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
