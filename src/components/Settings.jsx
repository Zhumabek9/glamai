import t from '../utils/i18n';
import React, { useState, useEffect } from 'react';
import { User, Shield, Coins, Copy, Check, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { authFetch } from '../apiClient';
import { useUser } from '@clerk/react';
import { useToast } from './Toast';

export default function Settings({ user, onLogout, setActiveTab }) {
  const toast = useToast();
  const { user: clerkUser } = useUser();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [referralData, setReferralData] = useState({ referralCode: '', referralsCount: 0, referrals: [] });
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const fetchReferrals = async () => {
    try {
      const res = await authFetch('/api/referral');
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {}
  };

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setProfileData(data.user);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchReferrals();
    fetchProfile();
  }, []);

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setUpdating(true);
    try {
      if (clerkUser) {
        await clerkUser.update({ password: newPassword });
        toast.success("Password updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error("No active session");
      }
    } catch (err) {
      toast.error(err?.errors?.[0]?.longMessage || err.message || "Failed to update password.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "GDPR / CCPA Data Deletion Request:\n\nAre you sure you want to permanently delete your account and all associated style history? This action is irreversible."
    );
    if (!confirmDelete) return;

    try {
      // 1. Delete Clerk account first (primary identity provider)
      if (clerkUser) {
        await clerkUser.delete();
      }

      // 2. Delete database entry and sessions on backend
      const res = await authFetch('/api/user/profile', {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error("Server failed to remove profile records.");
      }
      
      // 3. Remove localized storage items
      if (user?.email) {
        const emailKey = `glamai_history_${user.email.toLowerCase()}`;
        localStorage.removeItem(emailKey);
      }

      toast.success("Your account and history have been successfully deleted.");
      onLogout();
      setActiveTab('playground');
    } catch (err) {
      console.error("Deletion error:", err);
      toast.error(err.message || "Failed to fully delete your account. Please try again or contact support.");
    }
  };

  const isPremium = user && user.subscriptionTier === 'premium';
  // Use profileData if available to get the most up-to-date status and end date
  const isCanceled = profileData ? profileData.subscriptionStatus === 'canceled' : user?.subscriptionStatus === 'canceled';
  const subEnd = profileData?.subscriptionEnd ? new Date(profileData.subscriptionEnd).toLocaleDateString() : null;

  const handleCancelSubscription = async () => {
    if (window.confirm("Your subscription will remain valid until the end of your current billing period but will not renew. Are you sure you want to cancel?")) {
      setCanceling(true);
      try {
        const res = await authFetch('/api/user/cancel-subscription', { method: 'POST' });
        if (res.ok) {
          toast.success("Subscription canceled successfully.");
          await fetchProfile(); // Refresh profile to get updated status
        } else {
          toast.error("Failed to cancel subscription.");
        }
      } catch (err) {
        toast.error("An error occurred while canceling.");
      } finally {
        setCanceling(false);
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', padding: '4rem 0 6rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '720px' }}>
        
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
          Profile Settings
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Subscription Info Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Shield size={18} color="var(--color-pink-primary)" />
              <span>{t('audit.settings.subscriptionBilling')}</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('audit.settings.currentPlan')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    {isPremium ? 'VIP Premium' : 'Free Tier'}
                  </span>
                  {isPremium && (
                    <span className="vip-badge-mini" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', opacity: isCanceled ? 0.6 : 1 }}>
                      {isCanceled ? 'Canceled' : t('audit.settings.active')}
                    </span>
                  )}
                </div>
                {isPremium && subEnd && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Ends on: <strong>{subEnd}</strong>
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!isPremium ? (
                  <button className="btn btn-primary" onClick={() => setActiveTab('pricing')}>
                    Upgrade to VIP
                  </button>
                ) : (
                  !isCanceled && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', borderColor: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d' }}
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Referral System */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--color-pink-primary)" />
              <span>{t('audit.settings.referralProgram')}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Share GlamAI with friends and earn 50 free credits for every friend who signs up!
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/?ref=${referralData.referralCode}`}
                style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', color: 'var(--text-primary)', fontWeight: 700, outline: 'none', fontSize: '0.85rem' }}
              />
              <button className="btn btn-primary" onClick={handleCopyLink} style={{ minWidth: '100px' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t('audit.settings.totalReferrals')}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{referralData.referralsCount}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t('audit.settings.creditsEarned')}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-pink-primary)' }}>{referralData.referralsCount * 50}</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Lock size={18} color="var(--color-pink-primary)" />
              <span>{t('audit.settings.securitySettings')}</span>
            </h3>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{t('audit.settings.newPassword')}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('audit.settings.min8Characters')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('audit.settings.confirmNewPassword')}</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('audit.settings.confirmPassword')}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={updating}>
                {updating ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                <span>{t('audit.settings.updatePassword')}</span>
              </button>
            </form>
          </div>

          {/* GDPR & CCPA Compliance Data Erasure Panel */}
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ff4d4d' }}>
              <Shield size={18} color="#ff4d4d" />
              <span>{t('audit.settings.gdprCcpaDataPrivacy')}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Under GDPR (Europe) and CCPA (USA), you have the right to request deletion of your account and personal data. Clicking the button below will immediately erase your style gallery, remove your credentials, and delete your profile.
            </p>
            <button 
              className="btn" 
              onClick={handleDeleteAccount}
              style={{ width: '100%', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d' }}
            >
              Delete Account & Permanent Erasure
            </button>
          </div>

          {/* Sign Out Button */}
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)' }}
            onClick={() => { onLogout(); setActiveTab('playground'); }}
          >
            Sign Out of Account
          </button>


        </div>

      </div>
    </div>
  );
}
