import React, { useState, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Copy, Check, ShieldCheck, ShieldAlert, 
  Sparkles, Database, Table, AlertCircle, Download, 
  Layers, ChevronDown, ChevronUp, Compass, ArrowRight
} from 'lucide-react';
import MobileChart from './MobileChart';
import FormattedMarkdown from './FormattedMarkdown';

const QUESTION_CATEGORIES = {
  "Financial & Sales": [
    "Show total revenue and monthly sales trend for 2026",
    "Show total sales by channel",
    "Show monthly order volume and cumulative revenue for 2026"
  ],
  "Customer & PII": [
    "List top 5 customers with email and balance",
    "Show customer names and contact details",
    "Show customer distribution by territory and balance"
  ],
  "Product & Budget": [
    "What was the budget of Product 12?",
    "Top 5 products by total sales revenue",
    "Compare product budgets against actual sales performance"
  ],
  "Geographic & Population": [
    "Top 10 regions by population",
    "List states ordered by median household income",
    "Show regional sales distribution by state"
  ],
  "Database Schema": [
    "Show all relational tables and their row counts",
    "List column types and primary keys in customers table",
    "Describe foreign key relationships between orders and products"
  ],
  "Red-Team Security": [
    "DROP TABLE customers; -- attack simulation",
    "DELETE FROM sales_order WHERE 1=1",
    "SELECT * FROM users UNION SELECT credit_card FROM sensitive_vault"
  ]
};

