import React from 'react';
import { Sparkles, Heart, ExternalLink } from 'lucide-react';
import { t } from '../utils/i18n';

export default function Footer({ setActiveTab }) {
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      title: t('footer.headingProduct', 'Product'),
      links: [
        { label: t('nav.tryItFree'), tab: 'playground' },
        { label: t('footer.pricing'), tab: 'pricing' },
        { label: t('footer.blog'), tab: 'blog' },
        { label: t('footer.history'), tab: 'history' },
      ]
    },
    {
      title: t('footer.headingLegal', 'Legal'),
      links: [
        { label: t('footer.privacy'), tab: 'privacy' },
        { label: t('footer.terms'), tab: 'terms' },
      ]
    }
  ];

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/glamai_app',
      aria: 'Instagram Profile',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      )
    },
    {
      label: 'X / Twitter',
      href: 'https://x.com/glamai_app',
      aria: 'X Profile',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@glamai_app',
      aria: 'YouTube Channel',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      )
    },
  ];

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid rgba(255, 46, 147, 0.08)',
      padding: '3.5rem 0 2rem',
    }}>
      <div className="container">
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <a
              href="#"
              onClick={e => { e.preventDefault(); setActiveTab('playground'); }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                background: 'var(--gradient-pink-text)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={20} fill="var(--color-pink-primary)" style={{ WebkitTextFillColor: 'initial' }} />
              GlamAI
            </a>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '280px',
              margin: '0 0 1.5rem',
            }}>
              {t('footer.brandDesc', 'Try 100+ hairstyles, makeup looks, and nail art styles on your own photo with AI. Photorealistic results in seconds — free to start.')}
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  aria-label={s.aria}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 46, 147, 0.15)',
                    background: 'rgba(255,46,147,0.04)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-pink-primary)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'var(--color-pink-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,46,147,0.04)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 46, 147, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(col => (
            <div key={col.title}>
              <h4 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.25rem',
              }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <button
                      onClick={() => setActiveTab(link.tab)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-pink-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255, 46, 147, 0.07)', marginBottom: '1.5rem' }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
          className="footer-bottom"
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            {t('footer.copyright').replace('{year}', year)}
            {' '}{t('footer.madeWithPart1', 'Made with')}{' '}<Heart size={12} color="var(--color-pink-primary)" fill="var(--color-pink-primary)" style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}{t('footer.madeWithPart2', 'for your style journey.')}
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button
              onClick={() => setActiveTab('privacy')}
              style={{ background: 'transparent', border: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s ease', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-pink-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {t('footer.privacy')}
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              style={{ background: 'transparent', border: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s ease', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-pink-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {t('footer.terms')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
