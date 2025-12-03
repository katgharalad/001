"""
Utility functions for GHGRP data processing.
"""

import os
import re
from pathlib import Path
from typing import List, Optional


def extract_year_from_filename(filename: str) -> Optional[int]:
    """
    Extract reporting year from filename.
    
    Args:
        filename: Excel filename (e.g., 'ghgp_data_2023.xlsx')
        
    Returns:
        Year as integer or None if not found
    """
    match = re.search(r'(\d{4})', filename)
    if match:
        return int(match.group(1))
    return None


def get_data_raw_path() -> Path:
    """Get path to data_raw directory."""
    return Path(__file__).parent.parent / "data_raw"


def get_data_processed_path() -> Path:
    """Get path to data_processed directory."""
    return Path(__file__).parent.parent / "data_processed"


def ensure_directory_exists(path: Path) -> None:
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)


def find_excel_files(data_dir: Path) -> List[Path]:
    """
    Find all GHGRP Excel files in data directory.
    
    Args:
        data_dir: Path to data directory
        
    Returns:
        List of Excel file paths, sorted by year
    """
    files = list(data_dir.glob("ghgp_data_*.xlsx"))
    # Sort by year extracted from filename
    files.sort(key=lambda f: extract_year_from_filename(f.name) or 0)
    return files



