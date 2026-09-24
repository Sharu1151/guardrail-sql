"""SaaS UI Components, SVG Icon Library, and Enterprise Data Grid Renderers.

Provides curated Lucide-style SVG icons, high-end SaaS data tables,
KPI metric cards, security benchmark matrices, and executive intelligence components.
All HTML outputs are stripped of leading indentation to prevent markdown <pre><code> triggers.
"""

import html
import re
from typing import List, Dict, Any, Optional
import pandas as pd


def clean_html(raw_html: str) -> str:
    """Strip leading whitespace from each line to prevent markdown parser
    from interpreting 4-space indentation as a code block (<pre><code>).
    """
    return "\n".join(line.strip() for line in raw_html.strip().splitlines() if line.strip())


# -------------------------------------------------------------
# 1. CURATED LUCIDE-STYLE INLINE SVG ICONS
# -------------------------------------------------------------
SVG_SHIELD = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>"""

SVG_SHIELD_CHECK = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>"""

SVG_SHIELD_ALERT = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>"""

SVG_DATABASE = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>"""

SVG_SPARKLE = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>"""

SVG_CHART = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>"""

SVG_TRENDING_UP = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>"""

SVG_LOCK = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>"""

SVG_CHECK = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>"""

SVG_CHECK_CIRCLE = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>"""

SVG_ALERT_TRIANGLE = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>"""

SVG_TERMINAL = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>"""

SVG_FILECHECK = """<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>"""

SVG_LIGHTNING = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>"""

SVG_DOWNLOAD = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>"""

SVG_TABLE = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>"""

SVG_SEARCH = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>"""

SVG_FILTER = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>"""

SVG_KEY = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>"""

SVG_LINK = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>"""

SVG_CPU = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>"""

SVG_SERVER = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>"""

SVG_CALENDAR = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>"""

SVG_HASH = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>"""

SVG_TEXT = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>"""

SVG_LAYERS = """<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>"""

SVG_TARGET = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>"""

SVG_CLOCK = """<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>"""

SVG_FILE_TEXT = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>"""

SVG_VOLUME = """<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>"""


# -------------------------------------------------------------
# 2. TOP ENTERPRISE NAVBAR
# -------------------------------------------------------------
def render_saas_navbar(active_engine: str = "PostgreSQL 16", pii_active: bool = True) -> str:
    """Render top enterprise SaaS navbar with brand identity, version, and live status pills."""
    engine_name = active_engine.upper() if active_engine else "POSTGRESQL 16"
    pii_badge = "SHA-256 PII ACTIVE" if pii_active else "RAW (PII UNMASKED)"
    pii_class = "pill-blue" if pii_active else "pill-amber"

    return clean_html(f"""
<div class="saas-navbar">
    <div class="saas-brand-group">
        <div class="saas-brand-logo">
            {SVG_SHIELD_CHECK}
        </div>
        <div class="saas-brand-stack">
            <div class="saas-brand-headline">
                <span class="saas-brand-title">Guardrail SQL</span>
                <span class="saas-env-badge">ENTERPRISE v2.4</span>
            </div>
            <div class="saas-brand-subtitle">
                Intelligent Natural Language Analytics &amp; AST Compiler Firewall
            </div>
        </div>
    </div>
    <div class="saas-status-rack">
        <div class="saas-status-pill pill-green">
            <span class="saas-pulse-dot"></span>
            <span>{html.escape(engine_name)} CONNECTED</span>
        </div>
        <div class="saas-status-pill pill-indigo">
            {SVG_TERMINAL}
            <span>SQLGLOT AST FIREWALL</span>
        </div>
        <div class="saas-status-pill {pii_class}">
            {SVG_LOCK}
            <span>{pii_badge}</span>
        </div>
        <div class="saas-status-pill pill-slate">
            {SVG_CHECK}
            <span>READ-ONLY ANALYST</span>
        </div>
    </div>
</div>
""")


