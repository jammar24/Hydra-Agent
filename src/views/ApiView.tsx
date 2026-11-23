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
  maxLocalTokens: 9216,
  cloudTimeoutMs: 8000,
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
console.log("Technical rationale:", result.decision.reason);
console.log("Complexity score:", result.decision.breakdown.complexityScore); // 0 - 100
console.log("Confidence certainty:", result.decision.breakdown.confidenceScore + "%");
console.log("Estimated cost saved:", "$" + result.decision.breakdown.estimatedCostUSD);`;

  const windowAIExample = `// Chrome Desktop Prompt API native initialization
if (window.ai?.languageModel) {
  const capabilities = await window.ai.languageModel.capabilities();
  
  if (capabilities.available === 'readily') {
    const session = await window.ai.languageModel.create({
      systemPrompt: "You are Gemini Nano, a high-speed on-device model."
    });

    const stream = session.promptStreaming("Extract structured tasks into JSON...");
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
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{t.api_header_title}</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
          {t.api_header_desc}
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
            {copiedId === 'dispatch' ? t.api_btn_copied : t.api_btn_copy}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t.api_method1_desc}
        </p>

        <pre style={{
          background: 'rgba(0, 0, 0, 0.4)', padding: '18px 22px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto'
        }}>
          {dispatchExample}
        </pre>
      </section>

      {/* Endpoint 2: window.ai */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>DEVICE API</span>
            <code>window.ai.languageModel (Chrome Prompt API)</code>
          </h2>
          <button
            onClick={() => copyCode('windowai', windowAIExample)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedId === 'windowai' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copiedId === 'windowai' ? t.api_btn_copied : t.api_btn_copy}
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
          {t.api_method2_desc}
        </p>

        <pre style={{
          background: 'rgba(0, 0, 0, 0.4)', padding: '18px 22px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px',
          color: 'var(--text-main)', lineHeight: '1.6', overflowX: 'auto'
        }}>
          {windowAIExample}
        </pre>
      </section>

    </div>
  );
};
