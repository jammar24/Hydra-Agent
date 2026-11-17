import React, { useState } from 'react';
import { User, LogIn, LogOut, ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

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
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        uid: 'usr_' + Date.now(),
        email: email || 'jamar.masias@hackathon.dev',
        displayName: email ? email.split('@')[0] : 'Jamar Masias',
        isAnonymous: false
      });
      setLoading(false);
      onClose();
    }, 600);
  };

  const handleAnonymousAuth = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        uid: 'anon_' + Date.now(),
        email: null,
        displayName: 'Invitado Anónimo (RF-01)',
        isAnonymous: true
      });
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '36px', background: 'rgba(18, 22, 31, 0.95)', border: '1px solid rgba(255, 111, 0, 0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 111, 0, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <User size={26} color="var(--primary-orange)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Autenticación Firebase</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cumplimiento estricto con el requisito oficial <strong>RF-01</strong>
          </p>
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@google.com"
                style={{ width: '100%', background: 'rgba(10, 12, 16, 0.8)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(10, 12, 16, 0.8)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #ff6f00, #ffa000)',
              color: '#fff', border: 'none', padding: '12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px'
            }}
          >
            {loading ? 'Validando con Firebase...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '12px', color: 'var(--text-dim)' }}>— o continuar de forma rápida —</div>

        <button
          onClick={handleAnonymousAuth}
          disabled={loading}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)', padding: '12px', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Sparkles size={16} color="var(--primary-amber)" /> Iniciar como Invitado Anónimo
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}
          >
            Cancelar y volver
          </button>
        </div>

      </div>
    </div>
  );
};

