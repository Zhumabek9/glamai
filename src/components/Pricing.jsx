import React, { useState, useEffect } from 'react';
import { Check, Coins, ShieldCheck, Sparkles, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { t } from '../utils/i18n';
import { trackEvent } from '../utils/analytics';

const PLANS = {
  subscription: [
    {
      id: "weekly-vip",
      name: "Weekly",
      badge: "Flexible",
      price: "$7.99",
      billingPeriod: "week",
      tokens: 500,
      generations: "50 generations/week",
      features: [
        "pricing.hdExport",
        "pricing.fastSpeed",
        "pricing.allStyles",
        "pricing.adFree"
      ],
      highlighted: false
    },
    {
      id: "monthly-vip",
      name: "Monthly",
      badge: "Most Popular",
      price: "$19.99",
      billingPeriod: "month",
      tokens: 2000,
      generations: "200 generations/month",
      features: [
        "pricing.hdExport",
        "pricing.fastSpeed",
        "pricing.allStyles",
        "pricing.adFree",
        "pricing.feat.vipSupport"
      ],
      highlighted: true
    },
    {
      id: "yearly-vip",
      name: "Yearly",
      badge: "Best Value (Save ~40%)",
      price: "$149.99",
      billingPeriod: "year",
      tokens: 24000,
      generations: "24,000 credits/year (2000 monthly)",
      features: [
        "pricing.hdExport",
        "pricing.fastSpeed",
        "pricing.allStyles",
        "pricing.adFree",
        "pricing.feat.vipSupport"
      ],
      highlighted: false
    }
  ],
  "one-time": [
    {
      id: "mini-pack",
      name: "Mini Pack",
      badge: null,
      price: "$4.99",
      tokens: 100,
      generations: "10 generations",
      billingPeriod: "one-time",
      features: [
        "pricing.feat.styles100",
        "pricing.feat.highQuality",
        "pricing.feat.instantDownload",
        "pricing.feat.neverExpire"
      ],
      highlighted: false
    },
    {
      id: "standart-pack",
      name: "Standart Pack",
      badge: "Popular",
      price: "$9.99",
      tokens: 300,
      generations: "30 generations",
      billingPeriod: "one-time",
      features: [
        "pricing.feat.styles100",
        "pricing.feat.highQuality",
        "pricing.feat.instantDownload",
        "pricing.feat.neverExpire"
      ],
      highlighted: true
    },
    {
      id: "max-pack",
      name: "Max Pack",
      badge: "Best Deal",
      price: "$19.99",
      tokens: 1000,
      generations: "100 generations",
      billingPeriod: "one-time",
      features: [
        "pricing.feat.styles100",
        "pricing.feat.prioritySpeed",
        "pricing.feat.advancedTexture",
        "pricing.feat.proGrade",
        "pricing.feat.neverExpire"
      ],
      highlighted: false
    }
  ]
};



export default function Pricing({ user, onSelectPlan, onOpenAuth }) {
  const [billingPeriod, setBillingPeriod] = useState('subscription');
  const [openFaq, setOpenFaq] = useState(null);
  const monthlyPlan = PLANS.subscription.find((p) => p.id === 'monthly-vip');
  const [recommendedPlanId, setRecommendedPlanId] = useState(null);


  const handleBuyClick = (plan) => {
    trackEvent('upgrade_start', {
      source: 'pricing_cta',
      planId: plan.id,
      billingPeriod: plan.billingPeriod,
      recommended: recommendedPlanId === plan.id,
      isGuest: !user,
    });
    if (!user) {
      onOpenAuth();
    } else {
      onSelectPlan(plan);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const parsePrice = (price) => Number(String(price).replace(/[^0-9.]/g, '')) || 0;
  const getEquivalentMonthly = (plan) => {
    const price = parsePrice(plan.price);
    if (plan.billingPeriod === 'year') return (price / 12).toFixed(2);
    if (plan.billingPeriod === 'week') return (price * 4).toFixed(2);
    return price.toFixed(2);
  };
  const getSavingsVsMonthly = (plan) => {
    if (plan.billingPeriod !== 'year' || !monthlyPlan) return null;
    const yearlyPrice = parsePrice(plan.price);
    const monthlyYearCost = parsePrice(monthlyPlan.price) * 12;
    const saved = Math.max(0, monthlyYearCost - yearlyPrice);
    return Math.round(saved);
  };

  const activePlans = PLANS[billingPeriod];

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const fromSession = window.localStorage.getItem('glamai_recommended_plan');
    if (fromSession) {
      setRecommendedPlanId(fromSession);
      return;
    }
    const credits = user?.tokens ?? 0;
    if (credits <= 30) setRecommendedPlanId('standart-pack');
    else setRecommendedPlanId('monthly-vip');
  }, [user]);


  return (
    <div style={{ background: 'var(--bg-primary)', padding: '5rem 0 6rem' }}>
      <section className="pricing-section container animate-fade-in" style={{ padding: '0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: 'rgba(255, 46, 147, 0.08)', border: '1px solid rgba(255, 46, 147, 0.15)', color: 'var(--color-pink-primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          <Star size={12} style={{ marginRight: '0.4rem', fill: 'currentColor' }} />
          <span>{t('audit.pricing.premiumBeautyClub')}</span>
        </div>
        
        <h1 className="pricing-title" style={{ fontSize: isMobile ? '2.25rem' : '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          {t('pricing.chooseYourPlan')}
        </h1>
        <p className="pricing-subtitle" style={{ maxWidth: '600px', margin: '0 auto 3rem', color: 'var(--text-secondary)' }}>
          {t('pricing.subtitle')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span style={{ background: 'rgba(255,46,147,0.08)', border: '1px solid rgba(255,46,147,0.15)', borderRadius: '9999px', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-pink-primary)' }}>{t('audit.pricing.cancelAnytime')}</span>
          <span style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '9999px', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>{t('audit.pricing.noHiddenFees')}</span>
          <span style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '9999px', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>{t('audit.pricing.instantAccessAfterPayment')}</span>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 46, 147, 0.12)', padding: '0.25rem', borderRadius: '100px', boxShadow: 'var(--glass-shadow)' }}>
            <button 
              onClick={() => setBillingPeriod('subscription')}
              className={`btn`}
              style={{
                borderRadius: '100px',
                padding: '0.6rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: billingPeriod === 'subscription' ? 'var(--gradient-pink-purple)' : 'transparent',
                color: billingPeriod === 'subscription' ? '#fff' : 'var(--text-secondary)',
                boxShadow: billingPeriod === 'subscription' ? '0 4px 12px var(--color-pink-glow)' : 'none',
                border: 'none'
              }}
            >
              VIP Subscriptions

            </button>
            <button 
              onClick={() => setBillingPeriod('one-time')}
              className={`btn`}
              style={{
                borderRadius: '100px',
                padding: '0.6rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: billingPeriod === 'one-time' ? 'var(--gradient-pink-purple)' : 'transparent',
                color: billingPeriod === 'one-time' ? '#fff' : 'var(--text-secondary)',
                boxShadow: billingPeriod === 'one-time' ? '0 4px 12px var(--color-pink-glow)' : 'none',
                border: 'none'
              }}
            >
              Credit Packs
            </button>
          </div>
        </div>

        {/* Never expires notice for one-time */}
        {billingPeriod === 'one-time' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            <ShieldCheck size={18} />
            <span>{t('pricing.neverExpires')}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div
          className="pricing-grid"
          style={isMobile ? {
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            gap: '1rem',
            padding: '0.5rem 1.25rem 1.5rem',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            marginBottom: '3rem',
          } : {
            maxWidth: '1080px',
            margin: '0 auto 6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
          }}
        >
          {activePlans.map((plan) => {
            const isRecommended = recommendedPlanId === plan.id;
            return (
            <div 
              key={plan.id}
              className={`pricing-card glass-panel ${plan.highlighted ? 'featured' : ''}`}
              style={{
                padding: isMobile ? '2.5rem 1.5rem 2rem' : '3.5rem 2.25rem 3rem',
                borderRadius: '24px',
                position: 'relative',
                border: isRecommended ? '2px solid #10b981' : (plan.highlighted ? '2px solid var(--color-pink-primary)' : '1px solid rgba(255, 46, 147, 0.12)'),
                boxShadow: isRecommended ? '0 16px 40px rgba(16,185,129,0.16)' : (plan.highlighted ? '0 16px 40px rgba(255, 46, 147, 0.12)' : 'var(--glass-shadow)'),
                background: plan.highlighted ? 'linear-gradient(180deg, rgba(255, 46, 147, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%)' : 'rgba(255, 255, 255, 0.8)',
                ...(isMobile ? {
                  flex: '0 0 85vw',
                  maxWidth: '320px',
                  scrollSnapAlign: 'center',
                } : {})
              }}
            >
              {isRecommended && (
                <div style={{ position: 'absolute', top: '-14px', right: '14px', background: '#10b981', color: '#fff', padding: '0.3rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Recommended
                </div>
              )}
              {plan.badge && (
                <div className="featured-badge" style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: plan.highlighted ? 'var(--gradient-pink-purple)' : 'rgba(255, 46, 147, 0.12)', color: plan.highlighted ? '#fff' : 'var(--color-pink-primary)', boxShadow: plan.highlighted ? '0 4px 10px var(--color-pink-glow)' : 'none', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {plan.badge}
                </div>
              )}

              <span className="tier-name" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {plan.name}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.2rem', margin: '1rem 0 1.5rem' }}>
                <span className="tier-price" style={{ fontSize: '3.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {plan.billingPeriod === 'one-time' ? '' : `/${plan.billingPeriod}`}
                </span>
              </div>
              {plan.billingPeriod !== 'one-time' && (
                <p style={{ margin: '-0.75rem 0 1.2rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {plan.id === 'weekly-vip' ? 'Equals ~$7.99/weekly' : 
                   plan.id === 'monthly-vip' ? 'Equals ~$19.99/monthly' : 
                   plan.id === 'yearly-vip' ? 'Equals ~$149.99/yearly' : 
                   `Equals ~${plan.price}/${plan.billingPeriod}`}
                  {plan.id === 'yearly-vip' && ' (approx. ~$12.50/month)'}
                </p>
              )}


              {/* Credits Callout Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: plan.highlighted ? 'rgba(255, 46, 147, 0.06)' : 'rgba(0,0,0,0.02)', padding: '0.85rem 1.25rem', borderRadius: '16px', width: '100%', marginBottom: '2.25rem' }}>
                <Coins size={20} color="var(--color-pink-primary)" />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {plan.tokens} {billingPeriod === 'subscription' ? 'VIP Access' : 'Credits'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {plan.generations}
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="tier-features" style={{ margin: '0 0 2.5rem', width: '100%', listStyle: 'none', padding: 0 }}>
                {plan.features.map((featKey, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <Check size={16} color="var(--color-pink-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ textAlign: 'left' }}>{t(featKey)}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  if (isRecommended) {
                    trackEvent('recommended_plan_click', {
                      source: 'pricing_recommended_card',
                      planId: plan.id,
                      billingPeriod: plan.billingPeriod,
                    });
                  }
                  handleBuyClick(plan);
                }}
                style={{ width: '100%', padding: '0.9rem 0' }}
              >
                {isRecommended ? 'Start with this plan' : t('pricing.getStarted')}
              </button>
              <p style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Secure checkout. Start in under 30 seconds.
              </p>
            </div>
          )})}
        </div>

        {/* Feature Comparison Table */}
        <div style={{ maxWidth: '800px', margin: '0 auto 6rem', background: 'rgba(255,255,255,0.7)', borderRadius: '24px', border: '1px solid rgba(255, 46, 147, 0.1)', padding: isMobile ? '2rem 1rem' : '3.5rem 2.5rem', boxShadow: 'var(--glass-shadow)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem' }}>
            VIP vs Free Plan
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 46, 147, 0.15)' }}>
                  <th style={{ padding: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('audit.pricing.feature')}</th>
                  <th style={{ padding: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>{t('audit.pricing.freePlan')}</th>
                  <th style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-pink-primary)' }}>{t('audit.pricing.vipPremium')}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.hairstyleGenerations')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.limited10Creditsgen')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.upTo2000Creditsmo')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.makeupNailsStudio')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.lockedRequiresVip')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.fullyUnlocked')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.imageQuality')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.standardSd')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.ultraHd4kSupported')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.watermark')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.yesGlamaiBranding')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.noCleanExports')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.aiQueuePriority')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.normalSpeed')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.3xFasterInstantRender')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{t('audit.pricing.ads')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('audit.pricing.supportedByAds')}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>{t('audit.pricing.100Adfree')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'left', lineHeight: '1.4' }}>
            * Billed weekly, monthly or yearly according to your subscription tier. One-time credits never expire.
          </p>

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