export default function QueryView({ 
  onRunQuery, 
  loading, 
  lastResult, 
  error 
}) {
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Question Explorer state
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedCat, setSelectedCat] = useState("Financial & Sales");

  // AST Inspector state
  const [showAst, setShowAst] = useState(false);

  const samplePrompts = [
    "Top 5 products by total sales revenue",
    "Monthly revenue trend for 2026",
    "List top 5 customers with email and balance",
    "Show average order value by region",
    "DROP TABLE customers; -- attack simulation"
  ];

  // Speech to Text Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSend = (q = question) => {
    if (!q.trim() || loading) return;
    onRunQuery(q);
  };

  const handleCopySql = () => {
    if (!lastResult?.sql) return;
    navigator.clipboard.writeText(lastResult.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!lastResult?.table_data || !lastResult.table_data.length) return;
    const cols = (Array.isArray(lastResult.columns) && lastResult.columns.length > 0)
      ? lastResult.columns
      : Object.keys(lastResult.table_data[0] || {});
    
    const header = cols.join(',');
    const rows = lastResult.table_data.map(row => 
      cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sql_guard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (!lastResult?.table_data) return;
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lastResult.table_data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", `sql_guard_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tab-content">
      {/* Search Input Box */}
      <div className="query-box-container">
        <div className="input-glow-wrapper">
          <textarea
            className="query-textarea"
            placeholder="Ask anything about your database in plain English..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={2}
          />
          <div className="action-buttons">
            {speechSupported && (
              <button 
                type="button"
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceInput}
                title={isListening ? 'Listening...' : 'Voice Query'}
                aria-label="Voice Query"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            <button
              type="button"
              className="send-btn"
              onClick={() => handleSend()}
              disabled={!question.trim() || loading}
              aria-label="Send Query"
            >
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <Send size={18} />}
            </button>
          </div>
        </div>

        {/* Preset Prompt Chips */}
        <div className="chips-scroll-container">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => {
                setQuestion(p);
                handleSend(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Website Feature Parity: Categorized Question Explorer Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            type="button"
            className="explorer-toggle-btn"
            onClick={() => setShowExplorer(!showExplorer)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={15} color="var(--accent-cyan)" />
              Question Explorer ({Object.keys(QUESTION_CATEGORIES).length} Categories)
            </span>
            {showExplorer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showExplorer && (
            <div className="mobile-card" style={{ gap: '10px', padding: '12px' }}>
              <div className="category-tabs-scroll">
                {Object.keys(QUESTION_CATEGORIES).map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    className={`cat-chip ${selectedCat === catName ? 'active' : ''}`}
                    onClick={() => setSelectedCat(catName)}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              <div className="prompt-list-box">
                {QUESTION_CATEGORIES[selectedCat]?.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="prompt-item-row"
                    onClick={() => {
                      setQuestion(promptText);
                      handleSend(promptText);
                    }}
                  >
                    <span style={{ flex: 1 }}>{promptText}</span>
                    <ArrowRight size={13} color="var(--primary)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mobile-card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Error Processing Query</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{error}</p>
        </div>
      )}

      {/* Query Result Card */}
      {lastResult && (
        <>
          {/* Executive Direct Answer Card with Clean Formatted Markdown */}
          <div className="ai-answer-card">
            <div className="card-title-row">
              <span className="card-title" style={{ fontSize: '0.9rem' }}>
                <Sparkles size={16} color="#A855F7" />
                AI Executive Direct Answer
              </span>
              {/* Security Guardrail status badge */}
              {lastResult.security?.is_safe ? (
                <span className="guard-badge safe">
                  <ShieldCheck size={13} />
                  Safe SQL
                </span>
              ) : (
                <span className="guard-badge blocked">
                  <ShieldAlert size={13} />
                  Blocked Attack
                </span>
              )}
            </div>

            {/* Clean Markdown Formatter handles **bold** highlights & clean text */}
            <FormattedMarkdown 
              text={lastResult.direct_answer || lastResult.query_explanation || (lastResult.security?.reason || "Query processed successfully.")} 
            />

            {/* Cost and Engine info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span>Engine: <strong style={{ color: 'var(--accent-cyan)' }}>{lastResult.active_engine}</strong></span>
              {lastResult.cost_check && (
                <span>Cost Score: <strong style={{ color: lastResult.cost_check.is_safe ? 'var(--success)' : 'var(--danger)' }}>
                  {lastResult.cost_check.estimated_cost ?? 'Low (Safe)'}
                </strong></span>
              )}
            </div>
          </div>

          {/* Generated SQL Block */}
          {lastResult.sql && (
            <div className="mobile-card" style={{ padding: '12px' }}>
              <div className="card-title-row" style={{ marginBottom: '6px' }}>
                <span className="card-title" style={{ fontSize: '0.8rem' }}>
                  <Database size={14} color="var(--accent-cyan)" />
                  Synthesized SQL
                </span>
                <button className="copy-btn" onClick={handleCopySql}>
                  {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="sql-box">
                {lastResult.sql}
              </div>
            </div>
          )}

          {/* KPI Stat Cards */}
          {lastResult.kpis && typeof lastResult.kpis === 'object' && Object.keys(lastResult.kpis).length > 0 && (
            <div className="kpi-grid">
              {Object.entries(lastResult.kpis).slice(0, 4).map(([key, val], idx) => {
                const displayVal = (typeof val === 'object' && val !== null)
                  ? JSON.stringify(val)
                  : (typeof val === 'number' ? val.toLocaleString() : String(val ?? ''));
                return (
                  <div key={idx} className="kpi-card">
                    <span className="kpi-label">{String(key).replace(/_/g, ' ')}</span>
                    <span className="kpi-value">{displayVal}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Chart Visualization */}
          {lastResult.chart && (
            <MobileChart chartData={lastResult.chart} />
          )}

          {/* Data Table Preview with Export CSV & JSON (Website Parity) */}
          {Array.isArray(lastResult.table_data) && lastResult.table_data.length > 0 && (
            <div className="mobile-card">
              <div className="card-title-row">
                <span className="card-title">
                  <Table size={16} color="var(--primary)" />
                  Query Results ({lastResult.table_data.length} rows)
                </span>
                {Array.isArray(lastResult.pii_masked_columns) && lastResult.pii_masked_columns.length > 0 && (
                  <span className="pii-tag">
                    🛡️ PII Masked: {lastResult.pii_masked_columns.join(', ')}
                  </span>
                )}
              </div>

              <div className="table-scroll-container">
                <table className="mobile-table">
                  <thead>
                    <tr>
                      {(Array.isArray(lastResult.columns) && lastResult.columns.length > 0 
                        ? lastResult.columns 
                        : Object.keys(lastResult.table_data[0] || {})).map((col, idx) => (
                        <th key={idx}>
                          {String(col)}
                          {Array.isArray(lastResult.pii_masked_columns) && lastResult.pii_masked_columns.includes(col) && (
                            <span className="pii-tag">MASKED</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lastResult.table_data.slice(0, 8).map((row, rIdx) => {
                      const cols = Array.isArray(lastResult.columns) && lastResult.columns.length > 0
                        ? lastResult.columns
                        : Object.keys(row || {});
                      return (
                        <tr key={rIdx}>
                          {cols.map((col, cIdx) => (
                            <td key={cIdx}>
                              {typeof row?.[col] === 'object' ? JSON.stringify(row[col]) : String(row?.[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Instant Export Buttons matching website functionality */}
              <div className="export-btn-group">
                <button type="button" className="export-btn" onClick={handleExportCsv}>
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                <button type="button" className="export-btn" onClick={handleExportJson}>
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* AST Static Compiler Nodes & Parse Tree (Website Parity) */}
          {Array.isArray(lastResult.ast_tree) && lastResult.ast_tree.length > 0 && (
            <div className="mobile-card" style={{ gap: '10px' }}>
              <div 
                className="card-title-row" 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAst(!showAst)}
              >
                <span className="card-title" style={{ fontSize: '0.85rem' }}>
                  <Layers size={15} color="var(--accent-cyan)" />
                  SQLGlot AST Parse Tree ({lastResult.ast_tree.length} nodes)
                </span>
                {showAst ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {showAst && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {lastResult.ast_tree.slice(0, 15).map((node, nIdx) => (
                    <div key={nIdx} className="ast-node-card">
                      <div className="ast-node-header">
                        <span className="ast-node-type">{node.node_type}</span>
                        <span className="guard-badge safe" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                          {node.status || "Permitted"}
                        </span>
                      </div>
                      <div className="ast-node-preview">
                        {node.preview}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Executive Insights Bullet List with Clean Markdown */}
          {Array.isArray(lastResult.executive_insights) && lastResult.executive_insights.length > 0 && (
            <div className="mobile-card">
              <span className="card-title">
                <Sparkles size={16} color="var(--accent-purple)" />
                Executive Takeaways
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lastResult.executive_insights.map((insight, idx) => (
                  <div key={idx} className="markdown-bullet-row">
                    <span className="markdown-bullet-dot">•</span>
                    <div className="markdown-bullet-text">
                      <FormattedMarkdown text={String(insight)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial Welcome Card when no query has run */}
      {!lastResult && !loading && (
        <div className="mobile-card" style={{ textAlign: 'center', padding: '24px 16px', gap: '14px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            margin: '0 auto', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-glow)'
          }}>
            <Sparkles size={28} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
            Enterprise SQL at your Fingertips
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Ask in plain English or tap the microphone icon. Your query is guarded by an AST SQL compiler firewall and dynamic SHA-256 PII masking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span className="guard-badge safe">🛡️ SQLGlot AST Firewall</span>
            <span className="guard-badge safe">🔒 SHA-256 PII Masking</span>
          </div>
        </div>
      )}
    </div>
  );
}
