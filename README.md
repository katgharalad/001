# GHGRP United States Emissions Analytics Stack (2010-2023)

Complete data analytics system for EPA Greenhouse Gas Reporting Program (GHGRP) datasets.

## 📋 Overview

This project provides a comprehensive data pipeline for analyzing 14 years of greenhouse gas emissions data from US facilities. The system includes:

- **Data Ingestion**: Automated loading of Excel files from multiple years
- **Data Cleaning**: Standardization and normalization across all datasets
- **Data Transformation**: Aggregated datasets for state-year, sector-year, and facility-level analysis
- **Similarity Analysis**: Cosine similarity matrices for states and sectors
- **Exploratory Data Analysis**: Complete Jupyter notebook with visualizations
- **Power BI Ready**: Exportable CSV files for dashboard creation

## 📁 Project Structure

```
dataproj2/
│
├── data_raw/                    # Original Excel files
│   ├── ghgp_data_2010.xlsx
│   ├── ghgp_data_2011.xlsx
│   ├── ...
│   └── ghgp_data_2023.xlsx
│
├── data_processed/               # Cleaned and transformed datasets
│   ├── ghg_all_years_clean.csv
│   ├── ghg_state_year.csv
│   ├── ghg_sector_year.csv
│   ├── ghg_facility_clean.csv
│   ├── similarity_states.csv
│   └── similarity_sectors.csv
│
├── notebooks/
│   └── ghg_analysis.ipynb       # Complete EDA notebook
│
├── src/                         # Source code modules
│   ├── __init__.py
│   ├── ingest.py               # Data ingestion
│   ├── clean.py                # Data cleaning
│   ├── transform.py            # Data transformation
│   ├── similarity.py           # Cosine similarity
│   └── utils.py                # Utility functions
│
├── run_pipeline.py             # Main pipeline script
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

```bash
pip install pandas numpy matplotlib seaborn scikit-learn openpyxl scipy jupyter
```

### Running the Pipeline

1. **Run the complete data processing pipeline**:
   ```bash
   python run_pipeline.py
   ```

   This will:
   - Load all Excel files from `data_raw/`
   - Clean and standardize the data
   - Create aggregated datasets
   - Compute similarity matrices
   - Export all CSV files to `data_processed/`

2. **Open the Jupyter notebook**:
   ```bash
   jupyter notebook notebooks/ghg_analysis.ipynb
   ```

## 📊 Generated Datasets

### 1. `ghg_all_years_clean.csv`
Complete cleaned dataset with all facilities from 2010-2023.

**Key Columns**:
- `facility_id`, `facility_name`, `city`, `state`
- `latitude`, `longitude`
- `primary_naics_code`, `industry_type_sectors`, `industry_type_subparts`
- `total_reported_direct_emissions`
- `co2_emissions_non_biogenic`, `ch4_emissions`, `n2o_emissions`
- `reporting_year`

### 2. `ghg_state_year.csv`
Aggregated emissions by state and year.

**Columns**: `state`, `year`, `total_emissions`, `co2`, `ch4`, `n2o`, `facility_count`

### 3. `ghg_sector_year.csv`
Aggregated emissions by sector and year.

**Columns**: `sector`, `year`, `total_emissions`, `co2`, `ch4`, `n2o`, `facility_count`

### 4. `ghg_facility_clean.csv`
Facility-level cleaned export (same structure as `ghg_all_years_clean.csv`).

### 5. `similarity_states.csv`
Cosine similarity matrix comparing states by emissions profile.

### 6. `similarity_sectors.csv`
Cosine similarity matrix comparing sectors by emissions profile.

## 📈 Power BI Dashboard Design Guide

### Recommended Dashboard Layout

#### **Page 1: Overview Dashboard**

**KPIs (Top Row)**:
1. **Total Emissions (2010-2023)**: Sum of `total_emissions` from `ghg_state_year.csv`
2. **Total Facilities**: Count from `ghg_facility_clean.csv`
3. **Average Annual Emissions**: Average of yearly totals
4. **Top Emitting State**: Max state from `ghg_state_year.csv`

**Slicers (Left Sidebar)**:
- **Year**: Multi-select slicer from `reporting_year` (2010-2023)
- **State**: Multi-select slicer from `state`
- **Sector**: Multi-select slicer from `industry_type_sectors`

**Visualizations**:

1. **Line Chart - Emissions Trend**
   - X-axis: `year` (from `ghg_state_year.csv`)
   - Y-axis: `total_emissions` (sum)
   - Title: "US Total Emissions Over Time"

2. **Bar Chart - Top States**
   - X-axis: `state` (top 10 by `total_emissions`)
   - Y-axis: `total_emissions` (sum)
   - Title: "Top 10 States by Emissions"
   - Sort: Descending by `total_emissions`

3. **Bar Chart - Top Sectors**
   - X-axis: `industry_type_sectors` (top 10)
   - Y-axis: `total_emissions` (sum)
   - Title: "Top 10 Sectors by Emissions"

4. **Pie Chart - Emissions by Sector**
   - Values: `total_emissions` (sum)
   - Legend: `industry_type_sectors`
   - Title: "Emissions Distribution by Sector"

5. **Map Visualization**
   - Use `latitude` and `longitude` from `ghg_facility_clean.csv`
   - Size by `total_reported_direct_emissions`
   - Color by `state`
   - Title: "Facility Locations and Emissions"

6. **Table - Facility Details**
   - Columns: `facility_name`, `state`, `industry_type_sectors`, `total_reported_direct_emissions`
   - Sortable by any column
   - Title: "Facility Details"

#### **Page 2: State Analysis**

**Visualizations**:
1. **State Comparison Matrix**: Heatmap using `similarity_states.csv`
2. **State-Year Trend**: Line chart with multiple states
3. **State Emissions Breakdown**: Stacked bar chart (CO2, CH4, N2O)

#### **Page 3: Sector Analysis**

**Visualizations**:
1. **Sector Comparison Matrix**: Heatmap using `similarity_sectors.csv`
2. **Sector-Year Trend**: Line chart with multiple sectors
3. **Sector Emissions Breakdown**: Stacked bar chart (CO2, CH4, N2O)

### Power BI Import Steps

1. **Open Power BI Desktop**
2. **Get Data** → **Text/CSV**
3. **Import the following files**:
   - `ghg_all_years_clean.csv` (primary fact table)
   - `ghg_state_year.csv` (for state aggregations)
   - `ghg_sector_year.csv` (for sector aggregations)
   - `ghg_facility_clean.csv` (for facility details)
   - `similarity_states.csv` (optional, for state comparison)
   - `similarity_sectors.csv` (optional, for sector comparison)

4. **Create Relationships**:
   - Link `ghg_all_years_clean.csv` to `ghg_state_year.csv` on `state` and `reporting_year`
   - Link `ghg_all_years_clean.csv` to `ghg_sector_year.csv` on `industry_type_sectors` and `reporting_year`

5. **Build Visualizations** as described above

### Recommended Measures (DAX)

```dax
Total Emissions = SUM(ghg_all_years_clean[total_reported_direct_emissions])

