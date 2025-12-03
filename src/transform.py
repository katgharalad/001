"""
Data transformation module for GHGRP data.
Creates aggregated datasets for state-year, sector-year, and facility-level analysis.
"""

import pandas as pd
import numpy as np
from typing import Dict


def aggregate_state_year(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate emissions by state and year.
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        DataFrame with columns: state, year, total_emissions, co2, ch4, n2o, facility_count
    """
    if 'state' not in df.columns or 'reporting_year' not in df.columns:
        raise ValueError("DataFrame must contain 'state' and 'reporting_year' columns")
    
    agg_dict = {}
    
    # Aggregate emissions (use actual column names)
    if 'total_reported_direct_emissions' in df.columns:
        agg_dict['total_reported_direct_emissions'] = 'sum'
    if 'co2_emissions_non_biogenic' in df.columns:
        agg_dict['co2_emissions_non_biogenic'] = 'sum'
    if 'ch4_emissions' in df.columns:
        agg_dict['ch4_emissions'] = 'sum'
    if 'n2o_emissions' in df.columns:
        agg_dict['n2o_emissions'] = 'sum'
    
    # Count facilities
    agg_dict['facility_id'] = 'count'
    
    df_agg = df.groupby(['state', 'reporting_year']).agg(agg_dict).reset_index()
    
    # Rename columns to output format
    rename_dict = {
        'facility_id': 'facility_count',
        'reporting_year': 'year',
        'total_reported_direct_emissions': 'total_emissions',
        'co2_emissions_non_biogenic': 'co2',
        'ch4_emissions': 'ch4',
        'n2o_emissions': 'n2o'
    }
    df_agg = df_agg.rename(columns=rename_dict)
    
    # Fill missing values with 0
    emissions_cols = ['total_emissions', 'co2', 'ch4', 'n2o']
    for col in emissions_cols:
        if col in df_agg.columns:
            df_agg[col] = df_agg[col].fillna(0)
    
    # Sort by state and year
    df_agg = df_agg.sort_values(['state', 'year'])
    
    return df_agg


def aggregate_sector_year(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate emissions by sector and year.
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        DataFrame with columns: sector, year, total_emissions, co2, ch4, n2o, facility_count
    """
    if 'industry_type_sectors' not in df.columns or 'reporting_year' not in df.columns:
        raise ValueError("DataFrame must contain 'industry_type_sectors' and 'reporting_year' columns")
    
    # Handle missing sectors
    df_work = df.copy()
    df_work['sector'] = df_work['industry_type_sectors'].fillna('Unknown')
    
    agg_dict = {}
    
    # Aggregate emissions (use actual column names)
    if 'total_reported_direct_emissions' in df_work.columns:
        agg_dict['total_reported_direct_emissions'] = 'sum'
    if 'co2_emissions_non_biogenic' in df_work.columns:
        agg_dict['co2_emissions_non_biogenic'] = 'sum'
    if 'ch4_emissions' in df_work.columns:
        agg_dict['ch4_emissions'] = 'sum'
    if 'n2o_emissions' in df_work.columns:
        agg_dict['n2o_emissions'] = 'sum'
    
    # Count facilities
    agg_dict['facility_id'] = 'count'
    
    df_agg = df_work.groupby(['sector', 'reporting_year']).agg(agg_dict).reset_index()
    
    # Rename columns to output format
    rename_dict = {
        'facility_id': 'facility_count',
        'reporting_year': 'year',
        'total_reported_direct_emissions': 'total_emissions',
        'co2_emissions_non_biogenic': 'co2',
        'ch4_emissions': 'ch4',
        'n2o_emissions': 'n2o'
    }
    df_agg = df_agg.rename(columns=rename_dict)
    
    # Fill missing values with 0
    emissions_cols = ['total_emissions', 'co2', 'ch4', 'n2o']
    for col in emissions_cols:
        if col in df_agg.columns:
            df_agg[col] = df_agg[col].fillna(0)
    
    # Sort by sector and year
    df_agg = df_agg.sort_values(['sector', 'year'])
    
    return df_agg


def prepare_facility_export(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare facility-level cleaned export.
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        Cleaned facility-level DataFrame
    """
    # Select key columns for facility export
    facility_cols = [
        'facility_id', 'facility_name', 'city', 'state', 'latitude', 'longitude',
        'primary_naics_code', 'industry_type_sectors', 'industry_type_subparts',
        'total_reported_direct_emissions', 'co2_emissions_non_biogenic',
        'ch4_emissions', 'n2o_emissions', 'reporting_year'
    ]
    
    # Keep only columns that exist
    available_cols = [col for col in facility_cols if col in df.columns]
    df_export = df[available_cols].copy()
    
    return df_export


def create_state_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create feature matrix for states (for similarity analysis).
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        DataFrame with state features (normalized)
    """
    if 'state' not in df.columns:
        raise ValueError("DataFrame must contain 'state' column")
    
    # Aggregate by state (across all years)
    agg_dict = {}
    
    if 'total_reported_direct_emissions' in df.columns:
        agg_dict['total_reported_direct_emissions'] = 'sum'
    if 'co2_emissions_non_biogenic' in df.columns:
        agg_dict['co2_emissions_non_biogenic'] = 'sum'
    if 'ch4_emissions' in df.columns:
        agg_dict['ch4_emissions'] = 'sum'
    if 'n2o_emissions' in df.columns:
        agg_dict['n2o_emissions'] = 'sum'
    
    agg_dict['facility_id'] = 'count'
    
    df_state = df.groupby('state').agg(agg_dict).reset_index()
    
    # Rename columns
    rename_dict = {
        'facility_id': 'facility_count',
        'total_reported_direct_emissions': 'total_emissions',
        'co2_emissions_non_biogenic': 'co2',
        'ch4_emissions': 'ch4',
        'n2o_emissions': 'n2o'
    }
    df_state = df_state.rename(columns=rename_dict)
    
    # Calculate derived features
    if 'total_emissions' in df_state.columns and 'facility_count' in df_state.columns:
        df_state['mean_emissions_per_facility'] = (
            df_state['total_emissions'] / df_state['facility_count'].replace(0, 1)
        )
    
    if 'total_emissions' in df_state.columns:
        total = df_state['total_emissions'].sum()
        if total > 0:
            if 'co2' in df_state.columns:
                df_state['share_co2'] = df_state['co2'] / df_state['total_emissions'].replace(0, 1)
            if 'ch4' in df_state.columns:
                df_state['share_ch4'] = df_state['ch4'] / df_state['total_emissions'].replace(0, 1)
            if 'n2o' in df_state.columns:
                df_state['share_n2o'] = df_state['n2o'] / df_state['total_emissions'].replace(0, 1)
    
    # Fill NaN values
    df_state = df_state.fillna(0)
    
    return df_state


def create_sector_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create feature matrix for sectors (for similarity analysis).
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        DataFrame with sector features (normalized)
    """
    if 'industry_type_sectors' not in df.columns:
        raise ValueError("DataFrame must contain 'industry_type_sectors' column")
    
    df_work = df.copy()
    df_work['sector'] = df_work['industry_type_sectors'].fillna('Unknown')
    
    # Aggregate by sector (across all years)
    agg_dict = {}
    
    if 'total_reported_direct_emissions' in df_work.columns:
        agg_dict['total_reported_direct_emissions'] = 'sum'
    if 'co2_emissions_non_biogenic' in df_work.columns:
        agg_dict['co2_emissions_non_biogenic'] = 'sum'
    if 'ch4_emissions' in df_work.columns:
        agg_dict['ch4_emissions'] = 'sum'
    if 'n2o_emissions' in df_work.columns:
        agg_dict['n2o_emissions'] = 'sum'
    
    agg_dict['facility_id'] = 'count'
    
    df_sector = df_work.groupby('sector').agg(agg_dict).reset_index()
    
    # Rename columns
    rename_dict = {
        'facility_id': 'facility_count',
        'total_reported_direct_emissions': 'total_emissions',
        'co2_emissions_non_biogenic': 'co2',
        'ch4_emissions': 'ch4',
        'n2o_emissions': 'n2o'
    }
    df_sector = df_sector.rename(columns=rename_dict)
    
    # Calculate derived features
    if 'total_emissions' in df_sector.columns and 'facility_count' in df_sector.columns:
        df_sector['mean_emissions_per_facility'] = (
            df_sector['total_emissions'] / df_sector['facility_count'].replace(0, 1)
        )
    
    if 'total_emissions' in df_sector.columns:
        if 'co2' in df_sector.columns:
            df_sector['share_co2'] = df_sector['co2'] / df_sector['total_emissions'].replace(0, 1)
        if 'ch4' in df_sector.columns:
            df_sector['share_ch4'] = df_sector['ch4'] / df_sector['total_emissions'].replace(0, 1)
        if 'n2o' in df_sector.columns:
            df_sector['share_n2o'] = df_sector['n2o'] / df_sector['total_emissions'].replace(0, 1)
    
    # Fill NaN values
    df_sector = df_sector.fillna(0)
    
    return df_sector


def create_all_transformations(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """
    Create all transformation outputs.
    
    Args:
        df: Cleaned GHGRP DataFrame
        
    Returns:
        Dictionary of transformed DataFrames
    """
    results = {}
    
    print("Creating state-year aggregates...")
    results['state_year'] = aggregate_state_year(df)
    print(f"✓ State-year: {len(results['state_year'])} rows")
    
    print("Creating sector-year aggregates...")
    results['sector_year'] = aggregate_sector_year(df)
    print(f"✓ Sector-year: {len(results['sector_year'])} rows")
    
    print("Preparing facility export...")
    results['facility'] = prepare_facility_export(df)
    print(f"✓ Facility: {len(results['facility'])} rows")
    
    print("Creating state feature matrix...")
    results['state_features'] = create_state_feature_matrix(df)
    print(f"✓ State features: {len(results['state_features'])} rows")
    
    print("Creating sector feature matrix...")
    results['sector_features'] = create_sector_feature_matrix(df)
    print(f"✓ Sector features: {len(results['sector_features'])} rows")
    
    return results


if __name__ == "__main__":
    # Test transformations
    from .ingest import load_all_ghgp_files
    from .clean import clean_ghgp_data
    
    dfs = load_all_ghgp_files()
    if dfs:
        df_clean = clean_ghgp_data(dfs)
        results = create_all_transformations(df_clean)
        
        print("\n=== Transformation Results ===")
        for key, df_result in results.items():
            print(f"\n{key}:")
            print(df_result.head())

