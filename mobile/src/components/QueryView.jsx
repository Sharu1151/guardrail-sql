import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Copy, Check, ShieldCheck, ShieldAlert, 
  Sparkles, Database, Table, AlertCircle, Download, 
  Layers, ChevronDown, ChevronUp, Compass, ArrowRight,
  Share2, Cpu, Zap, Loader2
} from 'lucide-react';
import MobileChart from './MobileChart';
import FormattedMarkdown from './FormattedMarkdown';

const QUESTION_CATEGORIES = {
  "⭐ Demo Query (#41)": [
    "For each region, find the top 3 customers by total revenue. Show their total revenue, number of orders, average order value, percentage contribution to the region's total revenue, and rank them within their region."
  ],
  "🟢 Intermediate (1-10)": [
    "What is the total sales amount for each product?",
    "Which customer has made the highest total purchase?",
    "What is the average order value for each customer?",
    "Show the top 5 products by total revenue.",
    "How many orders were placed in each month?",
    "What is the total revenue generated in each region?",
    "Which sales representative generated the highest revenue?",
    "Show all customers whose total purchases are greater than 10,000.",
    "What is the average quantity sold for each product category?",
    "Which month had the highest total sales?"
  ],
  "🟡 Advanced (11-20)": [
    "Find the top 3 customers by revenue in each region.",
    "Which products have generated more revenue than the average revenue of all products?",
    "Find customers who have placed more orders than the average number of orders per customer.",
    "For each product category, find the product with the highest sales.",
    "Show the monthly revenue and the percentage change compared with the previous month.",
    "Which customers have purchased products from more than 3 different categories?",
    "Find the sales representative whose average order value is the highest.",
    "Which products have never been sold?",
    "Find customers who have not placed an order in the last 6 months.",
    "Show the top 10 orders with the highest total order value, along with customer name and sales representative."
  ],
  "🟠 Complex (21-30)": [
    "For each region, find the customer who generated the highest revenue and show their revenue compared with the regional average customer revenue.",
    "Find the top 5% of customers by total revenue and show their percentage contribution to overall revenue.",
    "Calculate the running total of monthly revenue for the entire sales period.",
    "For each customer, calculate their first purchase date, most recent purchase date, total orders, total revenue, and average order value.",
    "Find products whose revenue increased every consecutive month for at least 3 months.",
    "Identify customers whose spending in the most recent month is greater than their average monthly spending.",
    "For every product category, calculate total revenue, average revenue per product, highest-selling product, and percentage contribution to total company revenue.",
    "Find the second-highest revenue-generating customer in each region.",
    "Identify customers who purchased a product during their first order and then purchased the same product again in a later order.",
    "Find the month with the highest revenue for each region and show the revenue along with the region's yearly average monthly revenue."
  ],
  "🔴 Very Challenging (31-40)": [
    "Find customers whose total revenue is above the average revenue of customers in their respective region.",
    "For each month, rank the products by revenue within their category and return the top 3 products from each category.",
    "Find customers who have purchased every product in a particular product category.",
    "Calculate each customer's percentage contribution to their region's total revenue and rank customers within each region.",
    "Find the longest period of consecutive months in which total sales increased compared with the previous month.",
    "Identify products whose sales are consistently above the category's average monthly sales.",
    "For each customer, calculate the difference between their highest-value order and their average order value. Then rank customers by this difference.",
    "Find the customers who contributed to at least 5% of total company revenue and show their revenue, number of orders, and percentage contribution.",
    "Find the best-performing sales representative in each region based on total revenue, average order value, and number of customers.",
    "For each year, find the top 3 customers by revenue and determine whether each customer also appeared in the top 3 during the previous year."
  ],
  "🛡️ Security Guardrail": [
    "delete -- revenue",
    "DROP TABLE customers; -- attack simulation",
    "DELETE FROM sales_order WHERE 1=1",
    "ALTER TABLE products DROP COLUMN price"
  ]
};

