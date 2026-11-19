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

export const SecurityView: React.FC = () => {
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
              Centro de Seguridad Zero-Trust & Atestación
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Arquitectura de ciberseguridad para inferencia de IA en el cliente y protección de secretos
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
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>1. Firebase App Check</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            Cada llamada a la nube es validada criptográficamente con tokens de atestación mediante el proveedor oficial de Firebase App Check. Se bloquea cualquier intento de invocación desde clientes no verificados o scrapers maliciosos.
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '12px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} /> Tokens con auto-renovación activa cada 60m
          </div>
        </div>

        {/* 2. PII Redaction */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <EyeOff size={18} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>2. Escudo PII en Memoria (Zero-Trust)</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            El analizador semántico escanea patrones de correos, API keys (<code>sk-proj-</code>, <code>AIza</code>) y passwords antes de elegir la ruta. Si detecta datos sensibles, <strong>prohíbe el uso de la red</strong> y fuerza la ejecución con Gemini Nano on-device.
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '12px', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={14} /> Enmascaramiento activo [REDACTED]
          </div>
        </div>

        {/* 3. Aislamiento COOP / COEP */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Server size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>3. Cabeceras de Aislamiento Web</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            Configurado en <code>firebase.json</code> con cabeceras estrictas de <code>Cross-Origin-Opener-Policy: same-origin</code> y <code>Cross-Origin-Embedder-Policy: require-corp</code> para blindar la memoria compartida de la Prompt API nativa.
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '12px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={14} /> Protección contra Spectre y ataques side-channel
          </div>
        </div>

        {/* 4. Idempotencia & Persistencia */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={18} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>4. Cifrado Local y Cola Idempotente</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
            En modo avión, las tareas no se pierden en memoria volátil: se encriptan y almacenan en IndexedDB mediante el SDK de Firestore, garantizando sincronización con clave idempotente (sin duplicados) al reconectar.
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '12px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} /> Reconciliación con serverTimestamp
          </div>
        </div>

      </section>

      {/* Reglas de Seguridad Firebase Firestore */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
          Reglas de Seguridad Firestore Declarativas (firestore.rules)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Las consultas de memoria y tareas están vinculadas únicamente al UID autenticado (Email o Anónimo), imposibilitando la lectura cruzada de datos entre usuarios.
        </p>
        <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '18px', overflowX: 'auto', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /metrics/{metricId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}`}
        </pre>
      </section>

    </div>
  );
};
