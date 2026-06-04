
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService({ setActiveTab }) {
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
            <FileText size={24} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            Terms of Service
          </h1>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Last updated: May 1, 2025
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing or using GlamAI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and others who access or use the Service.`,
          },
          {
            title: '2. Description of Service',
            content: `GlamAI provides an AI-powered virtual hairstyle try-on service. Users can upload photos and use artificial intelligence to preview different hairstyles and hair colors. The Service is provided "as is" and may be updated or changed at any time.`,
          },
          {
            title: '3. User Accounts',
            content: `You may use the Service with a limited free trial without registration. Creating an account requires a valid email address. You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.`,
          },
          {
            title: '4. Acceptable Use',
            content: `You agree not to: upload photos of individuals without their explicit consent, generate content that is illegal, harmful, defamatory, or violates any third-party rights, attempt to reverse-engineer or access the underlying AI models, use the Service for any commercial purpose without prior written consent, or use automated tools to access the Service.`,
          },
          {
            title: '5. Credits and Payments',
            content: `GlamAI operates on a credit-based system. One AI hairstyle generation costs 10 credits. Credits are non-refundable except as provided in our Satisfaction Guarantee. Subscription credits reset monthly. One-time purchase credits never expire. All payments are processed securely through Stripe.`,
          },
          {
            title: '6. Satisfaction Guarantee',
            content: `If you are not satisfied with the Service, contact us within 7 days of your purchase for a full refund. Refunds are processed within 5-10 business days. This guarantee applies to your first purchase only and does not apply to accounts that have violated these Terms.`,
          },
          {
            title: '7. Intellectual Property',
            content: `The Service and its original content, features, and functionality are owned by GlamAI and protected by international copyright, trademark, and other intellectual property laws. Generated images are owned by the user who created them, subject to these Terms.`,
          },
          {
            title: '8. User-Generated Content',
            content: `By uploading photos, you grant GlamAI a limited license to process them for the purpose of providing the Service. You retain ownership of your photos. We do not use your photos for AI training without explicit opt-in consent. You represent that you have the right to upload and use the photos.`,
          },
          {
            title: '9. Disclaimers',
            content: `The AI hairstyle previews are for entertainment and planning purposes only. Results may vary from actual salon results. GlamAI is not responsible for any decisions made based on AI-generated previews. The Service is provided without warranties of any kind, express or implied.`,
          },
          {
            title: '10. Limitation of Liability',
            content: `To the maximum extent permitted by law, GlamAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount paid by you in the 30 days preceding the claim.`,
          },
          {
            title: '11. Changes to Terms',
            content: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or a prominent notice on our website. Continued use of the Service after changes constitutes acceptance of the updated Terms.`,
          },
          {
            title: '12. Contact',
            content: `For questions about these Terms of Service, please contact us at legal@glamai.app. We aim to respond to all inquiries within 3 business days.`,
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