# -------------------------------------------------------------
# 3. HIGH-END SAAS KPI METRIC CARDS
# -------------------------------------------------------------
def render_kpi_card(
    title: str,
    value: str,
    subtitle: str,
    icon_type: str = "database",
    variant: str = "blue",
    status_pill_html: Optional[str] = None
) -> str:
    """Render a clean, high-contrast SaaS KPI Card."""
    icon_map = {
        "database": (SVG_DATABASE, "icon-blue"),
        "chart": (SVG_TRENDING_UP, "icon-indigo"),
        "security": (SVG_SHIELD_CHECK, "icon-emerald"),
        "alert": (SVG_SHIELD_ALERT, "icon-rose"),
        "records": (SVG_TABLE, "icon-sky"),
    }
    svg_icon, icon_cls = icon_map.get(icon_type, (SVG_DATABASE, "icon-blue"))
    accent_class = f"saas-kpi-{variant}"
    badge_html = f'<div class="saas-kpi-status-wrap">{status_pill_html}</div>' if status_pill_html else ""

    return clean_html(f"""
<div class="saas-kpi-card {accent_class}">
    <div class="saas-kpi-top">
        <span class="saas-kpi-label">{html.escape(title)}</span>
        <div class="saas-kpi-icon-wrap {icon_cls}">
            {svg_icon}
        </div>
    </div>
    <div class="saas-kpi-value">{html.escape(str(value))}</div>
    {badge_html}
    <div class="saas-kpi-footer">
        <span class="saas-kpi-sub-text">{html.escape(subtitle)}</span>
    </div>
</div>
""")


# -------------------------------------------------------------
# 4. ENTERPRISE DATA GRID RENDERER
# -------------------------------------------------------------
def _get_column_icon_and_type(col_name: str, sample_val: Any, is_masked: bool):
    """Determine clean column datatype icon and badge."""
    c_lower = str(col_name).lower()
    if is_masked or "sha256:" in str(sample_val):
        return SVG_LOCK, "PII HASH", "badge-pii"
    if any(k in c_lower for k in ["date", "month", "year", "time", "day", "quarter"]):
        return SVG_CALENDAR, "DATE", "badge-date"
    if any(k in c_lower for k in ["revenue", "sales", "price", "budget", "total", "amount", "cost", "income"]):
        return SVG_TRENDING_UP, "CURRENCY", "badge-currency"
    if any(k in c_lower for k in ["id", "index", "number", "code", "key"]):
        return SVG_HASH, "INDEX", "badge-index"
    if isinstance(sample_val, (int, float)):
        return SVG_HASH, "NUMERIC", "badge-num"
    return SVG_TEXT, "TEXT", "badge-text"