export default function QueryView({ 
  onRunQuery, 
  loading, 
  lastResult, 
  error,
  hideVoiceButton = false,
  apiUrl = '',
  selectedPrompt = null
}) {
  const [question, setQuestion] = useState(selectedPrompt || '');
  const [submittedQuery, setSubmittedQuery] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);

  const LOADER_STAGES = [
    { title: "Interpreting Query with AI", subtitle: "Analyzing natural language intent via Gemini AI...", icon: Sparkles },
    { title: "AST Security Guardrail", subtitle: "Verifying read-only safety & AST compiler firewall...", icon: ShieldCheck },
    { title: "Querying Database Engine", subtitle: "Executing SQL against active sales database...", icon: Database },
    { title: "Synthesizing Direct Answer", subtitle: "Grounding factual response in live database records...", icon: Layers }
  ];

  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingStageIndex(0);
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStageIndex((prev) => (prev + 1) % LOADER_STAGES.length);
    }, 1400);
    const secTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(secTimer);
    };
  }, [loading]);

  // Question Explorer state
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedCat, setSelectedCat] = useState("⭐ Demo Query (#41)");

  // AST Inspector state
  const [showAst, setShowAst] = useState(false);

  const samplePrompts = [
    "For each region, find the top 3 customers by total revenue. Show their total revenue, number of orders, average order value, percentage contribution to the region's total revenue, and rank them within their region.",
    "What is the total sales amount for each product?",
    "Find the top 3 customers by revenue in each region.",
    "Calculate the running total of monthly revenue for the entire sales period.",
    "Find the longest period of consecutive months in which total sales increased compared with the previous month."
  ];

  // Sync external prompt selection
  useEffect(() => {
    if (selectedPrompt) {
      setQuestion(selectedPrompt);
    }
  }, [selectedPrompt]);

  // Speech to Text Web Speech API detection
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);


  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice("Voice search requires a browser with Web Speech support (Chrome/Edge on HTTPS).");
      setTimeout(() => setVoiceNotice(null), 4000);
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

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(null);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setVoiceNotice("Microphone permission denied. Enable microphone in browser settings or HTTPS.");
        } else if (e.error === 'network') {
          setVoiceNotice("Voice recognition network error. Verify internet connection.");
        }
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setVoiceNotice("Could not start voice search. Please type your query.");
      setTimeout(() => setVoiceNotice(null), 4000);
    }
  };

  const handleSend = (q = question) => {
    const trimmed = (q || '').trim();
    if (!trimmed || loading) return;
    setSubmittedQuery(trimmed);
    onRunQuery(trimmed);
  };

  const handleCopySql = () => {
    if (!lastResult?.sql) return;
    navigator.clipboard.writeText(lastResult.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mobile-Friendly CSV Export with Clipboard Copy, Native Share & Download fallback
  const handleExportCsv = async () => {
    if (!lastResult?.table_data || !lastResult.table_data.length) return;
    const cols = (Array.isArray(lastResult.columns) && lastResult.columns.length > 0)
      ? lastResult.columns
      : Object.keys(lastResult.table_data[0] || {});
    
    const header = cols.join(',');
    const rows = lastResult.table_data.map(row => 
      cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const filename = `sql_guard_${Date.now()}.csv`;

    let successMsg = "✅ CSV data copied to clipboard!";

    // 1. Always copy text to clipboard for 100% Android WebView reliability
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(csvContent);
      }
    } catch (clipErr) {
      console.warn("Clipboard write failed:", clipErr);
    }

    // 2. Try Android Native Share API (Text share works universally on Android)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SQL Guard CSV Export',
          text: csvContent.length > 4000 ? csvContent.slice(0, 4000) + "\n... (truncated for share, full copy in clipboard)" : csvContent
        });
        successMsg = "✅ Shared & copied to clipboard!";
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // 3. Trigger file download for browsers supporting downloads
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      // Ignore blob download failure in webview since clipboard/share already succeeded
    }

    setExportNotice(successMsg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Mobile-Friendly JSON Export with Clipboard Copy, Native Share & Download fallback
  const handleExportJson = async () => {
    if (!lastResult?.table_data || !lastResult.table_data.length) return;
    const jsonStr = JSON.stringify(lastResult.table_data, null, 2);
    const filename = `sql_guard_${Date.now()}.json`;

    let successMsg = "✅ JSON data copied to clipboard!";

    // 1. Copy JSON to clipboard for guaranteed mobile support
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
    } catch (clipErr) {
      console.warn("Clipboard write failed:", clipErr);
    }

    // 2. Try Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SQL Guard JSON Export',
          text: jsonStr.length > 4000 ? jsonStr.slice(0, 4000) + "\n... (truncated for share, full copy in clipboard)" : jsonStr
        });
        successMsg = "✅ Shared & copied to clipboard!";
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // 3. Blob download fallback
    try {
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      // Ignore
    }

    setExportNotice(successMsg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Only show results when user clicked Submit, input matches submitted query, and not currently loading
  const showResults = Boolean(
    lastResult && 
    submittedQuery && 
    question.trim().toLowerCase() === submittedQuery.toLowerCase() &&
    !loading
  );

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
            {!hideVoiceButton && speechSupported && (
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
              title="Submit Query"
              aria-label="Submit Query"
            >
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <Send size={18} />}
            </button>
          </div>
        </div>

        {/* Voice Feedback / Notice */}
        {voiceNotice && (
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', padding: '2px 8px' }}>
            {voiceNotice}
          </div>
        )}

        {/* Preset Prompt Chips */}
        <div className="chips-scroll-container">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => {
                setQuestion(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Categorized Question Explorer Accordion */}
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

        {/* Helper guidance when question is entered or chosen but Submit not yet clicked */}
        {question.trim() && !showResults && !loading && (
          <div className="submit-hint-pill">
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span>Tap the <strong>Submit</strong> button (<Send size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} />) to run and display data</span>
          </div>
        )}
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

      {/* Dynamic Animated AI Execution Loader */}
      {loading && (
        <div className="query-loader-card">
          <div className="loader-orbit-wrapper">
            <div className="loader-glow-halo" />
            <div className="loader-spinner-ring" />
            <div className="loader-center-icon">
              {React.createElement(LOADER_STAGES[loadingStageIndex].icon, {
                size: 22,
                className: "loader-pulse-icon",
                color: "var(--accent-cyan)"
              })}
            </div>
          </div>

          <div className="loader-text-block">
            <div className="loader-stage-header">
              <span className="loader-live-dot" />
              <h3 className="loader-title">{LOADER_STAGES[loadingStageIndex].title}</h3>
            </div>
            <p className="loader-subtitle">{LOADER_STAGES[loadingStageIndex].subtitle}</p>
            {elapsedSeconds >= 6 && (
              <p style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '6px', textAlign: 'center', opacity: 0.9 }}>
                ⚡ Communicating with Gemini AI & Cloud DB ({elapsedSeconds}s)...
              </p>
            )}
          </div>

          <div className="loader-progress-bar-container">
            <div className="loader-progress-bar-fill" />
          </div>

          {/* Shimmer Skeleton Placeholder */}
          <div className="loader-shimmer-box">
            <div className="shimmer-line shimmer-line-long" />
            <div className="shimmer-line shimmer-line-medium" />
            <div className="shimmer-line shimmer-line-short" />
          </div>
        </div>
      )}

      {/* Query Result Card - ONLY shown after explicit Submit click */}
      {showResults && (
        <>
          {/* Executive Direct Answer Card with Clean Formatted Markdown and Read Aloud (Point 5) */}
          <div className="ai-answer-card">
            <div className="card-title-row">
              <span className="card-title" style={{ fontSize: '0.9rem' }}>
                <Sparkles size={16} color="#A855F7" />
                AI Executive Direct Answer
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Security status badge */}
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
            </div>

            {/* Formatted Markdown */}
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

          {/* Generated SQL Block with Copy & Read Aloud Buttons */}
          {lastResult.sql && (
            <div className="mobile-card" style={{ padding: '12px' }}>
              <div className="card-title-row" style={{ marginBottom: '6px' }}>
                <span className="card-title" style={{ fontSize: '0.8rem' }}>
                  <Database size={14} color="var(--accent-cyan)" />
                  Synthesized SQL
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="copy-btn" onClick={handleCopySql}>
                    {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
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

          {/* Data Table Preview with Export CSV & JSON (Points 4, 11) */}
          {Array.isArray(lastResult.table_data) && lastResult.table_data.length > 0 && (
            <div className="mobile-card">
              <div className="card-title-row">
                <span className="card-title">
                  <Table size={16} color="var(--primary)" />
                  Query Results ({lastResult.table_data.length} rows)
                </span>
                {Array.isArray(lastResult.pii_masked_columns) && lastResult.pii_masked_columns.length > 0 && (
                  <span className="pii-tag">
                    🛡️ Masked: {lastResult.pii_masked_columns.join(', ')}
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
                    {/* Render exact rows returned without hardcoded slice limit (Point 11) */}
                    {lastResult.table_data.map((row, rIdx) => {
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

              {/* Instant Export Buttons with Mobile Share & Clipboard Support (Point 4) */}
              <div className="export-btn-group">
                <button type="button" className="export-btn" onClick={handleExportCsv} title="Copy, Share or Download CSV">
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                <button type="button" className="export-btn" onClick={handleExportJson} title="Copy, Share or Download JSON">
                  <Download size={13} />
                  <span>Export JSON</span>
                </button>
              </div>

              {exportNotice && (
                <div className="export-notice-toast">
                  {exportNotice}
                </div>
              )}
            </div>
          )}

          {/* Syntax Parse Tree (Point 7 - Sanitized from SQLGlot watermark) */}
          {Array.isArray(lastResult.ast_tree) && lastResult.ast_tree.length > 0 && (
            <div className="mobile-card" style={{ gap: '10px' }}>
              <div 
                className="card-title-row" 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAst(!showAst)}
              >
                <span className="card-title" style={{ fontSize: '0.85rem' }}>
                  <Layers size={15} color="var(--accent-cyan)" />
                  Syntax Parse Tree ({lastResult.ast_tree.length} nodes)
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

          {/* Executive Insights Bullet List */}
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

      {/* Initial Welcome Card when no query has run (Point 7 - Watermark free) */}
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
            Ask in plain English or tap the microphone icon. Your query is guarded by an enterprise AST compiler firewall and dynamic PII data masking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span className="guard-badge safe">🛡️ Enterprise AST Firewall</span>
            <span className="guard-badge safe">🔒 Dynamic PII Masking</span>
          </div>
        </div>
      )}
    </div>
  );
}
