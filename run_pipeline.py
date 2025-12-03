"""
Main pipeline script to run all GHGRP data processing steps.
This script orchestrates ingestion, cleaning, transformation, and similarity computation.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.ingest import load_all_ghgp_files
from src.clean import clean_ghgp_data
from src.transform import create_all_transformations
from src.similarity import (
    compute_state_similarity,
    compute_sector_similarity,
    save_similarity_matrix
)
from src.utils import get_data_processed_path, ensure_directory_exists


def main():
    """Run the complete data processing pipeline."""
    
    print("=" * 60)
    print("GHGRP United States Emissions Analytics Pipeline")
    print("=" * 60)
    
    # Ensure output directory exists
    output_dir = get_data_processed_path()
    ensure_directory_exists(output_dir)
    print(f"\nOutput directory: {output_dir}")
    
    # Step 1: Ingestion
    print("\n" + "=" * 60)
    print("STEP 1: Data Ingestion")
    print("=" * 60)
    dfs = load_all_ghgp_files()
    
    if not dfs:
        print("ERROR: No data files loaded. Exiting.")
        return
    
    print(f"\n✓ Successfully loaded {len(dfs)} files")
    
    # Step 2: Cleaning
    print("\n" + "=" * 60)
    print("STEP 2: Data Cleaning")
    print("=" * 60)
    df_clean = clean_ghgp_data(dfs)
    
    # Save cleaned dataset
    output_file = output_dir / "ghg_all_years_clean.csv"
    df_clean.to_csv(output_file, index=False)
    print(f"✓ Saved cleaned dataset to {output_file}")
    
    # Step 3: Transformation
    print("\n" + "=" * 60)
    print("STEP 3: Data Transformation")
    print("=" * 60)
    transformations = create_all_transformations(df_clean)
    
    # Save transformed datasets
    print("\nSaving transformed datasets...")
    
    # State-year aggregates
    state_year_file = output_dir / "ghg_state_year.csv"
    transformations['state_year'].to_csv(state_year_file, index=False)
    print(f"✓ Saved state-year aggregates to {state_year_file}")
    
    # Sector-year aggregates
    sector_year_file = output_dir / "ghg_sector_year.csv"
    transformations['sector_year'].to_csv(sector_year_file, index=False)
    print(f"✓ Saved sector-year aggregates to {sector_year_file}")
    
    # Facility-level export
    facility_file = output_dir / "ghg_facility_clean.csv"
    transformations['facility'].to_csv(facility_file, index=False)
    print(f"✓ Saved facility-level data to {facility_file}")
    
    # Step 4: Similarity Computation
    print("\n" + "=" * 60)
    print("STEP 4: Cosine Similarity Computation")
    print("=" * 60)
    
    # State similarity
    print("\nComputing state similarity matrix...")
    state_sim = compute_state_similarity(transformations['state_features'])
    state_sim_file = output_dir / "similarity_states.csv"
    save_similarity_matrix(state_sim, str(state_sim_file), entity_name='state')
    
    # Sector similarity
    print("\nComputing sector similarity matrix...")
    sector_sim = compute_sector_similarity(transformations['sector_features'])
    sector_sim_file = output_dir / "similarity_sectors.csv"
    save_similarity_matrix(sector_sim, str(sector_sim_file), entity_name='sector')
    
    # Summary
    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)
    print(f"\nOutput files saved to: {output_dir}")
    print("\nGenerated files:")
    print(f"  - ghg_all_years_clean.csv ({len(df_clean):,} rows)")
    print(f"  - ghg_state_year.csv ({len(transformations['state_year']):,} rows)")
    print(f"  - ghg_sector_year.csv ({len(transformations['sector_year']):,} rows)")
    print(f"  - ghg_facility_clean.csv ({len(transformations['facility']):,} rows)")
    print(f"  - similarity_states.csv ({state_sim.shape[0]} x {state_sim.shape[1]})")
    print(f"  - similarity_sectors.csv ({sector_sim.shape[0]} x {sector_sim.shape[1]})")
    print("\n✓ All processing steps completed successfully!")


if __name__ == "__main__":
    main()

