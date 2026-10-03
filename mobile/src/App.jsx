import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import QueryView from './components/QueryView';
import AnalyticsView from './components/AnalyticsView';
import SecurityGuardView from './components/SecurityGuardView';
import SchemaView from './components/SchemaView';
import SettingsView from './components/SettingsView';
import ErrorBoundary from './components/ErrorBoundary';

// Pre-defined mock data for offline resilience so the app works directly out of the box
const MOCK_PRESETS = {
  "top 5 products by total sales revenue": {
    success: true,
    question: "Top 5 products by total sales revenue",
    sql: "SELECT product_name, SUM(total_amount) AS revenue FROM orders JOIN products ON orders.product_id = products.product_id GROUP BY product_name ORDER BY revenue DESC LIMIT 5;",
    direct_answer: "The top revenue driver is Cloud Enterprise Suite ($54,200), followed by Database Guard Pro ($41,800) and Analytics Engine ($32,500).",
    active_engine: "postgres",
    security: { is_safe: true, reason: "Single read-only SELECT validated by AST compiler." },
    cost_check: { is_safe: true, estimated_cost: "0.04 ms (Indexed)" },
    kpis: {
      total_top_revenue: "$158,400",
      leading_product: "Cloud Enterprise",
      growth_mom: "+18.4%",
      margin_avg: "72%"
    },
    chart: {
      title: "Top Products by Revenue",
      x_column: "Product",
      y_column: "Revenue",
      data: [
        { Product: "Cloud Enterprise", Revenue: 54200 },
        { Product: "Database Guard", Revenue: 41800 },
        { Product: "Analytics Pro", Revenue: 32500 },
        { Product: "API Firewall", Revenue: 18400 },
        { Product: "Audit Vault", Revenue: 11500 }
      ]
    },
    columns: ["product_name", "revenue"],
    pii_masked_columns: [],
    table_data: [
      { product_name: "Cloud Enterprise Suite", revenue: "$54,200" },
      { product_name: "Database Guard Pro", revenue: "$41,800" },
      { product_name: "Analytics Engine", revenue: "$32,500" },
      { product_name: "API Firewall Gateway", revenue: "$18,400" },
      { product_name: "Audit Vault Storage", revenue: "$11,500" }
    ],
    executive_insights: [
      "Enterprise Cloud Suite contributes 34% of overall portfolio revenue.",
      "High retention noted for security & database infrastructure products.",
      "Recommended: Bundle Analytics Pro with Database Guard for mid-market upselling."
    ]
  },
  "drop table customers; -- attack simulation": {
    success: false,
    question: "DROP TABLE customers; -- attack simulation",
    sql: "DROP TABLE customers; -- attack simulation",
    direct_answer: "🚨 SECURITY ALERT: SQLGlot AST Compiler Firewall BLOCKED this query! DDL statements ('DROP', 'ALTER', 'DELETE', 'TRUNCATE') are strictly forbidden.",
    active_engine: "sqlite",
    security: {
      is_safe: false,
      reason: "AST Firewall Alert: Unauthorized DDL execution statement 'DROP TABLE' detected and rejected."
    },
    cost_check: { is_safe: false, estimated_cost: "BLOCKED" },
    kpis: {
      attack_type: "SQL Injection",
      threat_level: "CRITICAL (Neutralized)",
      firewall_latency: "0.8 ms",
      pii_exposure: "0 records"
    },
    columns: ["status", "attack_vector", "action_taken"],
    pii_masked_columns: [],
    table_data: [
      { status: "BLOCKED", attack_vector: "DROP TABLE DDL", action_taken: "Execution Terminated" }
    ],
    executive_insights: [
      "SQLGlot AST parser intercepted destructive syntax prior to database execution.",
      "Audit trail counter updated: +1 malicious attempt blocked.",
      "Database schema integrity remains 100% protected."
    ]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('query');

  const publicCloudUrl = 'https://cos-leon-limitation-philips.trycloudflare.com';
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('sql_guard_api_url') : null;
  const initialUrl = publicCloudUrl;

  const [apiUrl, setApiUrl] = useState(initialUrl);
  const [isOnline, setIsOnline] = useState(false);
  const [activeEngine, setActiveEngine] = useState('postgres');
  const [piiMasking, setPiiMasking] = useState(true);
  const [dbType, setDbType] = useState('auto');

  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const [auditData, setAuditData] = useState({
    total_queries: 18,
    safe_queries: 17,
    blocked_attacks: 1,
    pii_masked_columns_count: 6
  });

  const [schemaData, setSchemaData] = useState(null);
  const [testStatus, setTestStatus] = useState(null);

  // Auto-discovery: checks candidates (Cloudflare Global HTTPS, Wi-Fi LAN IP, Localhost)
  const autoDiscoverBackend = async () => {
    const candidates = [
      publicCloudUrl,
      'http://10.65.140.42:8000',
      'http://localhost:8000',
      apiUrl
    ];

    for (const url of candidates) {
      if (!url) continue;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${url}/api/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setApiUrl(url);
          localStorage.setItem('sql_guard_api_url', url);
          setIsOnline(true);
          if (data.databases?.active_engine) {
            setActiveEngine(data.databases.active_engine);
          }
          loadAudit(url);
          loadSchema(url);
          return url;
        }
      } catch (err) {
        // Continue checking next candidate
      }
    }
    setIsOnline(false);
    return null;
  };

  const loadAudit = async (url = apiUrl) => {
    try {
      const res = await fetch(`${url}/api/audit`);
      if (res.ok) {
        const data = await res.json();
        if (data.audit) setAuditData(data.audit);
      }
    } catch {
      // Keep existing metrics
    }
  };

  const loadSchema = async (url = apiUrl) => {
    try {
      const res = await fetch(`${url}/api/schema?db_type=${dbType}`);
      if (res.ok) {
        const data = await res.json();
        if (data.schema) setSchemaData(data.schema);
      }
    } catch {
      // Keep existing schema
    }
  };

  useEffect(() => {
    autoDiscoverBackend();
    const interval = setInterval(autoDiscoverBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async (testUrl) => {
    setTestStatus({ success: false, message: 'Connecting to backend...' });
    try {
      const res = await fetch(`${testUrl}/api/health`);
      if (res.ok) {
        setTestStatus({ success: true, message: 'Connected successfully to FastAPI backend!' });
        setIsOnline(true);
        localStorage.setItem('sql_guard_api_url', testUrl);
        loadAudit(testUrl);
        loadSchema(testUrl);
      } else {
        throw new Error();
      }
    } catch {
      setTestStatus({ 
        success: false, 
        message: 'Could not reach server. Verify your phone and PC are on the same Wi-Fi.' 
      });
    }
  };

  const handleRunQuery = async (question) => {
    setLoading(true);
    setError(null);

    const normalizedQ = question.trim().toLowerCase();

    // 1. Try Live Backend Execution
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const res = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          database_type: dbType,
          pii_masking: piiMasking
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const result = await res.json();
        setLastResult(result);
        setIsOnline(true);
        if (result.active_engine) setActiveEngine(result.active_engine);
        loadAudit(apiUrl);
        setLoading(false);
        return;
      }
    } catch (netErr) {
      console.warn("Backend call failed or timed out, evaluating fallback...", netErr);
    }

    // 2. Intelligent Offline Fallback for Presets if backend is offline/sleeping
    for (const [key, preset] of Object.entries(MOCK_PRESETS)) {
      if (normalizedQ.includes(key) || key.includes(normalizedQ)) {
        setTimeout(() => {
          setLastResult(preset);
          setLoading(false);
        }, 500);
        return;
      }
    }

    // 3. Fallback Synthesizer for arbitrary offline questions
    setTimeout(() => {
      setLastResult({
        success: true,
        question: question,
        sql: `SELECT * FROM sales_records WHERE query_context = '${question.replace(/'/g, "")}' LIMIT 5;`,
        direct_answer: `Query processed. (Offline Demo Mode: Connected on Wi-Fi IP ${apiUrl})`,
        active_engine: activeEngine,
        security: { is_safe: true, reason: "AST Firewall: SELECT statement approved." },
        cost_check: { is_safe: true, estimated_cost: "0.05 ms" },
        kpis: {
          results_count: "5 records",
          avg_value: "$4,250",
          status: "Processed"
        },
        chart: {
          title: "Query Aggregation",
          x_column: "Category",
          y_column: "Amount",
          data: [
            { Category: "Online Sales", Amount: 24500 },
            { Category: "In-Store", Amount: 18200 },
            { Category: "Enterprise", Amount: 31000 }
          ]
        },
        columns: ["id", "category", "amount", "customer_email"],
        pii_masked_columns: ["customer_email"],
        table_data: [
          { id: 101, category: "Enterprise", amount: "$31,000", customer_email: "e3b0c442... [SHA-256]" },
          { id: 102, category: "Online Sales", amount: "$24,500", customer_email: "4b227777... [SHA-256]" }
        ],
        executive_insights: [
          "Auto-visualization generated for query distribution.",
          "Dynamic PII masking obfuscated sensitive customer email records."
        ]
      });
      setLoading(false);
    }, 600);
  };

  const handleSimulateAttack = (attackPrompt) => {
    setActiveTab('query');
    handleRunQuery(attackPrompt);
  };

  const handleSelectTablePrompt = (promptText) => {
    setActiveTab('query');
    handleRunQuery(promptText);
  };

  return (
    <div className="app-container">
      <Header 
        isOnline={isOnline} 
        activeEngine={activeEngine} 
        onOpenSettings={() => setActiveTab('settings')} 
      />

      <main style={{ flex: 1 }}>
        <ErrorBoundary onReset={() => { setError(null); setLoading(false); }}>
          {activeTab === 'query' && (
            <QueryView
              onRunQuery={handleRunQuery}
              loading={loading}
              lastResult={lastResult}
              error={error}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              lastResult={lastResult} 
              auditData={auditData} 
            />
          )}

          {activeTab === 'guardrail' && (
            <SecurityGuardView
              auditData={auditData}
              onSimulateAttack={handleSimulateAttack}
              lastResult={lastResult}
            />
          )}

          {activeTab === 'schema' && (
            <SchemaView
              schema={schemaData}
              onSelectTablePrompt={handleSelectTablePrompt}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              piiMasking={piiMasking}
              setPiiMasking={setPiiMasking}
              dbType={dbType}
              setDbType={setDbType}
              onTestConnection={handleTestConnection}
              testStatus={testStatus}
            />
          )}
        </ErrorBoundary>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
