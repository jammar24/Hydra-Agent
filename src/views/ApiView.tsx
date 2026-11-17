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
  initialMode: 'auto'
});

// Despachar tarea con evaluación en tiempo real
const result = await orchestrator.dispatch(
  "Analizar backlog del sprint y extraer tareas prioritarias",
  navigator.onLine,
  "user_jamar",
  (tokenChunk) => {
    // Callback opcional para streaming de tokens
    console.log(tokenChunk);
  }
);

console.log("Ruta seleccionada:", result.decision.target); // 'local' | 'cloud' | 'queue'
console.log("Razón técnica:", result.decision.reason);
console.log("Score de complejidad:", result.decision.breakdown.complexityScore);`;

  const windowAIExample = `// Detección e inicialización nativa de Gemini Nano en Chrome Desktop >= 139
if (window.ai?.languageModel) {
  const capabilities = await window.ai.languageModel.capabilities();
  
  if (capabilities.available === 'readily') {
    const session = await window.ai.languageModel.create({
      systemPrompt: "Eres Gemini Nano, un modelo on-device de alta velocidad."
    });

    const stream = session.promptStreaming("Extraer tareas en JSON...");
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  }
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '10px 0 60px' }}>
      
      {/* Header API */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Code2 size={28} color="var(--primary-amber)" />
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Referencia de API del Orquestador</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          Interfaces públicas, clases y métodos para integrar el enrutador híbrido de HybridAgent en cualquier aplicación Web o extensión de Chrome.
        </p>
      </div>

      {/* Endpoint 1: dispatch */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255, 111, 0, 0.2)', color: 'var(--primary-orange)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>METHOD</span>
            <code>orchestrator.dispatch(prompt, isOnline, userId, onToken)</code>
          </h2>
          <button
            onClick={() => copyCode('dispatch', dispatchExample)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'dispatch' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'dispatch' ? 'Copiado' : 'Copiar Código'}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Evalúa la entrada contra las reglas de complejidad, PII y conectividad. Dirige automáticamente el flujo al <code>LocalWorker</code>, <code>CloudWorker</code> o a la cola offline de Firestore.
        </p>

        <pre style={{ background: '#0a0c10', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', overflowX: 'auto', fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#e2e8f0', lineHeight: '1.6' }}>
          <code>{dispatchExample}</code>
        </pre>
      </section>

      {/* Endpoint 2: window.ai */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.2)', color: 'var(--accent-cyan)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>CHROME API</span>
            <code>window.ai.languageModel (Prompt API)</code>
          </h2>
          <button
            onClick={() => copyCode('windowai', windowAIExample)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'windowai' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'windowai' ? 'Copiado' : 'Copiar Código'}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Integración nativa con el motor Gemini Nano del navegador. Permite streaming de texto en tiempo real sin salir a la red.
        </p>

        <pre style={{ background: '#0a0c10', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px', overflowX: 'auto', fontSize: '13px', fontFamily: 'var(--font-mono)', color: '#e2e8f0', lineHeight: '1.6' }}>
          <code>{windowAIExample}</code>
        </pre>
      </section>

    </div>
  );
};

