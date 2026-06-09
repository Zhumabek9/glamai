import t from '../utils/i18n';
import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useSignIn, useSignUp } from '@clerk/react';

// Map Clerk error arrays to human-readable messages
function clerkError(err) {
  console.error('[Clerk Auth Error]:', err);
  const errors = err?.errors || [];
  if (errors.length > 0) {
    return errors[0].longMessage || errors[0].message;
  }
  return err?.message || 'Authentication failed. Please try again.';
}

export default function AuthModal({ onClose }) {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [activeTab, setActiveTab]               = useState('login');
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [error, setError]                       = useState('');
  const [successMsg, setSuccessMsg]             = useState('');
  const [loading, setLoading]                   = useState(false);
  const [googleLoading, setGoogleLoading]       = useState(false);

  // Email verification (OTP) state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode]       = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPendingVerification(false);
    setVerificationCode('');
  };

  // ── Email / Password ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isSignInLoaded || !isSignUpLoaded) return;
    if (!email || !password) { setError(t('auth.fillAllFields', 'Please fill in all fields.')); return; }
    if (password.length < 8) { setError(t('auth.passwordMinLength', 'Password must be at least 8 characters.')); return; }
    if (activeTab === 'signup' && password !== confirmPassword) {
      setError(t('auth.passwordsNotMatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'signup') {
        // Create the signup attempt
        await signUp.create({ emailAddress: email, password });

        // Prepare email address verification (sends OTP to email)
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        setSuccessMsg('We sent a verification code to your email. Please check your inbox.');

      } else {
        // Sign in
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          setSuccessMsg(t('auth.loginSuccess', 'Login successful!'));
          setTimeout(() => { onClose(); }, 900);
        } else {
          setError(t('auth.incompleteSignIn', 'Sign in incomplete: {status}', { status: result.status }));
        }
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Email OTP Verification ────────────────────────────────────
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!verificationCode.trim()) { setError('Please enter the verification code.'); return; }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        setSuccessMsg(t('auth.welcomeMsg', 'Account created! Welcome to GlamAI 🎉'));
        setTimeout(() => { onClose(); }, 900);
      } else {
        setError(`Verification status: ${result.status}. Please try again.`);
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────
  const handleGoogle = async () => {
    if (!isSignInLoaded) return;
    setError('');
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.origin + '/sso-callback',
        redirectUrlComplete: window.location.origin,
      });
    } catch (err) {
      setError(clerkError(err));
      setGoogleLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>

        {/* Show OTP verification screen if email verification is pending */}
        {pendingVerification ? (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              ✉️ Check your email
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your account.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', color: '#ff453a', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{ background: 'rgba(46,255,147,0.1)', border: '1px solid rgba(46,255,147,0.2)', color: '#30d158', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /><span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', width: '100%', letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.9rem', opacity: loading ? 0.75 : 1 }}
                disabled={loading}
              >
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</> : 'Verify Email'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Wrong email?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setPendingVerification(false); setSuccessMsg(''); setError(''); }}
                style={{ color: 'var(--color-pink-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Go back
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="auth-tabs">
              <div className={`auth-tab ${activeTab === 'login'  ? 'active' : ''}`} onClick={() => handleTabChange('login')}>{t('audit.authmodal.login')}</div>
              <div className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => handleTabChange('signup')}>{t('audit.authmodal.signUp')}</div>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', color: '#ff453a', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{ background: 'rgba(46,255,147,0.1)', border: '1px solid rgba(46,255,147,0.2)', color: '#30d158', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /><span>{successMsg}</span>
              </div>
            )}

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              style={{
                width: '100%', padding: '0.75rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.9rem', color: '#3c4043', transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                opacity: (googleLoading || loading) ? 0.7 : 1
              }}
            >
              {googleLoading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )
              }
              {googleLoading ? t('auth.signingIn', 'Signing in…') : t('auth.continueWithGoogle', 'Continue with Google')}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t('audit.authmodal.orContinueWithEmail')}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('audit.authmodal.emailAddress')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="form-input" style={{ paddingLeft: '2.5rem', width: '100%' }}
                    placeholder={t('audit.authmodal.youexamplecom')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('audit.authmodal.password')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" className="form-input" style={{ paddingLeft: '2.5rem', width: '100%' }}
                    placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              {activeTab === 'signup' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">{t('audit.authmodal.confirmPassword')}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.5rem', width: '100%' }}
                      placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.9rem', opacity: loading ? 0.75 : 1 }}
                disabled={loading || googleLoading}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {t('audit.authmodal.processing', 'Processing...')}</>
                  : activeTab === 'login' ? t('auth.signInButton', 'Sign In') : t('auth.createAccountButton', 'Create Account')
                }
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeTab === 'login' ? (
                <span>{t('auth.noAccount', "Don't have an account?")}{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('signup'); }}
                    style={{ color: 'var(--color-pink-primary)', textDecoration: 'none', fontWeight: 600 }}>{t('audit.authmodal.signUpFree')}</a>
                </span>
              ) : (
                <span>{t('auth.alreadyHaveAccount', "Already have an account?")}{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('login'); }}
                    style={{ color: 'var(--color-pink-primary)', textDecoration: 'none', fontWeight: 600 }}>{t('audit.authmodal.signIn')}</a>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