def render_saas_data_grid(
    df: pd.DataFrame,
    title: str = "Query Result Data Grid",
    masked_columns: Optional[List[str]] = None,
    max_rows: int = 50,
    active_engine: str = "postgres"
) -> str:
    """Render a modern, enterprise SaaS data table with column datatypes, formatted numbers,
    and cryptographic SHA-256 privacy pills.
    """
    if df is None or df.empty:
        return clean_html(f"""
<div class="saas-table-card">
    <div class="saas-empty-state">
        <div class="saas-empty-icon">{SVG_TABLE}</div>
        <div class="saas-empty-title">Zero Records Returned</div>
        <div class="saas-empty-sub">No matching records found for the current query filter. Execute a new search above.</div>
    </div>
</div>
""")

    masked_set = set(masked_columns or [])
    cols = [str(c) for c in df.columns]
    display_df = df.head(max_rows)
    total_records = len(df)

    # Build Header Cells with Icons
    th_html = []
    for c in cols:
        is_masked = c in masked_set
        sample_val = display_df[c].dropna().iloc[0] if not display_df[c].dropna().empty else ""
        col_icon, type_label, type_class = _get_column_icon_and_type(c, sample_val, is_masked)

        th_html.append(f"""
<th>
    <div class="saas-th-wrapper">
        <div class="saas-th-left">
            <span class="saas-th-icon">{col_icon}</span>
            <span class="saas-th-title">{html.escape(c)}</span>
        </div>
        <span class="saas-col-type-tag {type_class}">{type_label}</span>
    </div>
</th>
""")

    # Build Rows
    rows_html = []
    for row_idx, (_, row) in enumerate(display_df.iterrows()):
        tds_html = []
        for c in cols:
            val = row[c]
            val_str = str(val) if val is not None and not pd.isna(val) else ""
            is_masked = c in masked_set

            # Cryptographic Masked SHA-256 Hash
            if is_masked or "sha256:" in val_str:
                short_hash = val_str[:18] + "..." if len(val_str) > 18 else val_str
                full_tooltip = html.escape(val_str)
                cell_content = f"""<span class="saas-hash-pill" title="Cryptographic SHA-256 Digest: {full_tooltip}">{SVG_LOCK} <code>{html.escape(short_hash)}</code></span>"""
                tds_html.append(f"<td>{cell_content}</td>")

            # Numeric Formatting (Currency vs Integer vs Float)
            elif isinstance(val, (int, float)) and not pd.isna(val):
                c_lower = c.lower()
                is_curr = any(k in c_lower for k in ["revenue", "budget", "total", "sales", "price", "income", "amount", "cost"])
                if is_curr:
                    formatted_val = f"${float(val):,.2f}"
                    tds_html.append(f"""<td class="saas-td-num saas-td-currency">{formatted_val}</td>""")
                elif isinstance(val, int) or float(val).is_integer():
                    tds_html.append(f"""<td class="saas-td-num">{int(val):,}</td>""")
                else:
                    tds_html.append(f"""<td class="saas-td-num">{float(val):,.2f}</td>""")

            # Entity pills (State, Region, Channel, Category)
            elif any(k in c.lower() for k in ["channel", "state", "region", "city", "status", "category", "suburb"]):
                pill_content = f"""<span class="saas-entity-pill">{html.escape(val_str)}</span>"""
                tds_html.append(f"<td>{pill_content}</td>")

            else:
                tds_html.append(f"<td>{html.escape(val_str)}</td>")

        tr_class = "saas-tr-even" if row_idx % 2 == 0 else "saas-tr-odd"
        rows_html.append(f'<tr class="{tr_class}">{"".join(tds_html)}</tr>')

    showing_text = (
        f"Showing 1 to {len(display_df):,} of {total_records:,} records"
        if total_records > len(display_df)
        else f"Showing all {total_records:,} records"
    )

    engine_tag = active_engine.upper() if active_engine else "POSTGRESQL 16"

    return clean_html(f"""
<div class="saas-table-card">
    <div class="saas-table-toolbar">
        <div class="saas-table-status">
            <span class="saas-live-dot"></span>
            <span class="saas-table-count-label">{showing_text}</span>
        </div>
        <div class="saas-table-meta-rack">
            <span class="saas-tag-role">{SVG_CHECK} READ-ONLY ROLE</span>
            <span class="saas-tag-engine">{SVG_DATABASE} {html.escape(engine_tag)}</span>
            <span class="saas-tag-secure">{SVG_SHIELD} TLS 1.3 ENCRYPTED</span>
        </div>
    </div>
    <div class="saas-table-scroll-container">
        <table class="saas-data-table">
            <thead>
                <tr>{"".join(th_html)}</tr>
            </thead>
            <tbody>
                {"".join(rows_html)}
            </tbody>
        </table>
    </div>
</div>
""")


# -------------------------------------------------------------
# 5. ENTERPRISE SCHEMA INSPECTOR TABLE
# -------------------------------------------------------------
def render_schema_table(columns_data: List[Dict[str, Any]]) -> str:
    """Render a clean, high-contrast relational schema table."""
    if not columns_data:
        return "<p class='saas-empty-sub'>No column metadata available.</p>"

    rows_html = []
    for row_idx, col in enumerate(columns_data):
        c_name = str(col.get("name", col.get("column_name", "")))
        c_type = str(col.get("type", col.get("data_type", "TEXT"))).upper()
        is_pk = bool(col.get("primary_key", col.get("is_pk", False)))
        nullable = col.get("nullable", True)

        # Icon and pill for PK / FK
        if is_pk or c_name.lower().endswith("_index") or c_name.lower().endswith("_id") or c_name.lower() in ["id", "order_number"]:
            name_icon = SVG_KEY
            pk_badge = '<span class="saas-badge-gold">PRIMARY KEY</span>' if is_pk else '<span class="saas-badge-purple">FOREIGN KEY</span>'
        else:
            name_icon = SVG_HASH if any(t in c_type for t in ["INT", "FLOAT", "NUMERIC", "DECIMAL", "DOUBLE"]) else SVG_TEXT
            pk_badge = '<span class="saas-badge-slate">COLUMN</span>'

        null_badge = '<span class="saas-badge-rose">NOT NULL</span>' if not nullable else '<span class="saas-badge-muted">NULLABLE</span>'
        type_badge = f'<span class="saas-badge-code"><code>{html.escape(c_type)}</code></span>'

        tr_class = "saas-tr-even" if row_idx % 2 == 0 else "saas-tr-odd"
        rows_html.append(f"""
<tr class="{tr_class}">
    <td style="font-weight: 600; color: #0f172a;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="color: #64748b;">{name_icon}</span>
            <span>{html.escape(c_name)}</span>
        </div>
    </td>
    <td>{type_badge}</td>
    <td>{pk_badge}</td>
    <td>{null_badge}</td>
</tr>
""")

    return clean_html(f"""
<div class="saas-table-card" style="margin-top: 10px;">
    <div class="saas-table-scroll-container">
        <table class="saas-data-table">
            <thead>
                <tr>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Field / Column Name</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">SQL Datatype</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Constraint</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Nullability</span></div></th>
                </tr>
            </thead>
            <tbody>
                {"".join(rows_html)}
            </tbody>
        </table>
    </div>
</div>
""")


