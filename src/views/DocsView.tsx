import React from 'react';
import { BookOpen, Layers, ShieldCheck, Terminal, Cpu, Cloud, CheckCircle2, Sparkles, Key, Zap, Database } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '10px 0 60px' }}>
      
      {/* Header Docs */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} color="var(--accent-cyan)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Documentación Técnica del Sistema</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          Especificación detallada de la arquitectura de enrutamiento híbrido, capacidades de ingeniería, modelo de seguridad Zero-Trust y estrategia de fallback de alta disponibilidad.
        </p>
      </div>

      {/* 1. Arquitectura y Enrutador */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="var(--primary-glow)" /> 1. Arquitectura del Orquestador Desacoplado
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          El núcleo de <strong>HybridAgent</strong> reside en <code>src/orchestrator/</code>. A diferencia de las soluciones monolíticas tradicionales, las decisiones de cómputo están estrictamente desacopladas de la capa de ejecución (Workers) y del estado (Firestore).
        </p>

        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px' }}>Reglas de Evaluación Semántica:</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.8' }}>
            <li><strong>Estimación de Tokens:</strong> Longitud de caracteres / 3.8 con normalización de espacios.</li>
            <li><strong>Clasificador de Intención:</strong> Identifica si el prompt solicita código, razonamiento matemático, resúmenes o extracción de tareas estructuradas.</li>
            <li><strong>Umbral de Complejidad:</strong> Puntuación calculada de 0 a 100. Tareas con score &lt; 50 se dirigen a Gemini Nano.</li>
            <li><strong>Límite de Contexto On-Device:</strong> Límite de 9.216 tokens para inferencia local; todo volumen superior escala a la nube.</li>
          </ul>
        </div>
      </section>

      {/* 2. Escudo de Privacidad Zero-Trust */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color="var(--accent-rose)" /> 2. Escudo de Privacidad Zero-Trust (PII Redaction)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '18px' }}>
          Protección estricta de la información personal identificable (PII). El evaluador escanea expresiones regulares de alta precisión antes de despachar cualquier tarea para garantizar confidencialidad de grado empresarial:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>Correos Electrónicos</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enmascarados en logs como <code>[EMAIL_PROTEGIDO]</code>. Bloquea el envío a servidores de nube.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>API Keys y Tokens</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Detecta prefijos <code>sk-proj-</code>, <code>AIza</code>, <code>Bearer</code> y sustituye por <code>[API_KEY_CONFIDENCIAL]</code>.</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)' }}>Tarjetas y Credenciales</span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enmascarado como <code>[TARJETA_PROTEGIDA]</code> y forzado a ejecución on-device.</p>
          </div>
        </div>
      </section>

      {/* 3. Capacidades y Requisitos de Producción */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} color="var(--accent-emerald)" /> 3. Capacidades y Especificaciones de Producción
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { tag: 'Autenticación', text: 'Acceso seguro con Firebase Auth (Email/Contraseña y Sesión de Invitado)', status: 'Activo' },
            { tag: 'Inferencia Local', text: 'Ejecución on-device en hardware del cliente con Gemini Nano vía window.ai', status: 'Activo' },
            { tag: 'Inferencia Cloud', text: 'Procesamiento complejo en Gemini Cloud vía Firebase AI Logic con streaming', status: 'Activo' },
            { tag: 'Resiliencia Offline', text: 'Operación continua sin red (Modo Avión) con almacenamiento seguro en IndexedDB', status: 'Activo' },
            { tag: 'Sincronización', text: 'Drenado y reconciliación idempotente de tareas al reconectar a internet', status: 'Activo' },
            { tag: 'Auditoría Zero-Trust', text: 'Trazabilidad en tiempo real con razones de enrutamiento y enmascaramiento PII', status: 'Activo' },
            { tag: 'Exportación de Logs', text: 'Descarga de telemetría y auditoría técnica en formatos estándar JSON y CSV', status: 'Activo' },
            { tag: 'Optimización de Costos', text: 'Reducción demostrada de más del 50% en llamadas y costos de infraestructura cloud', status: '> 50%' },
            { tag: 'Seguridad App Check', text: 'Atestación criptográfica de integridad en peticiones salientes a Firebase', status: 'Activo' }
          ].map((r, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary-glow)' }}>
                  {r.tag}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{r.text}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
