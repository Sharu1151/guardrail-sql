import React from 'react';

/**
 * Clean, safe Markdown Formatter for AI Executive Answers & Insights.
 * Converts:
 *  - **bold text** -> <strong className="ai-bold-highlight">bold text</strong>
 *  - `code` -> <code className="ai-code-pill">code</code>
 *  - *italic* -> <em className="ai-italic">italic</em>
 * Strips raw markdown syntax cleanly so text is readable and visually pleasing.
 */
function parseInlineMarkdown(text) {
  if (!text) return [];
  const tokens = [];
  // Match **bold**, `code`, or *italic*
  const regex = /(\*\*(?:[^*]+)\*\*|`[^`]+`|\*(?:[^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**') && raw.length >= 4) {
      tokens.push({ type: 'bold', content: raw.slice(2, -2) });
    } else if (raw.startsWith('`') && raw.endsWith('`') && raw.length >= 2) {
      tokens.push({ type: 'code', content: raw.slice(1, -1) });
    } else if (raw.startsWith('*') && raw.endsWith('*') && raw.length >= 2) {
      tokens.push({ type: 'italic', content: raw.slice(1, -1) });
    } else {
      tokens.push({ type: 'text', content: raw });
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return tokens;
}

export default function FormattedMarkdown({ text, className = "" }) {
  if (!text) return null;

  // Split text by lines to preserve paragraph structure
  const lines = String(text).split('\n');

  return (
    <div className={`formatted-markdown-container ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} style={{ height: '8px' }} />;
        }

        // Check if line is a bullet point (- or * or numbered list like 1.)
        const isBullet = /^[*-]\s+/.test(trimmed);
        const isNumbered = /^\d+\.\s+/.test(trimmed);
        const cleanContent = isBullet 
          ? trimmed.replace(/^[*-]\s+/, '') 
          : isNumbered 
            ? trimmed.replace(/^\d+\.\s+/, '') 
            : trimmed;

        const tokens = parseInlineMarkdown(cleanContent);

        const renderedLine = tokens.map((token, tIdx) => {
          if (token.type === 'bold') {
            return (
              <strong key={tIdx} className="ai-bold-highlight">
                {token.content}
              </strong>
            );
          }
          if (token.type === 'code') {
            return (
              <code key={tIdx} className="ai-code-pill">
                {token.content}
              </code>
            );
          }
          if (token.type === 'italic') {
            return (
              <em key={tIdx} className="ai-italic">
                {token.content}
              </em>
            );
          }
          return <React.Fragment key={tIdx}>{token.content}</React.Fragment>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="markdown-bullet-row">
              <span className="markdown-bullet-dot">•</span>
              <div className="markdown-bullet-text">{renderedLine}</div>
            </div>
          );
        }

        if (isNumbered) {
          const matchNum = trimmed.match(/^(\d+)\./);
          const numStr = matchNum ? matchNum[1] : '';
          return (
            <div key={lineIdx} className="markdown-bullet-row">
              <span className="markdown-num-dot">{numStr}.</span>
              <div className="markdown-bullet-text">{renderedLine}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="markdown-paragraph">
            {renderedLine}
          </p>
        );
      })}
    </div>
  );
}
