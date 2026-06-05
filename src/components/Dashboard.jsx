import t from '../utils/i18n';
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

  // Admin Control Panel States
  const [activeSubTab, setActiveSubTab] = useState('history'); // 'history' or 'admin'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [creditsInput, setCreditsInput] = useState({});

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  useEffect(() => {
    fetchReferrals();
    if (user?.role === 'admin') {
      fetchAnalytics();
      fetchAdminUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && activeSubTab === 'admin') {
      fetchAdminUsers(adminSearch);
    }
  }, [activeSubTab, user]);

  const fetchAdminUsers = async (searchVal = '') => {
    try {
      setLoadingAdminUsers(true);
      const res = await authFetch(`/api/admin/users?search=${encodeURIComponent(searchVal)}`);
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
        const inputs = {};
        (data.users || []).forEach(u => {
          inputs[u.id] = u.credits;
        });
        setCreditsInput(inputs);
      }
    } catch (err) {
      console.warn("Failed to fetch admin users:", err);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const res = await authFetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        toast.success("User updated successfully");
        fetchAdminUsers(adminSearch);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update user");
      }
    } catch (err) {
      toast.error("Failed to connect to update API");
    }
  };

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
    <div className="dashboard-page-container">
      <div className="container animate-fade-in dashboard-grid" style={{ gap: '2rem' }}>

        
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
                <span className="vip-badge-mini" style={{ padding: '0.35rem 1rem', borderRadius: '100px', fontSize: '0.8rem' }}>{t('audit.dashboard.vipPremium')}</span>
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
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t('audit.dashboard.referralProgram')}</h4>
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
              <span>{t('audit.dashboard.friendsInvited')}</span>
              <span>{referralData.referralsCount}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Generations History Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Workspace Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              {user?.role === 'admin' ? (
                <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.03)', padding: '0.25rem', borderRadius: '100px' }}>
                  <button 
                    onClick={() => setActiveSubTab('history')}
                    style={{
                      border: 'none',
                      background: activeSubTab === 'history' ? 'var(--gradient-pink-purple)' : 'transparent',
                      color: activeSubTab === 'history' ? '#fff' : 'var(--text-secondary)',
                      padding: '0.4rem 1.25rem',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    My History
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('admin')}
                    style={{
                      border: 'none',
                      background: activeSubTab === 'admin' ? 'var(--gradient-pink-purple)' : 'transparent',
                      color: activeSubTab === 'admin' ? '#fff' : 'var(--text-secondary)',
                      padding: '0.4rem 1.25rem',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Admin Control Panel
                  </button>
                </div>
              ) : (
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('audit.dashboard.transformationHistory')}</h2>
              )}
              
              {/* Category selector filter (only shown for history tab) */}
              {activeSubTab === 'history' && (
                <div style={{ 
                  display: 'flex', 
                  gap: '0.35rem', 
                  background: 'rgba(0,0,0,0.03)', 
                  padding: '0.2rem', 
                  borderRadius: '100px',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none'
                }}>
                  {['all', 'hairstyle', 'makeup', 'nails', 'beard', 'retouch'].map(t => {
                    const labelMap = {
                      all: 'All',
                      hairstyle: 'Hair',
                      makeup: 'Makeup',
                      nails: 'Nails',
                      beard: 'Beard',
                      retouch: 'Retouch'
                    };
                    const label = labelMap[t] || t;
                    return (
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
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {activeSubTab === 'history' ? (
              loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div className="spinner-inner" style={{ margin: '0 auto 1rem' }}></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.loadingHistory')}</span>
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <Grid size={40} style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
                  <h3>{t('audit.dashboard.noGenerationsFound')}</h3>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>{t('audit.dashboard.tryOneOfOurAiBeautyToolsToSeeT')}</p>
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
                          {item.task_type === 'hairstyle' ? (item.style || 'Custom style') : (item.makeup || item.nails || 'Custom Look')}
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
              )
            ) : (
              // Admin Sub-Tab: visible only to users with role='admin'
              user?.role === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={t('audit.dashboard.searchUsersByEmail')}
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.7)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchAdminUsers(adminSearch);
                      }}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={() => fetchAdminUsers(adminSearch)}
                      style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                    >
                      Search
                    </button>
                  </div>

                  {loadingAdminUsers ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                      <div className="spinner-inner" style={{ margin: '0 auto 1rem' }}></div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.loadingUsers')}</span>
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      <p>{t('audit.dashboard.noUsersFound')}</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', background: 'rgba(255,255,255,0.5)' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,46,147,0.06)', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>{t('audit.dashboard.email')}</th>
                            <th style={{ padding: '0.75rem 1rem' }}>{t('audit.dashboard.credits')}</th>
                            <th style={{ padding: '0.75rem 1rem' }}>{t('audit.dashboard.plan')}</th>
                            <th style={{ padding: '0.75rem 1rem' }}>{t('audit.dashboard.role')}</th>
                            <th style={{ padding: '0.75rem 1rem' }}>{t('audit.dashboard.actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map(u => {
                            const isUserPremium = u.subscription_tier === 'premium' && u.subscription_status === 'active';
                            return (
                              <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, wordBreak: 'break-all' }}>{u.email}</td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <input
                                      type="number"
                                      value={creditsInput[u.id] ?? u.credits}
                                      onChange={(e) => setCreditsInput({
                                        ...creditsInput,
                                        [u.id]: Number(e.target.value)
                                      })}
                                      style={{
                                        width: '65px',
                                        padding: '0.25rem 0.4rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--glass-border)',
                                        textAlign: 'center',
                                        fontSize: '0.8rem'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleUpdateUser(u.id, { credits: creditsInput[u.id] })}
                                      style={{
                                        padding: '0.3rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--color-pink-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: 700
                                      }}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '20px',
                                    background: isUserPremium ? 'rgba(138,43,226,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: isUserPremium ? 'var(--color-purple-primary)' : 'var(--text-secondary)',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    display: 'inline-block',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {isUserPremium ? 'VIP' : 'FREE'}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateUser(u.id, {
                                      subscriptionTier: isUserPremium ? 'free' : 'premium',
                                      subscriptionStatus: isUserPremium ? 'inactive' : 'active'
                                    })}
                                    style={{
                                      display: 'block',
                                      padding: '0.2rem 0.4rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--glass-border)',
                                      fontSize: '0.7rem',
                                      background: '#fff',
                                      cursor: 'pointer',
                                      fontWeight: 600
                                    }}
                                  >
                                    Toggle VIP
                                  </button>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '20px',
                                    background: u.role === 'admin' ? 'rgba(255,46,147,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: u.role === 'admin' ? 'var(--color-pink-primary)' : 'var(--text-secondary)',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    display: 'inline-block',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {u.role.toUpperCase()}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateUser(u.id, {
                                      role: u.role === 'admin' ? 'user' : 'admin'
                                    })}
                                    style={{
                                      display: 'block',
                                      padding: '0.2rem 0.4rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--glass-border)',
                                      fontSize: '0.7rem',
                                      background: '#fff',
                                      cursor: 'pointer',
                                      fontWeight: 600
                                    }}
                                  >
                                    Make {u.role === 'admin' ? 'User' : 'Admin'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Pre-existing Monetization Analytics: Restricted to Admin Panel */}
          {user?.role === 'admin' && activeSubTab === 'admin' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{t('audit.dashboard.monetizationAnalytics')}</h3>
                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={fetchAnalytics}>
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {analytics.loading ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.loadingFunnelMetrics')}</p>
              ) : analytics.error ? (
                <p style={{ fontSize: '0.85rem', color: '#dc2626' }}>{analytics.error}</p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.paywallViews')}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.paywallView ?? 0}</div>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.recommendedClicks')}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.recommendedPlanClick ?? 0}</div>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.upgradeStarts')}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{analytics.summary?.funnel?.upgradeStart ?? 0}</div>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('audit.dashboard.paywallUpgrade')}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {analytics.summary?.conversion?.paywallToUpgradeStartPct ?? 0}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{t('audit.dashboard.topSourceConversion')}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {analytics.winners?.winners?.topSourceByConversion?.source || 'n/a'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {analytics.winners?.winners?.topSourceByConversion?.paywallToUpgradeStartPct ?? 0}% paywall to upgrade
                      </div>
                    </div>
                    <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.85rem', background: 'rgba(255,255,255,0.7)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{t('audit.dashboard.topPlanConversion')}</div>
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
          )}
        </div>

      </div>
    </div>
  );
}
