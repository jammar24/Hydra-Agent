import React from 'react';
import { Compass, Github, ExternalLink, ShieldCheck, Cpu, Cloud, Terminal } from 'lucide-react';
import { Language, translations } from '../i18n';

interface FooterProps {
  onNavigate: (tab: 'home' | 'dashboard' | 'docs' | 'api' | 'security') => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang }) => {
  const t = translations[lang];

  return (
    <footer className="glass-panel" style={{ marginTop: '40px', padding: '48px 40px 32px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        
        {/* Columna 1: Brand & Misión */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--primary-accent), var(--accent-cyan))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Compass size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.14em', color: '#fff', lineHeight: '1.1' }}>
                HYDRA
              </div>
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
                {t.brand_sub}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            {t.brand_descriptor}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-emerald)', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <ShieldCheck size={13} /> Licencia Open Source Apache-2.0
          </div>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            {t.footer_nav_title}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li>
              <button 
                onClick={() => onNavigate('home')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
              >
                {t.footer_nav_home}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('dashboard')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
              >
                {t.footer_nav_dashboard}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('docs')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
              >
                {t.footer_nav_docs}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('api')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
              >
                {t.footer_nav_api}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('security')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
              >
                {t.footer_nav_security}
              </button>
            </li>
          </ul>
        </div>

        {/* Columna 3: Stack de Tecnologías */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            {t.footer_tech_title}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} color="var(--accent-cyan)" /> Gemini Nano (Chrome Desktop Prompt API)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={14} color="var(--primary-accent)" /> Firebase AI Logic (Hybrid Inference)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> Firebase App Check & Firestore
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} color="var(--accent-amber)" /> Vite 6 + React 18 + TypeScript
            </li>
          </ul>
        </div>

        {/* Columna 4: Producción & Enlaces */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            {t.footer_deploy_title}
          </h4>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
            {t.footer_deploy_desc}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="https://hydra-agent.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600',
                color: 'var(--primary-glow)', textDecoration: 'none'
              }}
            >
              hydra-agent.vercel.app <ExternalLink size={12} />
            </a>
          </div>
        </div>

      </div>

      {/* Barra Inferior de Copyright */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', fontSize: '12px', color: 'var(--text-dim)' 
      }}>
        <div>
          {t.footer_copy_left}
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>{t.footer_copy_p1}</span>
          <span>•</span>
          <span>{t.footer_copy_p2}</span>
        </div>
      </div>
    </footer>
  );
};
