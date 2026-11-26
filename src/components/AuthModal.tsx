import React, { useState } from 'react';
import { User, LogIn, ShieldCheck, Mail, Lock, Sparkles, AlertCircle, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../firebase';
import { Language, translations } from '../i18n';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, lang }) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError(lang === 'es' ? 'Por favor completa todos los campos.' : 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setAuthError(lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const fbUser = tab === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password);
      onLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || email.split('@')[0],
        isAnonymous: false
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || (lang === 'es' ? 'Error al autenticar con Firebase.' : 'Firebase authentication error.'));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const fbUser = await loginWithGoogle();
      onLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Google User'),
        isAnonymous: false
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError(lang === 'es' ? 'Inicio con Google cancelado.' : 'Google sign-in was cancelled.');
      } else {
        setAuthError(err.message || (lang === 'es' ? 'Error al autenticar con Google.' : 'Google authentication error.'));
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{ 
        maxWidth: '440px', width: '100%', padding: '36px', 
        background: 'var(--bg-card)', border: '1px solid rgba(99, 102, 241, 0.35)',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Cabecera Modal */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.15))', 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' 
          }}>
            <ShieldCheck size={28} color="var(--primary-glow)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{t.auth_title}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.auth_desc}
          </p>
        </div>

        {/* Selector de Pestañas: Login vs Registro */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setAuthError(null); }}
            style={{
              padding: '8px', borderRadius: '8px', border: 'none',
              background: tab === 'login' ? 'var(--primary-accent)' : 'transparent',
              color: tab === 'login' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t.auth_tab_login}
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setAuthError(null); }}
            style={{
              padding: '8px', borderRadius: '8px', border: 'none',
              background: tab === 'register' ? 'var(--primary-accent)' : 'transparent',
              color: tab === 'register' ? '#fff' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t.auth_tab_register}
          </button>
        </div>

        {/* Mensaje de Error */}
        {authError && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', fontSize: '12px',
            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={15} /> {authError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
              {t.auth_email_label}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jamar.masias@hackathon.dev"
                style={{ 
                  width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-subtle)', 
                  padding: '11px 14px', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none' 
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
              {t.auth_pass_label}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ 
                  width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-subtle)', 
                  padding: '11px 40px 11px 14px', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none' 
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '12px', fontSize: '13px', width: '100%', marginTop: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {tab === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
            {loading ? t.auth_loading : (tab === 'login' ? t.auth_btn_submit_login : t.auth_btn_submit_register)}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t.auth_or}
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="btn-ghost"
          style={{
            width: '100%', padding: '11px 12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '10px', color: 'var(--text-main)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
            <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
          </svg>
          {t.auth_btn_google}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}
          >
            {t.auth_btn_cancel}
          </button>
        </div>

      </div>
    </div>
  );
};