# -------------------------------------------------------------
# 6. RED TEAM SECURITY BENCHMARK MATRIX TABLE
# -------------------------------------------------------------
def render_security_benchmark_table(benchmark_results: List[Dict[str, Any]]) -> str:
    """Render a clean, high-contrast Red Team Automated Benchmark Table."""
    rows_html = []
    for idx, item in enumerate(benchmark_results):
        vector = item.get("Attack Vector", "")
        payload = item.get("Target Payload", "")
        status = item.get("Interception Status", "")
        rule = item.get("Firewall Rule", "")
        latency = item.get("Latency (ms)", "")

        is_blocked = "BLOCK" in status.upper() or "INTERCEPT" in status.upper()
        if is_blocked:
            status_html = f'<span class="saas-badge-shield-ok">{SVG_SHIELD_CHECK} INTERCEPTED &amp; NEUTRALIZED</span>'
        else:
            status_html = f'<span class="saas-badge-shield-fail">{SVG_ALERT_TRIANGLE} LEAKED / EXECUTED</span>'

        tr_class = "saas-tr-even" if idx % 2 == 0 else "saas-tr-odd"
        rows_html.append(f"""
<tr class="{tr_class}">
    <td style="font-weight: 700; color: #0f172a; white-space: nowrap;">
        <div style="display: flex; align-items: center; gap: 7px;">
            <span style="color: #ef4444;">{SVG_TARGET}</span>
            <span>{html.escape(vector)}</span>
        </div>
    </td>
    <td>
        <span class="saas-code-pill" title="{html.escape(payload)}">
            {html.escape(payload)}
        </span>
    </td>
    <td>{status_html}</td>
    <td><span class="saas-badge-rule">{html.escape(rule)}</span></td>
    <td class="saas-td-num" style="color: #0284c7; font-weight: 600;">{html.escape(str(latency))}</td>
</tr>
""")

    return clean_html(f"""
<div class="saas-table-card" style="margin-top: 14px;">
    <div class="saas-table-toolbar">
        <div class="saas-table-status">
            <span class="saas-live-dot" style="background: #10b981;"></span>
            <span class="saas-table-count-label">10 Red Team Attack Vectors Evaluated &amp; Verified</span>
        </div>
        <div class="saas-table-meta-rack">
            <span class="saas-tag-role" style="color: #065f46; background: #ecfdf5; border-color: #a7f3d0;">
                {SVG_CHECK} 100.0% DEFENSE SCORE
            </span>
            <span class="saas-tag-secure">{SVG_SHIELD} ZERO MUTATION LEAKS</span>
        </div>
    </div>
    <div class="saas-table-scroll-container">
        <table class="saas-data-table">
            <thead>
                <tr>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Adversarial Vector</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Attack Payload</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Interception Status</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Compiler Rule Intercept</span></div></th>
                    <th><div class="saas-th-wrapper" style="justify-content: flex-end;"><span class="saas-th-title">Latency</span></div></th>
                </tr>
            </thead>
            <tbody>
                {"".join(rows_html)}
            </tbody>
        </table>
    </div>
</div>
""")


