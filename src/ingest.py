"""
Data ingestion module for GHGRP Excel files.
Loads all Excel files from data_raw directory and combines them.
"""

import pandas as pd
import warnings
from pathlib import Path
from typing import List, Optional
from .utils import get_data_raw_path, find_excel_files, extract_year_from_filename


def find_direct_emitters_sheet(excel_file: Path) -> Optional[str]:
    """
    Find the sheet name containing 'Direct Emitters' or 'Facility Id'.
    
    Args:
        excel_file: Path to Excel file
        
    Returns:
        Sheet name or None if not found
    """
    try:
        xl_file = pd.ExcelFile(excel_file)
        for sheet_name in xl_file.sheet_names:
            # Try to read first few rows to check for Facility Id
            df_test = pd.read_excel(excel_file, sheet_name=sheet_name, header=None, nrows=5)
            # Check if 'Facility Id' appears in any row
            if df_test.astype(str).apply(lambda x: x.str.contains('Facility Id', case=False, na=False)).any().any():
                return sheet_name
        # Fallback: check sheet names for keywords
        for sheet_name in xl_file.sheet_names:
            if 'direct' in sheet_name.lower() and 'emitter' in sheet_name.lower():
                return sheet_name
        # Last resort: return first sheet
        return xl_file.sheet_names[0] if xl_file.sheet_names else None
    except Exception as e:
        warnings.warn(f"Error reading {excel_file}: {e}")
        return None


def find_header_row(excel_file: Path, sheet_name: str) -> int:
    """
    Find the row index containing column headers (looking for 'Facility Id').
    
    Args:
        excel_file: Path to Excel file
        sheet_name: Name of sheet to read
        
    Returns:
        Row index (0-based) for header, default 3
    """
    try:
        df_test = pd.read_excel(excel_file, sheet_name=sheet_name, header=None, nrows=10)
        for idx in range(min(10, len(df_test))):
            row_values = df_test.iloc[idx].astype(str).str.lower().tolist()
            if any('facility id' in str(val) for val in row_values):
                return idx
    except Exception:
        pass
    # Default based on observed structure
    return 3


def load_ghgp_file(excel_file: Path, reporting_year: Optional[int] = None) -> Optional[pd.DataFrame]:
    """
    Load a single GHGRP Excel file.
    
    Args:
        excel_file: Path to Excel file
        reporting_year: Year to assign (if None, extracted from filename)
        
    Returns:
        DataFrame with added 'reporting_year' column, or None if error
    """
    if reporting_year is None:
        reporting_year = extract_year_from_filename(excel_file.name)
    
    if reporting_year is None:
        warnings.warn(f"Could not extract year from {excel_file.name}, skipping")
        return None
    
    sheet_name = find_direct_emitters_sheet(excel_file)
    if sheet_name is None:
        warnings.warn(f"Could not find Direct Emitters sheet in {excel_file.name}, skipping")
        return None
    
    header_row = find_header_row(excel_file, sheet_name)
    
    try:
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row)
        
        # Add reporting year column
        df['reporting_year'] = reporting_year
        
        return df
    except Exception as e:
        warnings.warn(f"Error loading {excel_file.name}: {e}")
        return None


def load_all_ghgp_files(data_dir: Optional[Path] = None) -> List[pd.DataFrame]:
    """
    Load all GHGRP Excel files from data_raw directory.
    
    Args:
        data_dir: Path to data directory (default: data_raw)
        
    Returns:
        List of DataFrames, one per year
    """
    if data_dir is None:
        data_dir = get_data_raw_path()
    
    excel_files = find_excel_files(data_dir)
    dataframes = []
    
    for excel_file in excel_files:
        df = load_ghgp_file(excel_file)
        if df is not None and not df.empty:
            dataframes.append(df)
            print(f"✓ Loaded {excel_file.name}: {len(df)} rows, {len(df.columns)} columns")
        else:
            print(f"✗ Failed to load {excel_file.name}")
    
    return dataframes


if __name__ == "__main__":
    # Test ingestion
    dfs = load_all_ghgp_files()
    print(f"\nTotal files loaded: {len(dfs)}")
    if dfs:
        print(f"Sample columns from first file: {list(dfs[0].columns)[:10]}")



