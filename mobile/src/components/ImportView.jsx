import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, 
  ArrowRight, Database, RefreshCw, Sparkles, Layers 
} from 'lucide-react';

export default function ImportView({ apiUrl, onImportSuccess, onQueryTable }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const name = selected.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
        setError('Please select a valid CSV or Excel (.xlsx) file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const res = await fetch(`${apiUrl}/api/upload-csv`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Upload failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      setUploadResult(data);
      if (onImportSuccess) {
        onImportSuccess(data.table_name);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload and ingest file. Ensure the backend server is reachable.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQueryNow = () => {
    if (uploadResult?.table_name && onQueryTable) {
      onQueryTable(`Show all records from ${uploadResult.table_name}`);
    }
  };

  const handleCreateSampleAndUpload = async () => {
    // Generate a sample CSV directly in browser and upload
    const sampleCsv = `customer_name,region,order_total,channel,rating
Acme Global Solutions,North America,45200,Enterprise,5
Apex Dynamics,Europe,31800,Direct,4
Vanguard Retail,Asia-Pacific,18900,Partner,5
Starlight Logistics,North America,24300,Enterprise,4
Pinnacle Technologies,Europe,12400,Online,3
Horizon Corp,Latin America,9500,Direct,4`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], 'sample_q1_sales.csv', { type: 'text/csv' });
    setFile(sampleFile);
    setError(null);
    setUploadResult(null);
  };

  return (
    <div className="tab-content">
      {/* Header Banner */}
      <div className="card-title-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
            Import Dataset
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Upload CSV or Excel spreadsheets to create live queryable tables
          </p>
        </div>
        <span className="guard-badge safe">
          <Database size={12} />
          Dual Engine
        </span>
      </div>

      {/* Upload Zone Card */}
      <div className="mobile-card" style={{ gap: '14px', textAlign: 'center', padding: '20px 16px' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv,.xlsx,.xls" 
          style={{ display: 'none' }} 
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-glow)',
            borderRadius: '16px',
            padding: '24px 16px',
            background: 'rgba(99, 102, 241, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-glow)'
          }}>
            <UploadCloud size={26} color="var(--accent-cyan)" />
          </div>

          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {file ? file.name : 'Tap to Browse File'}
            </p>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB • Tap to change` : 'Supports .CSV, .XLSX, and .XLS spreadsheets'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="send-btn"
            style={{ flex: 1, borderRadius: '12px', height: '42px', fontSize: '0.85rem' }}
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <RefreshCw size={16} className="spin-icon" /> Ingesting Dataset...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <UploadCloud size={16} /> Ingest into Database
              </span>
            )}
          </button>

          <button
            type="button"
            className="prompt-chip"
            style={{ fontSize: '0.76rem', padding: '0 12px' }}
            onClick={handleCreateSampleAndUpload}
            title="Load sample CSV file"
          >
            Sample CSV
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mobile-card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Import Failed</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{error}</p>
        </div>
      )}

      {/* Success Result Card */}
      {uploadResult && (
        <div className="mobile-card" style={{ borderColor: 'var(--success)', background: 'var(--success-bg)', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Dataset Successfully Ingested!</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created Table:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{uploadResult.table_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Records:</span>
              <strong>{uploadResult.row_count?.toLocaleString()} rows</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Columns Ingested:</span>
              <strong>{uploadResult.columns?.length} columns</strong>
            </div>
          </div>

          {/* Columns Tag List */}
          {uploadResult.columns && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {uploadResult.columns.map((col, idx) => (
                <span key={idx} className="pii-tag" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)' }}>
                  {col}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            className="send-btn"
            style={{ width: '100%', borderRadius: '12px', height: '40px', marginTop: '6px', fontSize: '0.85rem' }}
            onClick={handleQueryNow}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Sparkles size={16} /> Query This Dataset Now <ArrowRight size={14} />
            </span>
          </button>
        </div>
      )}

      {/* How it Works Information Card */}
      <div className="mobile-card" style={{ gap: '8px' }}>
        <span className="card-title" style={{ fontSize: '0.85rem' }}>
          <Layers size={14} color="var(--primary)" />
          How Ingestion Works
        </span>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Uploaded spreadsheets are sanitized, normalized, and converted into relational SQL tables inside your active database. The Natural Language query compiler immediately reflects the new schema so you can ask questions right away.
        </p>
      </div>
    </div>
  );
}
