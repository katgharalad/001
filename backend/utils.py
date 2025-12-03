"""
Data management utilities for the FastAPI backend.
Handles loading and caching of CSV files.
"""

import pandas as pd
from pathlib import Path
from typing import Optional


class DataManager:
    """Manages loading and caching of all data files."""
    
    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize DataManager.
        
        Args:
            data_dir: Path to data_processed directory (default: ../data_processed)
        """
        if data_dir is None:
            data_dir = Path(__file__).parent.parent / "data_processed"
        
        self.data_dir = data_dir
        self.state_year_df: Optional[pd.DataFrame] = None
        self.sector_year_df: Optional[pd.DataFrame] = None
        self.similarity_states_df: Optional[pd.DataFrame] = None
        self.similarity_sectors_df: Optional[pd.DataFrame] = None
        self.facility_df: Optional[pd.DataFrame] = None
        self.all_years_df: Optional[pd.DataFrame] = None
        
    def load_all_data(self) -> None:
        """Load all CSV files into memory."""
        try:
            print(f"Loading data from: {self.data_dir}")
            
            # Load state-year aggregates
            state_year_path = self.data_dir / "ghg_state_year.csv"
            if state_year_path.exists():
                self.state_year_df = pd.read_csv(state_year_path)
                print(f"✓ Loaded state-year data: {len(self.state_year_df)} rows")
            else:
                raise FileNotFoundError(f"State-year data not found: {state_year_path}")
            
            # Load sector-year aggregates
            sector_year_path = self.data_dir / "ghg_sector_year.csv"
            if sector_year_path.exists():
                self.sector_year_df = pd.read_csv(sector_year_path)
                print(f"✓ Loaded sector-year data: {len(self.sector_year_df)} rows")
            else:
                raise FileNotFoundError(f"Sector-year data not found: {sector_year_path}")
            
            # Load similarity matrices
            similarity_states_path = self.data_dir / "similarity_states.csv"
            if similarity_states_path.exists():
                sim_df = pd.read_csv(similarity_states_path)
                # Set first column as index if it's the state column
                if 'state' in sim_df.columns:
                    self.similarity_states_df = sim_df.set_index('state')
                else:
                    self.similarity_states_df = sim_df.set_index(sim_df.columns[0])
                print(f"✓ Loaded state similarity matrix: {self.similarity_states_df.shape}")
            else:
                print("⚠ State similarity matrix not found")
                self.similarity_states_df = pd.DataFrame()
            
            similarity_sectors_path = self.data_dir / "similarity_sectors.csv"
            if similarity_sectors_path.exists():
                sim_df = pd.read_csv(similarity_sectors_path)
                # Set first column as index if it's the sector column
                if 'sector' in sim_df.columns:
                    self.similarity_sectors_df = sim_df.set_index('sector')
                else:
                    self.similarity_sectors_df = sim_df.set_index(sim_df.columns[0])
                print(f"✓ Loaded sector similarity matrix: {self.similarity_sectors_df.shape}")
            else:
                print("⚠ Sector similarity matrix not found")
                self.similarity_sectors_df = pd.DataFrame()
            
            # Load facility data
            facility_path = self.data_dir / "ghg_facility_clean.csv"
            if facility_path.exists():
                self.facility_df = pd.read_csv(facility_path)
                print(f"✓ Loaded facility data: {len(self.facility_df)} rows")
            else:
                # Fallback to all_years_clean
                all_years_path = self.data_dir / "ghg_all_years_clean.csv"
                if all_years_path.exists():
                    self.facility_df = pd.read_csv(all_years_path)
                    print(f"✓ Loaded facility data from all_years: {len(self.facility_df)} rows")
                else:
                    print("⚠ Facility data not found")
                    self.facility_df = pd.DataFrame()
            
            # Load all years data (optional, for detailed queries)
            all_years_path = self.data_dir / "ghg_all_years_clean.csv"
            if all_years_path.exists():
                self.all_years_df = pd.read_csv(all_years_path)
                print(f"✓ Loaded all-years data: {len(self.all_years_df)} rows")
            
            print("✓ All data loaded successfully")
            
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            raise

