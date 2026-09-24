"""Dynamic PII Masking Engine using Hashing Algorithms.

Detects sensitive columns (emails, contact numbers, phone numbers, identifiers)
and dynamically masks them using cryptographic SHA-256 hashing to preserve data privacy.
"""

import hashlib
import re
from typing import Tuple, List
import pandas as pd

# Sensitive column patterns
PII_COLUMN_PATTERNS = [
    r"email",
    r"phone",
    r"contact",
    r"mobile",
    r"ssn",
    r"social_security",
    r"credit_card",
    r"card_number",
    r"tax_id",
    r"password",
    r"secret"
]


def hash_value(val: str, salt: str = "secure_salt_2026") -> str:
    """Generate deterministic SHA-256 hash mask for sensitive string."""
    if val is None or pd.isna(val):
        return ""
    str_val = str(val).strip()
    if not str_val:
        return ""
    digest = hashlib.sha256(f"{salt}:{str_val}".encode("utf-8")).hexdigest()
    # Format as clean hashed badge showing cryptographic masking
    return f"SHA256:{digest[:12]}..."


def mask_dataframe_pii(df: pd.DataFrame, enabled: bool = True) -> Tuple[pd.DataFrame, List[str]]:
    """Inspect DataFrame and dynamically apply SHA-256 hashing to PII columns.

    Returns:
        (masked_df, list_of_masked_columns)
    """
    if not enabled or df.empty:
        return df, []

    df_masked = df.copy()
    masked_cols: List[str] = []

    for col in df.columns:
        col_str = str(col).lower().replace(" ", "_").replace("-", "_")
        if any(re.search(pattern, col_str) for pattern in PII_COLUMN_PATTERNS):
            masked_cols.append(str(col))
            df_masked[col] = df_masked[col].apply(hash_value)

    return df_masked, masked_cols
