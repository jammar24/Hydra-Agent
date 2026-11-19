import React from 'react';
import { 
  Compass, ArrowRight, ShieldCheck, Cpu, Cloud, Zap, 
  Sparkles, BookOpen, Code2 
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', padding: '10px 0 30px' }}>
      
      {/* ─── HERO PRINCIPAL ─── */}
      <section className="glass-panel" style={{ 
        padding: '64px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', 
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', 
          color: 'var(--primary-glow)', fontSize: '12px', fontWeight: '700', marginBottom: '24px' 
        }}>
          <Sparkles size={14} /> {t.hero_badge}
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', fontWeight: '900', lineHeight: '1.15',
          letterSpacing: '-0.03em', marginBottom: '20px',
          color: 'var(--text-main)'
        }}>
          {t.hero_title_1}<br />
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary-accent), var(--accent-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {t.hero_title_2}
          </span>
        </h1>

        <p style={{ maxWidth: '740px', margin: '0 auto 36px', fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
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
            style={{
              background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <BookOpen size={18} color="var(--accent-cyan)" /> {t.hero_btn_docs}
          </button>

          <button
            onClick={onGoToAPI}
            style={{
              background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <Code2 size={18} color="var(--primary-glow)" /> {t.hero_btn_api}
          </button>
        </div>
      </section>

      {/* ─── LOS TRES PILARES ─── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Cpu size={24} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>{t.pillar_local_title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            {t.pillar_local_desc}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <ShieldCheck size={24} color="var(--accent-rose)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>{t.pillar_privacy_title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            {t.pillar_privacy_desc}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Cloud size={24} color="var(--primary-glow)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-main)' }}>{t.pillar_cloud_title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            {t.pillar_cloud_desc}
          </p>
        </div>

      </section>

      {/* ─── BENCHMARK STRIP ─── */}
      <section className="glass-panel" style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-emerald)' }}>&gt; 50%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{t.stat_savings_label}</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-cyan)' }}>&lt; 280ms</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{t.stat_latency_label}</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--primary-glow)' }}>100%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{t.stat_resilience_label}</div>
        </div>
      </section>

    </div>
  );
};
