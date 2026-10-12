import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import QueryView from './components/QueryView';
import AnalyticsView from './components/AnalyticsView';
import SecurityGuardView from './components/SecurityGuardView';
import SchemaView from './components/SchemaView';
import SettingsView from './components/SettingsView';
import ErrorBoundary from './components/ErrorBoundary';


export default function App() {
  const [activeTab, setActiveTab] = useState('query');

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );
  const publicCloudUrl = 'https://guardrail-sql-api.onrender.com';
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('sql_guard_api_url') : null;
  const cleanSaved = savedUrl ? savedUrl.trim().replace(/\/+$/, '') : null;
  const initialUrl = isLocalhost 
    ? 'http://localhost:8000' 
    : ((cleanSaved && !cleanSaved.includes('trycloudflare.com')) ? cleanSaved : publicCloudUrl);

  const [apiUrl, setApiUrl] = useState(initialUrl);
  const [isOnline, setIsOnline] = useState(false);
  const [activeEngine, setActiveEngine] = useState('postgres');
  const [piiMasking, setPiiMasking] = useState(true);
  const [dbType, setDbType] = useState('auto');

  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [error, setError] = useState(null);

  const [auditData, setAuditData] = useState({
    total_queries: 18,
    safe_queries: 17,
    blocked_attacks: 1,
    pii_masked_columns_count: 6
  });

  const [schemaData, setSchemaData] = useState(null);
  const [testStatus, setTestStatus] = useState(null);

  // Auto-discovery: prioritizes local backend when running locally, then cloud/lan
  const autoDiscoverBackend = async () => {
    const rawCandidates = isLocalhost
      ? ['http://localhost:8000', 'http://127.0.0.1:8000', savedUrl, 'http://192.168.0.10:8000', 'http://192.168.0.9:8000', publicCloudUrl]
      : [savedUrl, 'http://192.168.0.10:8000', 'http://192.168.0.9:8000', 'http://localhost:8000', publicCloudUrl];
    const candidates = rawCandidates
      .filter(Boolean)
      .map(u => u.trim().replace(/\/+$/, ''))
      .filter((u, i, arr) => arr.indexOf(u) === i && !u.includes('trycloudflare.com'));

    for (const url of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
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

  const handleTestConnection = async (rawUrl) => {
    const testUrl = (rawUrl || '').trim().replace(/\/+$/, '');
    setTestStatus({ success: false, message: 'Connecting to backend...' });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${testUrl}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestStatus({ success: true, message: 'Connected successfully to 24/7 Cloud backend!' });
        setApiUrl(testUrl);
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
        message: 'Could not reach server. Verify the URL or check Render deployment status.' 
      });
    }
  };

  const handleRunQuery = async (question) => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for query pipeline

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

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.detail || result.error || `Query request failed with status ${res.status}`);
      }

      setLastResult(result);
      setIsOnline(true);
      if (result.active_engine) setActiveEngine(result.active_engine);
      loadAudit(apiUrl);
      setLoading(false);
      return;
    } catch (netErr) {
      console.error("Backend query execution failed:", netErr);
      const isAbort = netErr.name === 'AbortError';
      const msg = isAbort 
        ? "Query timed out after 20 seconds. Please check backend response."
        : (netErr.message || `Unable to reach backend server at ${apiUrl}. Please verify the backend service is running.`);
      setError(msg);
      setLoading(false);
    }
  };

  const handleSimulateAttack = (attackPrompt) => {
    setActiveTab('query');
    setSelectedPrompt(attackPrompt);
  };

  const handleSelectTablePrompt = (promptText) => {
    setActiveTab('query');
    setSelectedPrompt(promptText);
  };

  return (
    <div className="app-container">
      <Header 
        isOnline={isOnline} 
        activeEngine={activeEngine} 
        onNavigate={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
      />

      <main style={{ flex: 1 }}>
        <ErrorBoundary onReset={() => { setError(null); setLoading(false); }}>
          {activeTab === 'query' && (
            <QueryView
              onRunQuery={handleRunQuery}
              loading={loading}
              lastResult={lastResult}
              error={error}
              apiUrl={apiUrl}
              selectedPrompt={selectedPrompt}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              lastResult={lastResult} 
              auditData={auditData} 
            />
          )}

          {/* Guardrail accessed via top-right 3-line menu (Point 9) */}
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
