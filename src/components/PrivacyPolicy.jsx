import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy({ setActiveTab }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => setActiveTab('playground')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '2rem',
            padding: 0,
            fontFamily: 'var(--font-body)',
          }}
        >
          <ArrowLeft size={16} />
          Back to GlamAI
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,46,147,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-pink-primary)',
          }}>
            <ShieldCheck size={24} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            Privacy Policy
          </h1>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Last updated: May 1, 2025
        </p>

        {[
          {
            title: '1. Information We Collect',
            content: `We collect information you provide when creating an account (email address), photos you upload for AI processing, your generated hairstyle images, usage data and analytics, and payment information processed securely through Stripe.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `Your information is used to provide our AI hairstyle generation service, process payments, improve our AI models (only with anonymized data), send service-related emails, and respond to your support requests. We do not sell your personal data to third parties.`,
          },
          {
            title: '3. Photo & Image Data',
            content: `Photos you upload are processed by our AI system and used solely for generating hairstyle previews. Your photos are encrypted in transit and at rest. We do not use your photos to train AI models without explicit consent. You can delete your photo history at any time from the History page. Session cookies required for authentication.`,
          },
          {
            title: '4. Data Storage & Security',
            content: `We use industry-standard 256-bit SSL encryption for all data transmission. Photos are stored temporarily during processing and can be deleted by you at any time. Account data is stored securely on encrypted servers. We implement regular security audits and access controls.`,
          },
          {
            title: '5. Cookies',
            content: `We use essential cookies for authentication and session management, analytics cookies (Google Analytics) to understand usage patterns, and preference cookies to save your language and display settings. You can manage cookie preferences through your browser settings.`,
          },
          {
            title: '6. Third-Party Services',
            content: `We use Stripe for payment processing (see Stripe's Privacy Policy), Google Analytics for usage analytics, and cloud infrastructure providers for secure data storage. These services have their own privacy policies and security practices.`,
          },
          {
            title: '7. Your Rights (GDPR & CCPA Compliant)',
            content: `Under GDPR (European Union General Data Protection Regulation) and CCPA (California Consumer Privacy Act), you have extended rights regarding your personal information. These include the right to access, rectify, or erase your personal data ("Right to be Forgotten"), the right to restrict or object to processing, the right to data portability, and the right to opt-out of the "sale" or "sharing" of your data (we do not sell your data). You can delete your account and clear all stored data directly in the Profile Settings panel, or by contacting us at privacy@glamai.app.`,
          },
          {
            title: '8. Children\'s Privacy',
            content: `GlamAI is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
          },
          {
            title: '9. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our website. Continued use of the service after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '10. Contact Us',
            content: `If you have questions about this Privacy Policy or your personal data, please contact us at privacy@glamai.app. We aim to respond to all privacy inquiries within 48 hours.`,
          },
        ].map((section, idx) => (
          <div key={idx} style={{
            marginBottom: '2rem',
            padding: '1.75rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(255,46,147,0.07)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
            }}>
              {section.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
