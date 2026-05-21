import React, { useState } from 'react';
import { X, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

// Map Firebase error codes to human-readable messages
function firebaseError(code) {
  console.error('[Firebase Auth Error Code]:', code); // ← visible in browser DevTools (F12 → Console)
  switch (code) {
    case 'auth/email-already-in-use':    return 'An account with this email already exists.';
    case 'auth/invalid-email':           return 'Please enter a valid email address.';
    case 'auth/weak-password':           return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':          return 'No account found with this email.';
    case 'auth/wrong-password':          return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':      return 'Invalid email or password.';
    case 'auth/popup-closed-by-user':    return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':           return 'Popup was blocked by browser. Please allow popups for this site.';
    case 'auth/network-request-failed':  return 'Network error. Please check your connection.';
    case 'auth/operation-not-allowed':   return 'Google Sign-In is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.';
    case 'auth/unauthorized-domain':     return 'This domain is not authorized in Firebase Console. Add "localhost" to Authorized Domains.';
    case 'auth/internal-error':          return 'Firebase internal error. Check browser console for details.';
    case 'auth/cancelled-popup-request': return null; // silent — another popup already open
    default:                             return `Error: ${code || 'unknown'}. Check browser console (F12) for details.`;
  }
}

// After Firebase auth succeeds, sync user with our backend and get credits
async function syncWithBackend(firebaseUser) {
  const idToken = await firebaseUser.getIdToken();
  const res = await fetch('/api/auth/firebase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Backend sync failed');
  }
  return res.json(); // { user: { id, email, credits } }
}

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab]           = useState('login');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                   = useState('');
  const [successMsg, setSuccessMsg]         = useState('');
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // ── Email / Password ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (activeTab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      let credential;
      if (activeTab === 'signup') {
        credential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        credential = await signInWithEmailAndPassword(auth, email, password);
      }

      const { user: backendUser } = await syncWithBackend(credential.user);
      setSuccessMsg(activeTab === 'signup' ? 'Account created! Welcome to GlamAI 🎉' : 'Login successful!');
      setTimeout(() => { onAuthSuccess(backendUser); onClose(); }, 900);

    } catch (err) {
      setError(firebaseError(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const { user: backendUser } = await syncWithBackend(credential.user);
      setSuccessMsg('Signed in with Google! Welcome 🎉');
      setTimeout(() => { onAuthSuccess(backendUser); onClose(); }, 900);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(firebaseError(err.code) || err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>

        {/* Tabs */}
        <div className="auth-tabs">
          <div className={`auth-tab ${activeTab === 'login'  ? 'active' : ''}`} onClick={() => handleTabChange('login')}>Login</div>
          <div className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => handleTabChange('signup')}>Sign Up</div>
        </div>

        {/* Error / Success banners */}
        {error && (
          <div style={{ background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.2)', color:'#ff453a', padding:'0.75rem', borderRadius:'var(--radius-sm)', marginBottom:'1.25rem', fontSize:'0.85rem', lineHeight:1.4 }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ background:'rgba(46,255,147,0.1)', border:'1px solid rgba(46,255,147,0.2)', color:'#30d158', padding:'0.75rem', borderRadius:'var(--radius-sm)', marginBottom:'1.25rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <CheckCircle2 size={16} /><span>{successMsg}</span>
          </div>
        )}

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          style={{
            width:'100%', padding:'0.75rem', marginBottom:'1.25rem',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.65rem',
            background:'#fff', border:'1px solid rgba(0,0,0,0.12)',
            borderRadius:'var(--radius-md)', cursor:'pointer', fontWeight:600,
            fontSize:'0.9rem', color:'#3c4043', transition:'all 0.2s',
            boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
            opacity: (googleLoading || loading) ? 0.7 : 1
          }}
        >
          {googleLoading
            ? <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} />
            : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )
          }
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
          <div style={{ flex:1, height:'1px', background:'rgba(0,0,0,0.08)' }} />
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>or continue with email</span>
          <div style={{ flex:1, height:'1px', background:'rgba(0,0,0,0.08)' }} />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position:'relative' }}>
              <Mail size={16} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input type="email" className="form-input" style={{ paddingLeft:'2.5rem', width:'100%' }}
                placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input type="password" className="form-input" style={{ paddingLeft:'2.5rem', width:'100%' }}
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          {activeTab === 'signup' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Confirm Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="password" className="form-input" style={{ paddingLeft:'2.5rem', width:'100%' }}
                  placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', marginTop:'1rem', padding:'0.9rem', opacity: loading ? 0.75 : 1 }}
            disabled={loading || googleLoading}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Processing…</>
              : activeTab === 'login' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>

        <div style={{ marginTop:'1.25rem', textAlign:'center', fontSize:'0.8rem', color:'var(--text-muted)' }}>
          {activeTab === 'login' ? (
            <span>Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('signup'); }}
                style={{ color:'var(--color-pink-primary)', textDecoration:'none', fontWeight:600 }}>Sign up free</a>
            </span>
          ) : (
            <span>Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange('login'); }}
                style={{ color:'var(--color-pink-primary)', textDecoration:'none', fontWeight:600 }}>Sign in</a>
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
