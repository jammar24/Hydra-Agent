import React from 'react';
import { 
  Compass, ArrowRight, ShieldCheck, Cpu, Cloud, Zap, 
  Sparkles, BookOpen, Code2, CheckCircle2 
} from 'lucide-react';

interface HomeViewProps {
  onGoToDashboard: () => void;
  onGoToDocs: () => void;
  onGoToAPI: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGoToDashboard, onGoToDocs, onGoToAPI }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', padding: '10px 0 30px' }}>
      
      {/* ─── HERO PRINCIPAL EQUILIBRADO ─── */}
      <section className="glass-panel" style={{ 
        padding: '64px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(22, 28, 44, 0.7) 0%, rgba(14, 18, 27, 0.85) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        
        {/* Glow de fondo decorativo */}
        <div style={{
          position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', 
          background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', 
          color: 'var(--primary-glow)', fontSize: '12px', fontWeight: '700', marginBottom: '24px' 
        }}>
          <Sparkles size={14} /> CANDIDATO BEST WEB / CHROME APP · #BUILDHYBRIDAI 2026
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: '900', lineHeight: '1.15',
          letterSpacing: '-0.03em', marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 40%, #cbd5e1 70%, #818cf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Inferencia Híbrida Inteligente.<br />
          Gemini Nano On-Device ⇄ Gemini Cloud.
        </h1>

        <p style={{ maxWidth: '720px', margin: '0 auto 36px', fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          El primer orquestador que analiza tokens, intención y datos sensibles en tiempo real (&lt; 50ms). Resuelve tareas simples y datos confidenciales en el navegador con <strong>Gemini Nano</strong> (0 tokens de red, ultra-privado) y escala tareas complejas a <strong>Firebase AI Logic</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onGoToDashboard}
            className="btn-primary"
            style={{
              padding: '15px 32px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            Abrir Dashboard <ArrowRight size={18} />
          </button>

          <button
            onClick={onGoToDocs}
            style={{
              background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <BookOpen size={18} color="var(--accent-cyan)" /> Ver Documentación
          </button>

          <button
            onClick={onGoToAPI}
            style={{
              background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)', padding: '15px 26px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <Code2 size={18} color="var(--primary-glow)" /> Referencia de API
          </button>
        </div>
      </section>

      {/* ─── LOS TRES PILARES ─── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Cpu size={24} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>Gemini Nano On-Device</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            Aprovecha la <code>window.ai.languageModel</code> de Chrome Desktop. Ejecuta modelos en hardware local con latencia inferior a 280ms y funcionamiento 100% offline.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <ShieldCheck size={24} color="var(--accent-rose)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>Escudo de Privacidad Zero-Trust</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            Detección proactiva de datos sensibles (correos, contraseñas, API keys). Bloquea la salida a internet y fuerza ejecución en memoria local para máxima confidencialidad.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '30px 26px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <Cloud size={24} color="var(--primary-glow)" />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '10px', color: '#fff' }}>Firebase AI Logic & App Check</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            Escala tareas de razonamiento profundo o gran contexto a la nube con streaming de respuesta palabra por palabra, protegido por atestación de seguridad oficial.
          </p>
        </div>

      </section>

      {/* ─── BENCHMARK STRIP ─── */}
      <section className="glass-panel" style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-emerald)' }}>&gt; 50%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>Ahorro de Cargas a la Nube</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--accent-cyan)' }}>&lt; 280ms</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>Latencia Local Gemini Nano</div>
        </div>
        <div style={{ width: '1px', height: '50px', background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--primary-glow)' }}>100%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>Resiliencia en Modo Avión</div>
        </div>
      </section>

    </div>
  );
};
