import React, { useState } from 'react';
import { 
  Menu, X, ShieldCheck, SlidersHorizontal, 
  Database, CheckCircle2, ChevronRight, Activity, Lock, Download
} from 'lucide-react';

export default function Header({ 
  isOnline, 
  activeEngine, 
  onNavigate, 
  activeTab 
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelectMenuItem = (tabId) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="brand-wrapper">
          <img src="/icon.svg" alt="SQL Guard" className="app-logo" />
          <div className="brand-info">
            <h1>SQL Guard</h1>
            <div className="status-badge">
              <span className={`status-dot ${isOnline ? '' : 'offline'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              <span style={{ color: 'var(--border-color)', margin: '0 2px' }}>•</span>
              <span style={{ color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                {activeEngine || 'SQLITE'}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Top-Right 3 Lines Hamburger Menu Button (Point 9) */}
          <button 
            type="button"
            className="icon-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu & Guardrail"
            aria-label="Navigation Menu"
            style={{ 
              background: menuOpen ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              color: menuOpen ? '#FFFFFF' : 'var(--text-main)',
              borderRadius: '10px'
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Top-Right Slide-out Drawer / Overlay Menu (Point 9) */}
      {menuOpen && (
        <div className="menu-drawer-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  Navigation & Tools
                </h3>
              </div>
              <button 
                type="button" 
                className="close-drawer-btn" 
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Navigation Options */}
            <div className="drawer-items-list">
              {/* 🛡️ Guardrail Option hidden inside 3 lines menu (Point 9) */}
              <button
                type="button"
                className={`drawer-nav-item ${activeTab === 'guardrail' ? 'active' : ''}`}
                onClick={() => handleSelectMenuItem('guardrail')}
              >
                <div className="drawer-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Security Guardrail</span>
                    <span className="guard-badge safe" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                      Active
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Multi-tier AST firewall & attack simulation
                  </span>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </button>

              {/* 🗄️ Relational Schema */}
              <button
                type="button"
                className={`drawer-nav-item ${activeTab === 'schema' ? 'active' : ''}`}
                onClick={() => handleSelectMenuItem('schema')}
              >
                <div className="drawer-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
                  <Database size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Database Schema</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Explore relational tables and row counts
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </button>

              {/* ⚙️ Connection & Settings */}
              <button
                type="button"
                className={`drawer-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleSelectMenuItem('settings')}
              >
                <div className="drawer-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                  <SlidersHorizontal size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Settings & APK</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Configure endpoints, PII masking, and APK info
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </button>

              {/* 📱 Download Android APK */}
              <a 
                href="/SQLGuard-Mobile.apk"
                download="SQLGuard-Mobile.apk"
                className="drawer-nav-item"
                style={{ 
                  textDecoration: 'none', 
                  border: '1px solid rgba(16, 185, 129, 0.3)', 
                  background: 'rgba(16, 185, 129, 0.08)' 
                }}
              >
                <div className="drawer-icon-box" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                  <Download size={20} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>Download Mobile App</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    SQLGuard-Mobile.apk (19.8 MB)
                  </p>
                </div>
                <ChevronRight size={16} color="var(--text-dim)" />
              </a>
            </div>

            {/* Quick System Summary */}
            <div className="drawer-footer-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                <Lock size={13} color="var(--success)" />
                <span>Enterprise Protection Active</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AST Compiler Firewall & Dynamic PII Masking are actively inspecting all queries.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
