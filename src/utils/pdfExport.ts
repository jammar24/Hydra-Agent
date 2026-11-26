import { WorkerExecutionResult } from '../orchestrator/types';
import { RoutingEvaluator } from '../orchestrator/rules/evaluator';

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMarkdownToSafeHtml(markdown: string): string {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, '\n'));
  const lines = escaped.split('\n');
  const out: string[] = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuf = [];
      } else {
        out.push(
          `<div class="code-box"><div class="code-lang">${codeLang || 'code'}</div><pre><code>${codeBuf.join('\n')}</code></pre></div>`
        );
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      out.push('<hr />');
      continue;
    }
    if (/^###\s+/.test(line)) {
      out.push(`<h3>${line.replace(/^###\s+/, '')}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      out.push(`<h2>${line.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      out.push(`<h1>${line.replace(/^#\s+/, '')}</h1>`);
      continue;
    }
    const formatted = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
    if (/^\s*[-*]\s+/.test(formatted)) {
      out.push(`<div class="li">&bull; ${formatted.replace(/^\s*[-*]\s+/, '')}</div>`);
    } else if (!formatted.trim()) {
      out.push('<div class="spacer"></div>');
    } else {
      out.push(`<p>${formatted}</p>`);
    }
  }

  if (inCode && codeBuf.length > 0) {
    out.push(`<div class="code-box"><pre><code>${codeBuf.join('\n')}</code></pre></div>`);
  }

  return out.join('\n');
}

export function exportTaskResultToPdf(result: WorkerExecutionResult, lang: 'es' | 'en'): void {
  const safeContent = RoutingEvaluator.redactPII(result.content);
  const safePrompt = RoutingEvaluator.redactPII(result.prompt || result.summary || 'N/A');
  const headLabel = result.source.toUpperCase();
  const dateStr = new Date(result.timestamp || Date.now()).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US');

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>HYDRA — ${escapeHtml(result.taskId)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 32px 36px;
      line-height: 1.55;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .brand { font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: 0.04em; }
    .sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .meta { text-align: right; font-size: 11px; color: #475569; font-family: monospace; }
    .section { margin-bottom: 18px; }
    .label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #4f46e5;
      margin-bottom: 6px;
    }
    .prompt-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      color: #1e293b;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .metric {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .metric-k { font-size: 10px; color: #64748b; text-transform: uppercase; }
    .metric-v { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .response-box {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px 18px;
      background: #ffffff;
    }
    .response-box h1 { font-size: 16px; margin: 12px 0 6px; color: #0f172a; }
    .response-box h2 { font-size: 14px; margin: 10px 0 5px; color: #1e293b; }
    .response-box h3 { font-size: 13px; margin: 8px 0 4px; color: #334155; }
    .response-box p { margin: 5px 0; }
    .response-box .li { margin: 3px 0 3px 12px; }
    .response-box .spacer { height: 6px; }
    .response-box hr { border: none; border-top: 1px solid #e2e8f0; margin: 10px 0; }
    .code-box {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 6px;
      margin: 10px 0;
      overflow: hidden;
    }
    .code-lang {
      background: #1e293b;
      color: #94a3b8;
      font-size: 10px;
      text-transform: uppercase;
      padding: 4px 10px;
      font-family: monospace;
    }
    .code-box pre {
      margin: 0;
      padding: 10px 12px;
      font-family: monospace;
      font-size: 11.5px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    code.inline {
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11.5px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">HYDRA — Hybrid AI Orchestrator</div>
      <div class="sub">${lang === 'es' ? 'Reporte Técnico de Inferencia & Vector XAI' : 'Technical Inference & XAI Vector Report'}</div>
    </div>
    <div class="meta">
      <div>ID: ${escapeHtml(result.taskId)}</div>
      <div>${escapeHtml(dateStr)}</div>
    </div>
  </div>

  <div class="section">
    <div class="label">${lang === 'es' ? 'Prompt Enviado' : 'Submitted Prompt'}</div>
    <div class="prompt-box">${escapeHtml(safePrompt)}</div>
  </div>

  <div class="section">
    <div class="label">${lang === 'es' ? 'Métricas del Vector XAI' : 'XAI Vector Metrics'}</div>
    <div class="metrics">
      <div class="metric">
        <div class="metric-k">${lang === 'es' ? 'Cabeza' : 'Head'}</div>
        <div class="metric-v">${escapeHtml(headLabel)}</div>
      </div>
      <div class="metric">
        <div class="metric-k">${lang === 'es' ? 'Certeza' : 'Confidence'}</div>
        <div class="metric-v">${result.breakdown.confidenceScore}%</div>
      </div>
      <div class="metric">
        <div class="metric-k">${lang === 'es' ? 'Latencia' : 'Latency'}</div>
        <div class="metric-v">${result.latencyMs} ms</div>
      </div>
      <div class="metric">
        <div class="metric-k">${lang === 'es' ? 'Costo Evitado' : 'Saved Cost'}</div>
        <div class="metric-v">+$${result.breakdown.estimatedCostUSD.toFixed(5)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="label">${lang === 'es' ? 'Respuesta Generada' : 'Generated Response'}</div>
    <div class="response-box">
      ${formatMarkdownToSafeHtml(safeContent)}
    </div>
  </div>

  <div class="footer">
    <span>HYDRA Agent AI · Apache-2.0</span>
    <span>${lang === 'es' ? 'PII Zero-Trust Redacted' : 'PII Zero-Trust Redacted'}</span>
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=700');
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 300);
  }
}
