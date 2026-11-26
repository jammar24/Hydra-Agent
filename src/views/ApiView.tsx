import React from 'react';
import { Code2, Terminal, Copy, Check, ExternalLink, Zap } from 'lucide-react';
import { Language, translations } from '../i18n';

interface ApiViewProps {
  lang: Language;
}

export const ApiView: React.FC<ApiViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dispatchExample = `import { HybridOrchestrator } from './orchestrator';

const orchestrator = new HybridOrchestrator({
  defaultCloudModel: 'gemini-3.5-flash-lite',
  maxLocalTokens: 9216,
  cloudTimeoutMs: 20000,
  initialMode: 'auto' // 'auto' | 'cascade' | 'local_only' | 'cloud_only'
});

// Dispatch task with real-time semantic evaluation (< 50ms)
const result = await orchestrator.dispatch(
  "Analyze backlog architecture and extract priority tasks",
  navigator.onLine,
  "user_123",
  (tokenChunk) => {
    // Word-by-word streaming token callback
    process.stdout.write(tokenChunk);
  }
);

console.log("Selected route:", result.decision.target); // 'local' | 'cloud' | 'cascade' | 'queue'
console.log("Response content:", result.result?.content);
console.log("Technical rationale:", result.decision.reason);
console.log("Complexity score:", result.decision.breakdown.complexityScore); // 0 - 100
console.log("Confidence certainty:", result.decision.breakdown.confidenceScore + "%");
console.log("Estimated cost saved:", "$" + result.decision.breakdown.estimatedCostUSD);`;

  const localInitExample = `import { HybridOrchestrator } from './orchestrator';

const orchestrator = new HybridOrchestrator();
const localWorker = orchestrator.getLocalWorker();

// Check native Chrome Prompt API availability and initialize session
const isNative = await localWorker.checkNativeAvailability();
await localWorker.initializeDeviceModel((progressPct) => {
  console.log(\`Loading on-device model: \${progressPct}%\`);
});

const status = localWorker.getStatus();
console.log("Ready:", status.isReady, "Native hardware:", status.isNative);`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '4px 0 24px' }}>
      
      {/* Header API */}
      <div className="glass-panel" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={22} color="var(--primary-glow)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{t.api_header_title}</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          {t.api_header_desc}
        </p>
      </div>

      {/* Endpoint 1: dispatch */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', minWidth: 0 }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-glow)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>METHOD</span>
            <code style={{ wordBreak: 'break-word' }}>{t.api_method1_title}</code>
          </h2>
          <button
            onClick={() => copyCode('dispatch', dispatchExample)}
            className="btn-ghost"
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'dispatch' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'dispatch' ? t.api_btn_copied : t.api_btn_copy}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t.api_method1_desc}
        </p>

        <pre style={{
          background: 'var(--bg-code)', padding: '16px 18px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch'
        }}>
          {dispatchExample}
        </pre>
      </section>

      {/* Endpoint 2: localWorker */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', minWidth: 0 }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>DEVICE API</span>
            <code style={{ wordBreak: 'break-word' }}>{t.api_method2_title}</code>
          </h2>
          <button
            onClick={() => copyCode('localinit', localInitExample)}
            className="btn-ghost"
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'localinit' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'localinit' ? t.api_btn_copied : t.api_btn_copy}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t.api_method2_desc}
        </p>

        <pre style={{
          background: 'var(--bg-code)', padding: '16px 18px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch'
        }}>
          {localInitExample}
        </pre>
      </section>

      {/* Endpoint 3: Env & Cloud REST + Audit Export */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', minWidth: 0 }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>CLOUD & AUDIT</span>
            <code style={{ wordBreak: 'break-word' }}>CloudWorker &amp; Export API</code>
          </h2>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {lang === 'es'
            ? 'Configuración de variables de entorno para inferencia en vivo con Gemini Cloud (timeout de 20s y trazabilidad explícita [Fallback: ...] ante errores HTTP/red) junto con exportación sanitizada JSON/CSV.'
            : 'Environment configuration for live Gemini Cloud inference (20s timeout and explicit [Fallback: ...] surfacing on HTTP/network errors) alongside sanitized JSON/CSV audit exports.'}
        </p>

        <pre style={{
          background: 'var(--bg-code)', padding: '16px 18px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch'
        }}>
{`# .env.local / Vercel Environment Variables
VITE_DEFAULT_CLOUD_MODEL=gemini-3.5-flash-lite
VITE_LOCAL_MODEL_MAX_TOKENS=9216
VITE_CLOUD_TIMEOUT_MS=20000
VITE_GEMINI_API_KEY=<your-gemini-api-key>

// Export sanitized audit telemetry (formula-injection safe CSV & JSON)
const jsonLogs = orchestrator.exportAuditLogsAsJSON();
const csvLogs  = orchestrator.exportAuditLogsAsCSV();`}
        </pre>
      </section>

    </div>
  );
};
