import React, { useState } from 'react';
import { 
  Settings, Server, Shield, Database, Smartphone, Download, 
  CheckCircle, AlertCircle, RefreshCw, Terminal, ExternalLink 
} from 'lucide-react';

export default function SettingsView({
  apiUrl,
  setApiUrl,
  piiMasking,
  setPiiMasking,
  dbType,
  setDbType,
  onTestConnection,
  testStatus
}) {
  const [localUrl, setLocalUrl] = useState(apiUrl);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Capture PWA install event if available
  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!installPrompt) {
      alert("To install on your phone: Tap 'Share' (iOS Safari) or the 3 dots (Android Chrome) and choose 'Add to Home Screen'!");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="tab-content">
      <div className="card-title-row">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          Settings & App Setup
        </h2>
        <span className="guard-badge safe">
          <Smartphone size={12} />
          v1.0.4 (Live)
        </span>
      </div>

      {/* Backend API Configuration */}
      <div className="mobile-card">
        <span className="card-title">
          <Server size={16} color="var(--primary)" />
          Backend API Connection
        </span>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Specify your FastAPI backend address. If testing on your phone via Wi-Fi, enter your computer's local IP address (e.g. <code>http://192.168.1.15:8000</code>).
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            className="text-input"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            placeholder="https://guardrail-sql-api.onrender.com"
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="send-btn"
              style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
              onClick={() => {
                const clean = (localUrl || '').trim().replace(/\/+$/, '');
                setLocalUrl(clean);
                setApiUrl(clean);
                onTestConnection(clean);
              }}
            >
              Save & Test Connection
            </button>
            <button
              className="action-btn"
              style={{ padding: '0 12px', height: '36px', fontSize: '0.75rem' }}
              onClick={() => {
                const defaultCloud = 'https://guardrail-sql-api.onrender.com';
                setLocalUrl(defaultCloud);
                setApiUrl(defaultCloud);
                onTestConnection(defaultCloud);
              }}
              title="Reset to 24/7 Cloud URL"
            >
              Reset Cloud
            </button>
          </div>

          {testStatus && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.75rem', 
              marginTop: '4px',
              color: testStatus.success ? 'var(--success)' : 'var(--danger)'
            }}>
              {testStatus.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security & Pipeline Options */}
      <div className="mobile-card">
        <span className="card-title">
          <Shield size={16} color="var(--accent-cyan)" />
          Security Preferences
        </span>

        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-title">Dynamic PII Masking</span>
            <span className="settings-subtitle">SHA-256 hash customer emails & sensitive data</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={piiMasking} 
              onChange={(e) => setPiiMasking(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <span className="settings-title">Active Database Dialect</span>
            <span className="settings-subtitle">Target execution engine</span>
          </div>
          <select 
            value={dbType} 
            onChange={(e) => setDbType(e.target.value)}
            style={{
              background: '#090D16',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="auto">Auto Detect</option>
            <option value="sqlite">SQLite</option>
            <option value="postgres">PostgreSQL</option>
          </select>
        </div>
      </div>

      {/* Mobile App Deployment Guides */}
      <div className="mobile-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
        <span className="card-title">
          <Smartphone size={16} color="var(--accent-purple)" />
          How to run on your Mobile Phone
        </span>

        {/* Step 1: Add to Home screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>Method 1: Instant PWA (No App Store Needed)</strong>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>
            Open this URL on your phone's browser (Chrome or Safari) and tap <strong>Add to Home Screen</strong>. It installs as a full-screen native-like app with an icon on your home screen!
          </p>
          <button 
            className="send-btn" 
            style={{ height: '36px', fontSize: '0.78rem', marginTop: '4px', gap: '6px' }}
            onClick={handleInstallPwa}
          >
            <Download size={14} />
            Install to Home Screen
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

        {/* Step 2: Build Android APK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>Method 2: Export as Android APK (Capacitor)</strong>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>
            To generate a standalone <code>.apk</code> installer for Android:
          </p>
          <div className="sql-box" style={{ fontSize: '0.72rem', padding: '8px' }}>
            cd mobile<br />
            npm run build<br />
            npx cap add android<br />
            npx cap open android
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            This opens Android Studio where you can click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
