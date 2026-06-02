import React, { useState, useEffect } from 'react';
import { Coins, User, Calendar, CreditCard, Copy, Check, Grid, RefreshCw, Scissors, Sparkles, Smile, Eye } from 'lucide-react';
import { authFetch } from '../apiClient';
import { useToast } from './Toast';

export default function Dashboard({ user, onLogout, setActiveTab }) {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [referralData, setReferralData] = useState({ referralCode: '', referralsCount: 0, referrals: [] });
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState({
    loading: true,
    summary: null,
    winners: null,
    error: null,
  });

  useEffect(() => {
    fetchHistory();
    fetchReferrals();
    fetchAnalytics();
  }, [filterType]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await authFetch(`/api/user/history?type=${filterType}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const res = await authFetch('/api/referral');
      if (res.ok) {
        const data = await res.json();
        setReferralData(data);
      }
    } catch (err) {}
  };

  const fetchAnalytics = async () => {
    try {
      setAnalytics((prev) => ({ ...prev, loading: true, error: null }));
      const [summaryRes, winnersRes] = await Promise.all([
        authFetch('/api/analytics/summary?limit=2000'),
        authFetch('/api/analytics/top-winners?days=14&minPaywallViews=5&minRecommendedClicks=3'),
      ]);

      if (!summaryRes.ok || !winnersRes.ok) {
        throw new Error('Failed to load analytics');
      }

      const summary = await summaryRes.json();
      const winners = await winnersRes.json();
      setAnalytics({ loading: false, summary, winners, error: null });
    } catch (err) {
      setAnalytics({ loading: false, summary: null, winners: null, error: err.message || 'Analytics unavailable' });
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isPremium = user && user.subscriptionTier === 'premium';

  return (
    <div style={{ background: 'var(--bg-primary)', padding: '4rem 0 6rem' }}>
      <div className="container animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        
        {/* Left Side: Profile & Referral card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Overview Card */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-pink-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <User size={40} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              {user.email.split('@')[0]}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '1.5rem 0' }}>
              {isPremium ? (
                <span className="vip-badge-mini" style={{ padding: '0.35rem 1rem', borderRadius: '100px', fontSize: '0.8rem' }}>VIP PREMIUM</span>
              ) : (
                <div className="token-pill" style={{ padding: '0.35rem 1rem', background: 'rgba(255,46,147,0.06)' }}>
                  <Coins size={14} />
                  <span>{user.tokens} Credits</span>
                </div>
              )}
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => setActiveTab('settings')}>
              Manage Profile
            </button>
          </div>

          {/* Referral card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Referral Program</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
              Invite friends. When they register, you both get 50 free credits!
            </p>
            
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <input 
                type="text" 
                readOnly 
                value={referralData.referralCode} 
                style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700, width: '100%', outline: 'none' }}
              />
              <button onClick={handleCopyLink} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-pink-primary)' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <span>Friends Invited:</span>
              <span>{referralData.referralsCount}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Generations History Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Transformation History</h2>
              
              {/* Category selector filter */}
              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.03)', padding: '0.2rem', borderRadius: '100px' }}>
                {['all', 'hairstyle', 'makeup', 'beard', 'nails', 'retouch'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      border: 'none',
                      background: filterType === t ? 'var(--gradient-pink-purple)' : 'transparent',
                      color: filterType === t ? '#fff' : 'var(--text-secondary)',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.75rem',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      textTransform: 'capitalize'
                    }}
                  >
                    {t === 'playground' ? 'Hair' : t}
                  </button>
                ))}
              </div>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner-inner" style={{ margin: '0 auto 1rem' }}></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <Grid size={40} style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
                <h3>No generations found</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Try one of our AI beauty tools to see transformations here.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('playground')}>
                  Try AI Hairstyles
                </button>
              </div>
            ) : (
              /* History grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {history.map((item) => (
                  <div key={item.id} className="history-card" style={{ background: '#fff', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease' }}>
                    <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000' }}>
                      <img 
                        src={item.result_url || item.style} 
                        alt="Transformation" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      
                      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(255, 46, 147, 0.9)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 800 }}>
                        {item.task_type}
                      </div>
                    </div>
                    
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.task_type === 'hairstyle' ? (item.style || 'Custom style') : (item.makeup || item.beard || item.nails || 'Retouch')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                      
                      {item.result_url && (
                        <a 
                          href={item.result_url} 
                          download={`glamai_${item.task_type}.png`}
                          className="btn btn-secondary" 
                          style={{ marginTop: '0.75rem', padding: '0.35rem 0', fontSize: '0.75rem', width: '100%' }}
                        >
                          Download HD
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Monetization Analytics</h3>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={fetchAnalytics}>
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {analytics.loading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading funnel metrics...</p>
            ) : analytics.error ? (
              <p style={{ fontSize: '0.85rem', color: '#dc2626' }}>{analytics.error}</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paywall Views</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.paywallView ?? 0}</div>
                  </div>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recommended Clicks</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.recommendedPlanClick ?? 0}</div>
                  </div>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Upgrade Starts</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.upgradeStart ?? 0}</div>
                  </div>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paywall → Upgrade</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {analytics.summary?.conversion?.paywallToUpgradeStartPct ?? 0}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Top Source (Conversion)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {analytics.winners?.winners?.topSourceByConversion?.source || 'n/a'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {analytics.winners?.winners?.topSourceByConversion?.paywallToUpgradeStartPct ?? 0}% paywall to upgrade
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Top Plan (Conversion)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {analytics.winners?.winners?.topPlanByConversion?.planId || 'n/a'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {analytics.winners?.winners?.topPlanByConversion?.recommendedClickToUpgradeStartPct ?? 0}% click to upgrade
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
