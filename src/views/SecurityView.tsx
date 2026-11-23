import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCheck, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface SecurityViewProps {
  lang: Language;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '10px 0 60px' }}>
      
      {/* Header Seguridad */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={24} color="var(--accent-emerald)" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              {t.sec_header_title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t.sec_header_desc}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de 4 Pilares de Seguridad */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* 1. App Check */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Key size={18} color="var(--primary-glow)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{t.sec_card1_title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            {t.sec_card1_desc}
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '12px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} /> {t.sec_card1_pill}
          </div>
        </div>

        {/* 2. PII Redaction */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <EyeOff size={18} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{t.sec_card2_title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            {t.sec_card2_desc}
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '12px', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={14} /> {t.sec_card2_pill}
          </div>
        </div>

        {/* 3. Aislamiento COOP / COEP */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Server size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{t.sec_card3_title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            {t.sec_card3_desc}
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '12px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={14} /> {t.sec_card3_pill}
          </div>
        </div>

        {/* 4. Idempotencia & Persistencia */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{t.sec_card4_title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            {t.sec_card4_desc}
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '12px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} /> {t.sec_card4_pill}
          </div>
        </div>

      </section>

      {/* Reglas de Seguridad Firebase Firestore */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
          {t.sec_rules_title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t.sec_rules_desc}
        </p>

        <pre style={{
          background: 'rgba(0, 0, 0, 0.4)', padding: '18px 22px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '13px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto'
        }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inference_audit/{logId} {
      // Validate authenticated user and App Check token attestation
      allow read, write: if request.auth != null && 
                            request.appCheck != null &&
                            request.auth.uid == request.resource.data.userId;
    }
  }
}`}
        </pre>
      </section>

    </div>
  );
};
