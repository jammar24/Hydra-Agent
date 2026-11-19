import React, { useState } from 'react';
import { User, LogIn, ShieldCheck, Mail, Lock, Sparkles, AlertCircle, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { loginWithEmail, loginAnonymously } from '../firebase';
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
      setAuthError(lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const fbUser = await loginWithEmail(email, password);
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

  const handleAnonymousAuth = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const fbUser = await loginAnonymously();
      onLogin({
        uid: fbUser.uid,
        email: null,
        displayName: lang === 'es' ? 'Invitado Anónimo' : 'Anonymous Guest',
        isAnonymous: true
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Error.');
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
          onClick={handleAnonymousAuth}
          disabled={loading}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)', padding: '12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.2s'
          }}
        >
          <Sparkles size={16} color="var(--accent-amber)" /> {t.auth_btn_anon}
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
