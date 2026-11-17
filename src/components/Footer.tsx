import React from 'react';
import { Compass, Github, ExternalLink, ShieldCheck, Cpu, Cloud, Terminal, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'home' | 'dashboard' | 'docs' | 'api') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="glass-panel" style={{ marginTop: '40px', padding: '48px 40px 32px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        
        {/* Columna 1: Brand & Misión */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--primary-accent), var(--accent-cyan))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Compass size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              HYBRIDAGENT
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            Orquestador híbrido reactivo de IA para Web y Chrome. Equilibra automáticamente cómputo on-device (Gemini Nano) con la nube (Firebase AI Logic).
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-emerald)', padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <ShieldCheck size={13} /> Licencia Open Source Apache-2.0
          </div>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Navegación del Proyecto
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <li>
              <button 
                onClick={() => onNavigate('home')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Inicio (Visión General)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('dashboard')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Dashboard de Inferencia & Benchmark
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('docs')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Documentación Técnica & Requisitos
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('api')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Referencia de API & Ejemplos
              </button>
            </li>
          </ul>
        </div>

        {/* Columna 3: Tecnologías de Google & Firebase */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Stack del Hackathon
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={14} color="var(--accent-cyan)" /> Gemini Nano (Chrome Prompt API)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cloud size={14} color="var(--primary-accent)" /> Firebase AI Logic (Cloud Inference)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> Firebase App Check & Firestore
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={14} color="var(--accent-amber)" /> Vite 6 + React 18 + TypeScript
            </li>
          </ul>
        </div>

        {/* Columna 4: Hackathon & Entrega */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Hackathon Devpost
          </h4>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
            <strong>Competición:</strong> #BuildHybridAI 2026<br />
            <strong>Categoría:</strong> Best Web / Chrome App ($3,000)<br />
            <strong>Cierre:</strong> 30 de Noviembre, 2:00 PM PST
          </div>
          <a 
            href="https://firebasehybridaihackathon.devpost.com/" 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600',
              color: 'var(--accent-cyan)', textDecoration: 'none'
            }}
          >
            Página Oficial Devpost <ExternalLink size={12} />
          </a>
        </div>

      </div>

      {/* Barra Inferior de Copyright */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px', fontSize: '12px', color: 'var(--text-dim)' 
      }}>
        <div>
          © 2026 <strong>HybridAgent</strong>. Desarrollado con dedicación por <strong>Jamar Masias</strong> para Firebase #BuildHybridAI.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Privacidad Zero-Trust Garantizada</span>
          <span>•</span>
          <span>100% Inferencia Auditable</span>
        </div>
      </div>
    </footer>
  );
};

