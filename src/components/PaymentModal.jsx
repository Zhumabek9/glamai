import t from '../utils/i18n';
import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import { authFetch } from '../apiClient';

export default function PaymentModal({ plan, allowMockPayment = true, onClose, onPaymentSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getDisplayPrice = () => {
    if (plan.billingPeriod === 'yearly') {
      const numericPrice = parseFloat(plan.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericPrice)) {
        return `$${(numericPrice * 12).toFixed(2)}`;
      }
    }
    return plan.price;
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Group by 4
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  // Format Expiration Date (adds slash after month)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(formatted);
  };

  // Format CVC (max 3-4 digits)
  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvc(value);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Quick validations
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError(t('payment.error.cardNumber'));
      return;
    }

    if (expiry.length < 5) {
      setError(t('payment.error.expiry'));
      return;
    }

    if (cvc.length < 3) {
      setError(t('payment.error.cvc'));
      return;
    }

    if (!cardHolder.trim()) {
      setError(t('payment.error.cardholder'));
      return;
    }

    // Run checkout simulation
    setIsProcessing(true);

    authFetch('/api/checkout/mock-success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        packId: plan.id,
        credits: plan.tokens
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || t('payment.error.server'));
      }
      return res.json();
    })
    .then((data) => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Pass updated total credits back to Parent App
      setTimeout(() => {
        onPaymentSuccess(data.credits);
        onClose();
      }, 2000);
    })
    .catch((err) => {
      setIsProcessing(false);
      setError(err.message || t('payment.error.generic'));
    });
  };

  // Guess card brand based on first digit
  const getCardBrand = () => {
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'VISA';
    if (cleanNum.startsWith('5')) return 'MASTERCARD';
    if (cleanNum.startsWith('3')) return 'AMEX';
    return 'CARD';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} disabled={isProcessing}>
          <X size={20} />
        </button>

        {!isSuccess ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('audit.paymentmodal.secureCheckout')}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {t('payment.purchaseDesc', { planName: plan.name, tokens: plan.tokens, price: getDisplayPrice(), period: plan.billingPeriod === 'yearly' ? t('payment.billedAnnually') : '' })}
              </p>
            </div>

            {!allowMockPayment ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.15)', borderRadius: '16px', marginBottom: '1rem' }}>
                <p style={{ color: '#ff453a', fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem' }}>
                  {t('payment.stripeUnavailable')}
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {t('payment.stripeUnavailableDesc')}
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div 
                    style={{ 
                      background: 'rgba(255, 59, 48, 0.1)', 
                      border: '1px solid rgba(255, 59, 48, 0.2)', 
                      color: '#ff453a', 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      marginBottom: '1.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Virtual Card Graphic Preview */}
                <div className="checkout-card-preview">
                  <div className="card-logo">
                    <CreditCard size={28} style={{ opacity: 0.8 }} />
                    <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>{getCardBrand()}</span>
                  </div>
                  <div className="card-chip"></div>
                  <div className="card-number-display">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="card-details-row">
                    <div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>{t('audit.paymentmodal.cardholder')}</div>
                      <div className="card-holder-name">{cardHolder || t('payment.placeholderName')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>{t('audit.paymentmodal.expires')}</div>
                      <div className="card-expiry-display">{expiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-group">
                    <label className="form-label">{t('audit.paymentmodal.cardholderName')}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={t('audit.paymentmodal.johnDoe')}
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      disabled={isProcessing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('audit.paymentmodal.cardNumber')}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={isProcessing}
                      required
                    />
                  </div>

                  <div className="payment-form-row">
                    <div className="form-group">
                      <label className="form-label">{t('audit.paymentmodal.expirationDate')}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={t('audit.paymentmodal.mmyy')}
                        value={expiry}
                        onChange={handleExpiryChange}
                        disabled={isProcessing}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('audit.paymentmodal.cvcCvv')}</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="•••"
                        value={cvc}
                        onChange={handleCvcChange}
                        disabled={isProcessing}
                        required
                      />
                    </div>
                  </div>

                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)',
                      margin: '1rem 0 1.5rem' 
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: '#2eff93' }} />
                    <span>{t('audit.paymentmodal.sslEncrypted256bitSecureGatewa')}</span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.9rem' }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div 
                          style={{ 
                            width: '18px', 
                            height: '18px', 
                            border: '2px solid rgba(255, 255, 255, 0.3)', 
                            borderTopColor: '#fff', 
                            borderRadius: '50%', 
                            animation: 'spin 0.6s linear infinite' 
                          }} 
                        />
                        <span>{t('audit.paymentmodal.processingPayment')}</span>
                      </>
                    ) : (
                      <span>{t('payment.pay', { price: getDisplayPrice() })}</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          /* Payment success screen */
          <div className="payment-success animate-fade-in">
            <div className="success-icon-wrapper">
              <CheckCircle size={36} />
            </div>
            <h2>{t('audit.paymentmodal.paymentSuccessful')}</h2>
            <p>
              {t('payment.successDesc', { tokens: plan.tokens })}
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('payment.redirecting')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