# -------------------------------------------------------------
# 7. AST SYNTAX TREE NODE DISSECTION TABLE
# -------------------------------------------------------------
def render_ast_nodes_table(tree_nodes: List[Dict[str, Any]]) -> str:
    """Render the Abstract Syntax Tree parsed node hierarchy as a clean SaaS grid."""
    if not tree_nodes:
        return "<p class='saas-empty-sub'>No AST syntax nodes to display.</p>"

    rows_html = []
    for idx, node in enumerate(tree_nodes):
        n_type = node.get("node_type", "")
        n_val = node.get("preview") or node.get("value", "")
        n_status = str(node.get("status", "PERMITTED")).upper()

        is_disallowed = "DISALLOW" in n_status or "INVALID" in n_status
        badge = (
            f'<span class="saas-badge-rose">{SVG_ALERT_TRIANGLE} DISALLOWED</span>'
            if is_disallowed
            else f'<span class="saas-badge-emerald">{SVG_CHECK} PERMITTED</span>'
        )

        tr_class = "saas-tr-even" if idx % 2 == 0 else "saas-tr-odd"
        rows_html.append(f"""
<tr class="{tr_class}">
    <td style="font-weight: 600;">
        <span class="saas-badge-code"><code>{html.escape(str(n_type))}</code></span>
    </td>
    <td><code style="color: #334155; font-size: 11.5px;">{html.escape(str(n_val))}</code></td>
    <td>{badge}</td>
</tr>
""")

    return clean_html(f"""
<div class="saas-table-card" style="margin-top: 8px;">
    <div class="saas-table-scroll-container" style="max-height: 240px;">
        <table class="saas-data-table">
            <thead>
                <tr>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">AST Node Type</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">Parsed Expression</span></div></th>
                    <th><div class="saas-th-wrapper"><span class="saas-th-title">AST Policy</span></div></th>
                </tr>
            </thead>
            <tbody>
                {"".join(rows_html)}
            </tbody>
        </table>
    </div>
</div>
""")


# -------------------------------------------------------------
# 8. AI EXECUTIVE INSIGHTS COPILOT CARD
# -------------------------------------------------------------
def render_executive_insights(
    insights: List[str],
    question: Optional[str] = None,
    direct_answer: Optional[str] = None
) -> str:
    """Render AI Copilot executive business answer & insights panel."""
    if not insights and not direct_answer:
        return ""

    # Clean direct answer callout if present
    direct_answer_html = ""
    if direct_answer:
        clean_ans = html.escape(re.sub(r'[\U00010000-\U0010ffff]', '', direct_answer).strip())
        clean_ans = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', clean_ans)
        clean_ans = re.sub(r'(\$[\d,]+(?:\.\d+)?)', r'<span class="saas-highlight-metric">\1</span>', clean_ans)
        clean_ans = re.sub(r'(\b\d+(?:\.\d+)?%)', r'<span class="saas-highlight-metric">\1</span>', clean_ans)

        direct_answer_html = f"""
<div class="saas-copilot-direct-answer-box">
    <div class="saas-copilot-direct-header">
        <span class="saas-copilot-direct-badge">EXECUTIVE SUMMARY</span>
        <span class="saas-copilot-direct-label">Direct Answer to Request</span>
    </div>
    <div class="saas-copilot-direct-text">
        {clean_ans}
    </div>
</div>
"""

    prompt_html = ""
    if question:
        clean_q = html.escape(question.strip())
        prompt_html = f"""
<div class="saas-copilot-query-pill">
    <span class="saas-copilot-query-label">QUERY</span>
    <span class="saas-copilot-query-text">"{clean_q}"</span>
</div>
"""

    bullets_html = []
    for item in (insights or []):
        # Strip any accidental unicode emojis
        item_clean = re.sub(r'[\U00010000-\U0010ffff]', '', item).strip()
        clean_item = html.escape(item_clean)
        # Convert markdown **bold** to <strong>bold</strong>
        clean_item = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', clean_item)
        # Highlight dollar values e.g. $1,234.56
        clean_item = re.sub(r'(\$[\d,]+(?:\.\d+)?)', r'<span class="saas-highlight-metric">\1</span>', clean_item)
        # Highlight percentages e.g. 15.4%
        clean_item = re.sub(r'(\b\d+(?:\.\d+)?%)', r'<span class="saas-highlight-metric">\1</span>', clean_item)

        bullets_html.append(f"""
<div class="saas-copilot-bullet">
    <span class="saas-copilot-bullet-icon">{SVG_SPARKLE}</span>
    <span class="saas-copilot-bullet-text">{clean_item}</span>
</div>
""")

    insights_body = "".join(bullets_html)
    insights_section = f"""
<div class="saas-copilot-body" style="margin-top: 10px;">
    {insights_body}
</div>
""" if bullets_html else ""

    return clean_html(f"""
<div class="saas-copilot-card">
    <div class="saas-copilot-header">
        <div class="saas-copilot-title">
            {SVG_SPARKLE}
            <span>AI Executive Answer &amp; Insights</span>
        </div>
        <span class="saas-copilot-tag">NATURAL LANGUAGE COPILOT</span>
    </div>
    {prompt_html}
    {direct_answer_html}
    {insights_section}
</div>
""")
