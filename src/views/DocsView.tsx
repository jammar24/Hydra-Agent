import React from 'react';
import { BookOpen, Layers, ShieldCheck, Terminal, Cpu, Cloud, CheckCircle2, Sparkles, Key, Zap, RefreshCw } from 'lucide-react';
import { Language, translations } from '../i18n';

interface DocsViewProps {
  lang: Language;
}

export const DocsView: React.FC<DocsViewProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '4px 0 24px' }}>
      
      {/* Header Docs */}
      <div className="glass-panel" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="var(--accent-cyan)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{t.docs_header_title}</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          {t.docs_header_desc}
        </p>
      </div>

      {/* 1. Arquitectura y Enrutador */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="var(--primary-glow)" /> {t.docs_sec1_title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          {t.docs_sec1_desc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={16} color="var(--accent-cyan)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t.docs_head1_name}</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.docs_head1_desc}</p>
          </div>

          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cloud size={16} color="var(--primary-glow)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t.docs_head2_name}</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.docs_head2_desc}</p>
          </div>

          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="var(--accent-rose)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t.docs_head3_name}</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.docs_head3_desc}</p>
          </div>

          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <RefreshCw size={16} color="var(--accent-emerald)" />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{t.docs_head4_name}</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{t.docs_head4_desc}</p>
          </div>
        </div>

        <div style={{ background: 'var(--bg-stripe)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px' }}>{t.docs_rules_title}</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.8' }}>
            <li>{t.docs_rule_1}</li>
            <li>{t.docs_rule_2}</li>
            <li>{t.docs_rule_3}</li>
            <li>{t.docs_rule_4}</li>
            <li>{t.docs_rule_5}</li>
          </ul>
        </div>
      </section>

      {/* 2. Escudo de Privacidad Zero-Trust */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="var(--accent-rose)" /> {t.docs_sec2_title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          {t.docs_sec2_desc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>{t.docs_pii_email_title}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.docs_pii_email_desc}</p>
          </div>
          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>{t.docs_pii_key_title}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.docs_pii_key_desc}</p>
          </div>
          <div style={{ background: 'var(--bg-stripe)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>{t.docs_pii_pass_title}</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.docs_pii_pass_desc}</p>
          </div>
        </div>
      </section>

      {/* 3. Capacidades y Requisitos de Producción */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="var(--accent-emerald)" /> {t.docs_sec3_title}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { 
              tag: lang === 'es' ? 'Autenticación' : 'Authentication', 
              text: lang === 'es' ? 'Acceso seguro con Firebase Auth (Google y Email/Contraseña)' : 'Secure access via Firebase Auth (Google & Email/Password)', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Inferencia Local' : 'Local Inference', 
              text: lang === 'es' ? 'Ejecución on-device en hardware del cliente con Gemini Nano en Chrome Desktop' : 'On-device execution on client hardware using Gemini Nano in Chrome Desktop', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Inferencia Cloud' : 'Cloud Inference', 
              text: lang === 'es' ? 'Procesamiento complejo en Gemini Cloud (gemini-3.5-flash-lite) con timeout de 20s, streaming y fallback explícito [Fallback: ...]' : 'Complex processing on Gemini Cloud (gemini-3.5-flash-lite) with 20s timeout, token streaming, and explicit [Fallback: ...] error surfacing', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Resiliencia Offline' : 'Offline Resilience', 
              text: lang === 'es' ? 'Sin red operan tareas simples; tareas complejas van a cola en IndexedDB' : 'Offline operation: simple tasks execute; complex tasks queue in IndexedDB', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Sincronización' : 'Sync', 
              text: lang === 'es' ? 'Drenado y reconciliación idempotente de tareas al reconectar a internet' : 'Idempotent queue drain and reconciliation upon network restoration', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Auditoría e Historial' : 'Audit & History', 
              text: lang === 'es' ? 'Panel de respuesta directa y persistencia de historial por usuario en Firestore + almacenamiento local' : 'Dedicated response panel and per-user history persistence in Firestore + local storage', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Exportación de Logs' : 'Log Export', 
              text: lang === 'es' ? 'Descarga de telemetría y auditoría técnica en formatos estándar JSON y CSV' : 'Export telemetry and technical logs in standard JSON and CSV formats', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            },
            { 
              tag: lang === 'es' ? 'Benchmark' : 'Benchmark', 
              text: lang === 'es' ? 'Evaluación reproducible de cargas simples vs. complejas (meta ≥ 40% ahorro)' : 'Reproducible benchmark of simple vs. complex workloads (≥ 40% savings)', 
              status: '≥ 40%' 
            },
            { 
              tag: lang === 'es' ? 'Seguridad App Check' : 'App Check Security', 
              text: lang === 'es' ? 'Atestación criptográfica de integridad en peticiones salientes a Firebase' : 'Cryptographic integrity attestation for outbound Firebase calls', 
              status: lang === 'es' ? 'Activo' : 'Active' 
            }
          ].map((r, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '12px 16px', background: 'var(--bg-stripe)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-glow)', whiteSpace: 'nowrap' }}>
                  {r.tag}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{r.text}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', whiteSpace: 'nowrap' }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
