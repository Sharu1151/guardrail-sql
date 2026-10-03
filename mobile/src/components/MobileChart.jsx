import React, { useState } from 'react';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';

export default function MobileChart({ chartData, title }) {
  const [chartType, setChartType] = useState('bar');

  if (!chartData || !chartData.data) {
    return null;
  }

  // Safely extract items whether backend returns object { x: [], y: [] } or array [ { ... } ]
  let items = [];
  const xCol = chartData.x_col || chartData.x_column || 'x';
  const yCol = chartData.y_col || chartData.y_column || 'y';

  try {
    if (Array.isArray(chartData.data)) {
      items = chartData.data.map((d, idx) => ({
        label: String(d[xCol] ?? Object.values(d)[0] ?? `Item ${idx + 1}`),
        value: Number(d[yCol] ?? Object.values(d)[1] ?? 0)
      }));
    } else if (typeof chartData.data === 'object' && chartData.data !== null) {
      const xArr = Array.isArray(chartData.data.x) ? chartData.data.x : [];
      const yArr = Array.isArray(chartData.data.y) ? chartData.data.y : [];
      
      const maxLen = Math.max(xArr.length, yArr.length);
      for (let i = 0; i < maxLen; i++) {
        items.push({
          label: String(xArr[i] ?? `Item ${i + 1}`),
          value: Number(yArr[i] ?? 0)
        });
      }
    }
  } catch (err) {
    console.warn("Chart parsing fallback", err);
  }

  if (items.length === 0) {
    return null;
  }

  // Keep top 7 items for clean mobile presentation
  const displayItems = items.slice(0, 7);
  const values = displayItems.map(d => (isNaN(d.value) ? 0 : d.value));
  const maxValue = Math.max(...values, 1);
  const totalValue = values.reduce((a, b) => a + b, 0);

  const colors = [
    '#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E'
  ];

  return (
    <div className="mobile-card">
      <div className="card-title-row">
        <span className="card-title">
          <BarChart2 size={16} color="var(--accent-cyan)" />
          {title || chartData.title || 'Data Visualization'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`icon-btn ${chartType === 'bar' ? 'active' : ''}`}
            style={{ width: '28px', height: '28px' }}
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            <BarChart2 size={14} />
          </button>
          <button 
            className={`icon-btn ${chartType === 'donut' ? 'active' : ''}`}
            style={{ width: '28px', height: '28px' }}
            onClick={() => setChartType('donut')}
            title="Donut Chart"
          >
            <PieChart size={14} />
          </button>
          <button 
            className={`icon-btn ${chartType === 'line' ? 'active' : ''}`}
            style={{ width: '28px', height: '28px' }}
            onClick={() => setChartType('line')}
            title="Trend Line"
          >
            <TrendingUp size={14} />
          </button>
        </div>
      </div>

      {chartType === 'bar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          {displayItems.map((item, idx) => {
            const val = isNaN(item.value) ? 0 : item.value;
            const pct = Math.round((val / maxValue) * 100);
            const label = item.label;
            const barColor = colors[idx % colors.length];

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                    {label}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {typeof val === 'number' ? val.toLocaleString() : val}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${pct}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${barColor}, #818CF8)`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chartType === 'donut' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 0' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {(() => {
              let cumulativePct = 0;
              const radius = 50;
              const circumference = 2 * Math.PI * radius;

              return displayItems.map((item, idx) => {
                const val = isNaN(item.value) ? 0 : item.value;
                const pct = totalValue > 0 ? val / totalValue : 0;
                const strokeDasharray = `${pct * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativePct * circumference;
                cumulativePct += pct;

                return (
                  <circle
                    key={idx}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="18"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'all 0.5s ease' }}
                  />
                );
              });
            })()}
            <text x="70" y="66" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-body)">
              TOTAL
            </text>
            <text x="70" y="82" textAnchor="middle" fill="#FFF" fontSize="13" fontWeight="bold" fontFamily="var(--font-heading)">
              {totalValue.toLocaleString()}
            </text>
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '45%' }}>
            {displayItems.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length], flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartType === 'line' && (
        <div style={{ padding: '8px 0' }}>
          <svg width="100%" height="110" viewBox="0 0 300 110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {(() => {
              if (values.length < 2) {
                return (
                  <text x="150" y="55" textAnchor="middle" fill="var(--text-dim)" fontSize="11">
                    Insufficient data points for trend
                  </text>
                );
              }
              const stepX = 300 / (values.length - 1);
              const points = values.map((val, idx) => {
                const x = idx * stepX;
                const y = 90 - (val / maxValue) * 70;
                return `${x},${y}`;
              });
              const polyPoints = `0,100 ${points.join(' ')} 300,100`;

              return (
                <>
                  <polygon points={polyPoints} fill="url(#lineGrad)" />
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points.join(' ')}
                  />
                  {values.map((val, idx) => {
                    const x = idx * stepX;
                    const y = 90 - (val / maxValue) * 70;
                    return (
                      <circle key={idx} cx={x} cy={y} r="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                    );
                  })}
                </>
              );
            })()}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            <span>{displayItems[0]?.label || ''}</span>
            <span>{displayItems[displayItems.length - 1]?.label || ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
