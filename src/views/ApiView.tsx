import React from 'react';
import { Code2, Terminal, Copy, Check, ExternalLink, Zap } from 'lucide-react';

export const ApiView: React.FC = () => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dispatchExample = `import { HybridOrchestrator } from './orchestrator';

const orchestrator = new HybridOrchestrator({
  maxLocalTokens: 9216,
  cloudTimeoutMs: 8000,
  initialMode: 'auto' // 'auto' | 'cascade' | 'local_only' | 'cloud_only'
});

// Despachar tarea con evaluación en tiempo real (< 50ms)
const result = await orchestrator.dispatch(
  "Analizar arquitectura del backlog y extraer tareas prioritarias",
  navigator.onLine,
  "user_jamar",
  (tokenChunk) => {
    // Streaming de tokens en vivo (Nano o Cloud)
    process.stdout.write(tokenChunk);
  }
);

console.log("Ruta seleccionada:", result.decision.target); // 'local' | 'cloud' | 'cascade' | 'queue'
console.log("Razón técnica explicable:", result.decision.reason);
console.log("Score de complejidad:", result.decision.breakdown.complexityScore); // 0 - 100
console.log("Certeza de enrutamiento:", result.decision.breakdown.confidenceScore + "%");
console.log("Ahorro estimado en nube:", "$" + result.decision.breakdown.estimatedCostUSD);`;

  const windowAIExample = `// Detección e inicialización nativa de Gemini Nano en Chrome Desktop >= 139
if (window.ai?.languageModel) {
  const capabilities = await window.ai.languageModel.capabilities();
  
  if (capabilities.available === 'readily') {
    const session = await window.ai.languageModel.create({
      systemPrompt: "Eres Gemini Nano, un modelo on-device de alta velocidad."
    });

    const stream = session.promptStreaming("Extraer tareas estructuradas en JSON...");
    for await (const chunk of stream) {
      console.log(chunk);
    }
  }
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '10px 0 60px' }}>
      
      {/* Header API */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={22} color="var(--primary-glow)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Referencia de API del Orquestador</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          Interfaces públicas, clases y métodos para integrar el enrutador híbrido de HybridAgent en cualquier aplicación Web o extensión de Chrome.
        </p>
      </div>

      {/* Endpoint 1: dispatch */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-glow)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>METHOD</span>
            <code>orchestrator.dispatch(prompt, isOnline, userId, onToken)</code>
          </h2>
          <button
            onClick={() => copyCode('dispatch', dispatchExample)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'dispatch' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'dispatch' ? 'Copiado' : 'Copiar Código'}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Evalúa la entrada contra las reglas de complejidad, PII y conectividad. Dirige automáticamente el flujo al <code>LocalWorker</code>, <code>CloudWorker</code>, modo de co-inferencia en <code>cascade</code> o a la cola offline de IndexedDB.
        </p>

        <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', overflowX: 'auto', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <code>{dispatchExample}</code>
        </pre>
      </section>

      {/* Endpoint 2: window.ai */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>CHROME API</span>
            <code>window.ai.languageModel (Prompt API)</code>
          </h2>
          <button
            onClick={() => copyCode('windowai', windowAIExample)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'windowai' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'windowai' ? 'Copiado' : 'Copiar Código'}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Integración directa con el modelo Gemini Nano alojado en el hardware del dispositivo. No requiere conexión a internet y mantiene los datos privados en la memoria local.
        </p>

        <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', overflowX: 'auto', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: '1.6' }}>
          <code>{windowAIExample}</code>
        </pre>
      </section>

    </div>
  );
};
