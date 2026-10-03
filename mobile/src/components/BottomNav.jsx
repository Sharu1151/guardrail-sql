import React from 'react';
import { MessageSquareText, BarChart3, ShieldCheck, Database, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'query', label: 'Query', icon: MessageSquareText },
    { id: 'analytics', label: 'Insights', icon: BarChart3 },
    { id: 'guardrail', label: 'Guardrail', icon: ShieldCheck },
    { id: 'schema', label: 'Schema', icon: Database },
    { id: 'settings', label: 'App / APK', icon: Settings }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
