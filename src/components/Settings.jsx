import React, { useState, useEffect } from 'react';
import { User, Shield, Coins, Copy, Check, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { authFetch } from '../apiClient';
import { useToast } from './Toast';

export default function Settings({ user, onLogout, setActiveTab }) {
  const toast = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [referralData, setReferralData] = useState({ referralCode: '', referralsCount: 0, referrals: [] });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await authFetch('/api/referral');
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {}
  };

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
      const res = await authFetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        toast.success("Password updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      toast.error("Failed to update password.");
    } finally {
      setUpdating(false);
    }
  };

  const isPremium = user && user.subscriptionTier === 'premium';

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
              <span>Subscription & Billing</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>CURRENT PLAN</p>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {isPremium ? 'VIP Premium' : 'Free Tier'}
                </span>
              </div>
              {!isPremium ? (
                <button className="btn btn-primary" onClick={() => setActiveTab('pricing')}>
                  Upgrade to VIP
                </button>
              ) : (
                <span className="vip-badge-mini" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>ACTIVE</span>
              )}
            </div>
          </div>

          {/* Referral System */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="var(--color-pink-primary)" />
              <span>Referral program</span>
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL REFERRALS</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{referralData.referralsCount}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CREDITS EARNED</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-pink-primary)' }}>{referralData.referralsCount * 50}</span>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Lock size={18} color="var(--color-pink-primary)" />
              <span>Security Settings</span>
            </h3>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={updating}>
                {updating ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                <span>Update Password</span>
              </button>
            </form>
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
