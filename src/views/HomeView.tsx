import React from 'react';
import { 
  ArrowRight, ShieldCheck, Cpu, Cloud, Zap, 
  Sparkles, BookOpen, Code2, RefreshCw, Key, Layers, ExternalLink
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface HomeViewProps {
  onGoToDashboard: () => void;
  onGoToDocs: () => void;
  onGoToAPI: () => void;
  lang: Language;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGoToDashboard, onGoToDocs, onGoToAPI, lang }) => {
  const t = translations[lang];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '4px 0 16px' }}>
      
      {/* ─── HERO PRINCIPAL ─── */}
      <section className="glass-panel hero-panel" style={{ 
        padding: '40px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', 
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', 
          color: 'var(--primary-glow)', fontSize: '12px', fontWeight: '700', marginBottom: '24px' 
        }}>
          <Sparkles size={14} /> {t.hero_badge}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <span style={{ 
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.24em', color: 'var(--accent-cyan)', textTransform: 'uppercase' 
          }}>
            {t.brand_tagline}
          </span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: '900', lineHeight: '1.15',
          letterSpacing: '-0.03em', marginBottom: '20px',
          color: 'var(--text-main)'
        }}>
          {t.hero_title_1}<br />
          <span style={{ 
            color: 'var(--primary-glow)',
            background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            {t.hero_title_2}
          </span>
        </h1>

        <p style={{ maxWidth: '760px', margin: '0 auto 36px', fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          {t.hero_desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onGoToDashboard}
            className="btn-primary"
            style={{
              padding: '15px 32px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            {t.hero_btn_dashboard} <ArrowRight size={18} />
          </button>

          <button
            onClick={onGoToDocs}
            className="btn-ghost"
            style={{
              padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <BookOpen size={18} color="var(--accent-cyan)" /> {t.hero_btn_docs}
          </button>

          <button
            onClick={onGoToAPI}
            className="btn-ghost"
            style={{
              padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Code2 size={18} color="var(--primary-glow)" /> {t.hero_btn_api}
          </button>
        </div>
      </section>

      {/* ─── LAS 4 CABEZAS DE HYDRA ─── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
            {t.heads_section_title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {t.heads_section_sub}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Cabeza 1: Local */}
          <div className="glass-panel" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={22} color="var(--accent-cyan)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                HEAD 01
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
              {t.head_1_title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              {t.head_1_desc}
            </p>
          </div>

          {/* Cabeza 2: Cloud */}
          <div className="glass-panel" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cloud size={22} color="var(--primary-glow)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-glow)' }}>
                HEAD 02
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
              {t.head_2_title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              {t.head_2_desc}
            </p>
          </div>

          {/* Cabeza 3: Privacidad */}
          <div className="glass-panel" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="var(--accent-rose)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
                HEAD 03
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
              {t.head_3_title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              {t.head_3_desc}
            </p>
          </div>

          {/* Cabeza 4: Sincronización */}
          <div className="glass-panel" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={22} color="var(--accent-emerald)" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                HEAD 04
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>
              {t.head_4_title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              {t.head_4_desc}
            </p>
          </div>

        </div>
      </section>

      {/* ─── BENCHMARK STRIP MEDIDO ─── */}
      <section className="glass-panel" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '18px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-emerald)' }}>{t.stat_savings_val}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
            {t.stat_savings_label}
          </div>
        </div>
        <div className="stat-divider" style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-cyan)' }}>{t.stat_latency_val}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
            {t.stat_latency_label}
          </div>
        </div>
        <div className="stat-divider" style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--primary-glow)' }}>{t.stat_resilience_val}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
            {t.stat_resilience_label}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
            {t.team_section_title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {t.team_section_sub}
          </p>
        </div>

        <div className="glass-panel" style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <img
            src="/team-jamar.jpg"
            alt="Jamar Masias"
            style={{
              width: '104px',
              height: '104px',
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: '50% 18%',
              border: '2px solid var(--border-mid)',
              boxShadow: 'var(--shadow-card)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                Jamar Masias
              </h3>
              <span className="badge badge-blue">
                {t.team_role}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
              {t.team_bio}
            </p>
            <a
              href="https://github.com/jammar24/Hydra-Agent"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--primary-glow)',
                textDecoration: 'none'
              }}
            >
              github.com/jammar24/Hydra-Agent <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
