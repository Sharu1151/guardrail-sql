import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Users, Award, Sparkles } from 'lucide-react';
import MobileChart from './MobileChart';

export default function AnalyticsView({ lastResult, auditData }) {
  // Fallback sample data if no query has been executed yet
  const sampleChart = {
    title: "Regional Sales Revenue",
    x_column: "Region",
    y_column: "Revenue",
    data: [
      { Region: "North America", Revenue: 48500 },
      { Region: "Europe", Revenue: 34200 },
      { Region: "Asia Pacific", Revenue: 29800 },
      { Region: "Latin America", Revenue: 14500 },
      { Region: "Middle East", Revenue: 9200 }
    ]
  };

  const chartToDisplay = lastResult?.chart || sampleChart;

  return (
    <div className="tab-content">
      {/* Title Header */}
      <div className="card-title-row">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
          Executive Analytics
        </h2>
        <span className="guard-badge safe">
          <TrendingUp size={13} />
          Live Metrics
        </span>
      </div>

      {/* KPI Overview Grid */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
          <span className="kpi-label">Total Queries</span>
          <span className="kpi-value">{auditData?.total_queries ?? 14}</span>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <span className="kpi-label">Safe Executed</span>
          <span className="kpi-value">{auditData?.safe_queries ?? 13}</span>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <span className="kpi-label">Attacks Blocked</span>
          <span className="kpi-value">{auditData?.blocked_attacks ?? 1}</span>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <span className="kpi-label">Masked Columns</span>
          <span className="kpi-value">{auditData?.pii_masked_columns_count ?? 8}</span>
        </div>
      </div>

      {/* Interactive Mobile Chart */}
      <MobileChart chartData={chartToDisplay} title={chartToDisplay.title || "Data Analytics"} />

      {/* Executive Insights */}
      {lastResult?.executive_insights && lastResult.executive_insights.length > 0 ? (
        <div className="mobile-card">
          <span className="card-title">
            <Sparkles size={16} color="var(--accent-purple)" />
            AI Executive Insights
          </span>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lastResult.executive_insights.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mobile-card">
          <span className="card-title">
            <Sparkles size={16} color="var(--accent-purple)" />
            Automated Intelligence
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Run questions in the <strong>Query</strong> tab to generate real-time charts, KPI aggregations, and business insights automatically from your enterprise database.
          </p>
        </div>
      )}
    </div>
  );
}
