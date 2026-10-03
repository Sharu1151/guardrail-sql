import React from 'react';
import { Database, ShieldCheck, Wifi, WifiOff, SlidersHorizontal } from 'lucide-react';

export default function Header({ isOnline, activeEngine, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <img src="/icon.svg" alt="SQL Guard" className="app-logo" />
        <div className="brand-info">
          <h1>SQL Guard</h1>
          <div className="status-badge">
            <span className={`status-dot ${isOnline ? '' : 'offline'}`} />
            <span>{isOnline ? 'Backend Online' : 'Connecting / Offline'}</span>
            <span style={{ color: 'var(--border-color)', margin: '0 2px' }}>•</span>
            <span style={{ color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              {activeEngine || 'SQLITE'}
            </span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="icon-btn" 
          onClick={onOpenSettings}
          title="Connection & Settings"
          aria-label="Settings"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}
