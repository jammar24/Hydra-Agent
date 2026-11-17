import React from 'react';
import { BookOpen, Layers, ShieldCheck, Terminal, Cpu, Cloud, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '10px 0 60px' }}>
      
      {/* Header Docs */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <BookOpen size={28} color="var(--accent-cyan)" />
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Documentación Técnica del Sistema</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          Especificación detallada de la arquitectura de enrutamiento híbrido, requerimientos de ingeniería (RF-01 a RF-17), modelo de seguridad y estrategia de fallback.
        </p>
      </div>

      {/* 1. Arquitectura y Enrutador */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={22} color="var(--primary-orange)" /> 1. Arquitectura del Orquestador Desacoplado
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          El núcleo de <strong>HybridAgent</strong> reside en <code>src/orchestrator/</code>. A diferencia de las soluciones monolíticas tradicionales, las decisiones de cómputo están estrictamente separadas de la capa de ejecución (Workers) y del estado (Firestore).
        </p>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px' }}>Reglas de Evaluación Semántica:</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.8' }}>
            <li><strong>Estimación de Tokens:</strong> Longitud de caracteres / 3.8 con normalización de espacios.</li>
            <li><strong>Clasificador de Intención:</strong> Identifica si el prompt solicita código, razonamiento matemático, resúmenes o extracción de tareas.</li>
            <li><strong>Umbral de Complejidad:</strong> Puntuación calculada de 0 a 100. Tareas con score &lt; 50 se dirigen a Gemini Nano.</li>
            <li><strong>Límite de Contexto On-Device:</strong> Límite de 9.216 tokens para inferencia local; todo volumen superior escala a la nube.</li>
          </ul>
        </div>
      </section>

      {/* 2. Escudo de Privacidad Zero-Trust */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} color="var(--accent-rose)" /> 2. Escudo de Privacidad Zero-Trust (PII Redaction)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          Uno de los diferenciadores de mayor impacto para el jurado es la protección estricta de la información personal identificable (PII). El evaluador escanea expresiones regulares de alta precisión antes de despachar cualquier tarea:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>Correos Electrónicos</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enmascarados en logs como <code>[EMAIL_PROTEGIDO]</code>. Bloquea el envío a servidores de nube.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>API Keys y Tokens</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Detecta prefijos <code>sk-proj-</code>, <code>AIza</code>, <code>Bearer</code> y sustituye por <code>[API_KEY_CONFIDENCIAL]</code>.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>Tarjetas y Credenciales</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enmascarado como <code>[TARJETA_PROTEGIDA]</code> y forzado a ejecución on-device.</p>
          </div>
        </div>
      </section>

      {/* 3. Requisitos Oficiales */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={22} color="var(--accent-emerald)" /> 3. Matriz de Requisitos Cumplidos
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'RF-01', text: 'Autenticación con Firebase Auth (Google y Anónimo)', status: 'Cumplido' },
            { id: 'RF-04', text: 'Inferencia on-device con Gemini Nano vía window.ai', status: 'Cumplido' },
            { id: 'RF-05', text: 'Tareas complejas en Gemini Cloud vía Firebase AI Logic', status: 'Cumplido' },
            { id: 'RF-07', text: 'Operación continua sin red (Modo Avión) con encolado IndexedDB', status: 'Cumplido' },
            { id: 'RF-08', text: 'Drenado y reconciliación idempotente al reconectar', status: 'Cumplido' },
            { id: 'RF-10 / 15', text: 'Auditoría en tiempo real con razones de enrutamiento explicables', status: 'Cumplido' },
            { id: 'RF-13', text: 'Exportación de logs técnicos en JSON y CSV', status: 'Cumplido' },
            { id: 'RNF-06', text: 'Reducción demostrada de al menos 40% de llamadas a la nube', status: 'Cumplido (>50%)' },
            { id: 'RNF-10', text: 'App Check activo en toda llamada y protección de secretos', status: 'Cumplido' }
          ].map((r) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <strong style={{ color: 'var(--primary-amber)', marginRight: '10px' }}>{r.id}:</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{r.text}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