Total CO2 = SUM(ghg_all_years_clean[co2_emissions_non_biogenic])

Total CH4 = SUM(ghg_all_years_clean[ch4_emissions])

Total N2O = SUM(ghg_all_years_clean[n2o_emissions])

Average Emissions per Facility = 
    DIVIDE(
        [Total Emissions],
        DISTINCTCOUNT(ghg_all_years_clean[facility_id])
    )

Year over Year Change = 
    VAR CurrentYear = MAX(ghg_all_years_clean[reporting_year])
    VAR PreviousYear = CurrentYear - 1
    VAR CurrentValue = CALCULATE([Total Emissions], ghg_all_years_clean[reporting_year] = CurrentYear)
    VAR PreviousValue = CALCULATE([Total Emissions], ghg_all_years_clean[reporting_year] = PreviousYear)
    RETURN
        DIVIDE(CurrentValue - PreviousValue, PreviousValue)
```

## 🔍 Analysis Notebook

The `notebooks/ghg_analysis.ipynb` notebook includes:

### Part 1: Dataset Structure + Trends
- Dataset information and statistics
- Missing values analysis
- Key columns description
- US total emissions trend (2010-2023)

### Part 2: EDA and Insights
- Top 5 states by emissions
- Top 5 sectors by emissions
- Outlier detection (Z-score and IQR methods)
- Boxplot analysis

### Part 3: Visualizations
- **Trend Visualization**: Line chart of emissions over time
- **Category Comparison**: Bar charts for top states and sectors
- **Distribution**: Histograms (linear and log scale)
- **Relationships**: Scatter plots (CO2 vs CH4, CO2 share vs total)
- **Proportions**: Pie chart of emissions by sector

## 🛠️ Module Documentation

### `src/ingest.py`
- `load_all_ghgp_files()`: Load all Excel files from `data_raw/`
- `load_ghgp_file()`: Load a single Excel file
- `find_direct_emitters_sheet()`: Automatically detect the correct sheet

### `src/clean.py`
- `clean_ghgp_data()`: Main cleaning function
- `standardize_column_names()`: Convert to snake_case
- `standardize_state_abbreviation()`: Normalize state codes
- `clean_emissions_column()`: Handle missing/negative values

### `src/transform.py`
- `aggregate_state_year()`: Create state-year aggregates
- `aggregate_sector_year()`: Create sector-year aggregates
- `create_state_feature_matrix()`: Features for similarity analysis
- `create_sector_feature_matrix()`: Features for similarity analysis

### `src/similarity.py`
- `compute_state_similarity()`: Cosine similarity matrix for states
- `compute_sector_similarity()`: Cosine similarity matrix for sectors

## 📝 Data Quality Notes

- **Missing Values**: Handled by setting emissions to 0 (not NaN)
- **Negative Emissions**: Clipped to 0
- **State Codes**: Standardized to 2-letter uppercase abbreviations
- **Column Names**: Standardized to snake_case
- **Data Types**: Numeric columns properly typed

## 🎯 Key Insights

From the analysis:
- **Total Facilities**: ~103,000 facility-year records (2010-2023)
- **Geographic Coverage**: All 50 US states + DC
- **Sector Diversity**: Multiple industry sectors represented
- **Temporal Coverage**: 14 years of consistent reporting

## 📚 References

- **EPA GHGRP**: [Greenhouse Gas Reporting Program](https://www.epa.gov/ghgreporting)
- **Data Units**: All emissions in metric tons CO2 equivalent (using IPCC AR4 GWP values)

## 🔧 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'openpyxl'"
**Solution**: `pip install openpyxl`

### Issue: Excel files not found
**Solution**: Ensure all `ghgp_data_*.xlsx` files are in `data_raw/` directory

### Issue: Column names don't match
**Solution**: The ingestion module automatically handles variations in column names across years

## 📄 License

This project is for educational/academic purposes.

---

**Generated by**: GHGRP Analytics Pipeline  
**Last Updated**: 2024



