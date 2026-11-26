import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  copyLabel?: string;
  copiedLabel?: string;
}

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={`ic_${key++}`}
          style={{
            background: 'var(--bg-stripe)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9em',
            color: 'var(--accent-cyan)',
            wordBreak: 'break-word'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={`b_${key++}`} style={{ color: 'var(--text-main)', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={`i_${key++}`} style={{ color: 'var(--text-muted)' }}>
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }
  return tokens;
}

const CodeBlock: React.FC<{ lang: string; code: string; copyLabel: string; copiedLabel: string }> = ({
  lang,
  code,
  copyLabel,
  copiedLabel
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        margin: '10px 0',
        borderRadius: '10px',
        border: '1px solid var(--border-mid)',
        background: '#06090f',
        overflow: 'hidden',
        maxWidth: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8'
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '6px',
            color: copied ? '#10b981' : '#e2e8f0',
            padding: '3px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {copied ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '12px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: 1.6,
          color: '#e2e8f0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          whiteSpace: 'pre'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  copyLabel = 'Copiar código',
  copiedLabel = 'Copiado'
}) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      elements.push(
        <CodeBlock
          key={`cb_${blockKey++}`}
          lang={lang}
          code={codeLines.join('\n')}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
        />
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      elements.push(
        <hr
          key={`hr_${blockKey++}`}
          style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }}
        />
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      elements.push(
        <h3 key={`h3_${blockKey++}`} style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)', margin: '12px 0 6px' }}>
          {renderInline(h3[1])}
        </h3>
      );
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      elements.push(
        <h2 key={`h2_${blockKey++}`} style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-main)', margin: '14px 0 6px' }}>
          {renderInline(h2[1])}
        </h2>
      );
      i++;
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      elements.push(
        <h1 key={`h1_${blockKey++}`} style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '14px 0 8px' }}>
          {renderInline(h1[1])}
        </h1>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul_${blockKey++}`} style={{ paddingLeft: '20px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol_${blockKey++}`} style={{ paddingLeft: '20px', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={`p_${blockKey++}`}
        style={{
          fontSize: '13px',
          color: 'var(--text-main)',
          lineHeight: 1.65,
          margin: '5px 0',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word'
        }}
      >
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ width: '100%', minWidth: 0 }}>{elements}</div>;
};
