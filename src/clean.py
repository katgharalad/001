"""
Data cleaning module for GHGRP data.
Standardizes column names, handles missing values, and filters invalid data.
"""

import pandas as pd
import re
from typing import Dict, List


# Column name mapping: original -> standardized
COLUMN_MAPPING = {
    'Facility Id': 'facility_id',
    'FRS Id': 'frs_id',
    'Facility Name': 'facility_name',
    'City': 'city',
    'State': 'state',
    'Zip Code': 'zip_code',
    'Address': 'address',
    'County': 'county',
    'Latitude': 'latitude',
    'Longitude': 'longitude',
    'Primary NAICS Code': 'primary_naics_code',
    'Industry Type (subparts)': 'industry_type_subparts',
    'Industry Type (sectors)': 'industry_type_sectors',
    'Total reported direct emissions': 'total_reported_direct_emissions',
    'CO2 emissions (non-biogenic) ': 'co2_emissions_non_biogenic',
    'CO2 emissions (non-biogenic)': 'co2_emissions_non_biogenic',
    'Methane (CH4) emissions ': 'ch4_emissions',
    'Methane (CH4) emissions': 'ch4_emissions',
    'Nitrous Oxide (N2O) emissions ': 'n2o_emissions',
    'Nitrous Oxide (N2O) emissions': 'n2o_emissions',
    'HFC emissions': 'hfc_emissions',
    'PFC emissions': 'pfc_emissions',
    'SF6 emissions ': 'sf6_emissions',
    'SF6 emissions': 'sf6_emissions',
    'reporting_year': 'reporting_year',
}


def to_snake_case(name: str) -> str:
    """Convert string to snake_case."""
    # Replace spaces and special chars with underscores
    name = re.sub(r'[^\w\s]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name.lower()


def standardize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize column names to snake_case.
    
    Args:
        df: Input DataFrame
        
    Returns:
        DataFrame with standardized column names
    """
    df = df.copy()
    
    # First, try exact mapping
    rename_dict = {}
    for old_name, new_name in COLUMN_MAPPING.items():
        if old_name in df.columns:
            rename_dict[old_name] = new_name
    
    df = df.rename(columns=rename_dict)
    
    # For any remaining columns, convert to snake_case
    remaining_cols = {col: to_snake_case(col) for col in df.columns if col not in rename_dict.values()}
    df = df.rename(columns=remaining_cols)
    
    return df


def standardize_state_abbreviation(state: str) -> str:
    """
    Standardize state abbreviations to uppercase 2-letter codes.
    
    Args:
        state: State name or abbreviation
        
    Returns:
        Standardized state code (or original if not recognized)
    """
    if pd.isna(state):
        return None
    
    state_str = str(state).strip().upper()
    
    # US state abbreviations
    us_states = {
        'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
        'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
        'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
        'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
        'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
        'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
        'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
        'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
        'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
        'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
        'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
        'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
        'WISCONSIN': 'WI', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC'
    }
    
    # If already 2 letters, return as is
    if len(state_str) == 2:
        return state_str
    
    # Try to match full state name
    if state_str in us_states:
        return us_states[state_str]
    
    # Return original if no match
    return state_str


def clean_emissions_column(df: pd.DataFrame, col_name: str) -> pd.Series:
    """
    Clean an emissions column: convert to float, replace missing/negative with 0.
    
    Args:
        df: DataFrame
        col_name: Name of emissions column
        
    Returns:
        Cleaned Series
    """
    if col_name not in df.columns:
        return pd.Series(0, index=df.index)
    
    series = df[col_name].copy()
    
    # Convert to numeric, coercing errors to NaN
    series = pd.to_numeric(series, errors='coerce')
    
    # Replace NaN with 0
    series = series.fillna(0)
    
    # Replace negative values with 0
    series = series.clip(lower=0)
    
    return series


def clean_ghgp_data(df_list: List[pd.DataFrame]) -> pd.DataFrame:
    """
    Clean and combine multiple GHGRP DataFrames.
    
    Args:
        df_list: List of DataFrames from different years
        
    Returns:
        Single cleaned DataFrame
    """
    if not df_list:
        raise ValueError("No DataFrames provided")
    
    # Combine all DataFrames
    df_combined = pd.concat(df_list, ignore_index=True, sort=False)
    
    print(f"Combined {len(df_list)} files: {len(df_combined)} total rows")
    
    # Standardize column names
    df_combined = standardize_column_names(df_combined)
    print("✓ Standardized column names")
    
    # Select required columns (keep all that exist)
    required_cols = [
        'facility_id', 'facility_name', 'city', 'state', 'latitude', 'longitude',
        'primary_naics_code', 'industry_type_sectors', 'industry_type_subparts',
        'total_reported_direct_emissions', 'co2_emissions_non_biogenic',
        'ch4_emissions', 'n2o_emissions', 'reporting_year'
    ]
    
    # Keep only columns that exist
    available_cols = [col for col in required_cols if col in df_combined.columns]
    df_combined = df_combined[available_cols + [col for col in df_combined.columns if col not in required_cols and col not in available_cols]]
    
    # Remove rows with missing facility_id
    initial_rows = len(df_combined)
    df_combined = df_combined.dropna(subset=['facility_id'])
    removed = initial_rows - len(df_combined)
    if removed > 0:
        print(f"✓ Removed {removed} rows with missing facility_id")
    
    # Clean emissions columns
    emissions_cols = [
        'total_reported_direct_emissions', 'co2_emissions_non_biogenic',
        'ch4_emissions', 'n2o_emissions'
    ]
    
    for col in emissions_cols:
        if col in df_combined.columns:
            df_combined[col] = clean_emissions_column(df_combined, col)
    
    print("✓ Cleaned emissions columns")
    
    # Standardize state abbreviations
    if 'state' in df_combined.columns:
        df_combined['state'] = df_combined['state'].apply(standardize_state_abbreviation)
        print("✓ Standardized state abbreviations")
    
    # Convert numeric columns
    numeric_cols = ['latitude', 'longitude', 'primary_naics_code']
    for col in numeric_cols:
        if col in df_combined.columns:
            df_combined[col] = pd.to_numeric(df_combined[col], errors='coerce')
    
    # Remove rows with negative emissions (already handled in clean_emissions_column, but double-check)
    for col in emissions_cols:
        if col in df_combined.columns:
            negative_count = (df_combined[col] < 0).sum()
            if negative_count > 0:
                df_combined.loc[df_combined[col] < 0, col] = 0
    
    print(f"✓ Final cleaned dataset: {len(df_combined)} rows, {len(df_combined.columns)} columns")
    
    return df_combined


if __name__ == "__main__":
    # Test cleaning
    from .ingest import load_all_ghgp_files
    
    dfs = load_all_ghgp_files()
    if dfs:
        df_clean = clean_ghgp_data(dfs)
        print(f"\nCleaned data shape: {df_clean.shape}")
        print(f"\nColumns: {list(df_clean.columns)}")
        print(f"\nSample data:\n{df_clean.head()}")



