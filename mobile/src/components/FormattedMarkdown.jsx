import React from 'react';

/**
 * Clean, safe Markdown Formatter for AI Executive Answers & Insights.
 * Converts:
 *  - **bold text** -> <strong className="ai-bold-highlight">bold text</strong>
 *  - `code` -> <code className="ai-code-pill">code</code>
 *  - *italic* -> <em className="ai-italic">italic</em>
 * Strips raw markdown syntax cleanly so text is readable and visually pleasing.
 */
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

        // Split by markdown delimiters: **bold**, `code`, *italic*
        const parts = cleanContent.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return (
              <strong key={pIdx} className="ai-bold-highlight">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
            return (
              <code key={pIdx} className="ai-code-pill">
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            return (
              <em key={pIdx} className="ai-italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
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
