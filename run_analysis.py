"""
Run the complete EDA analysis from the notebook.
This script executes all analysis cells and generates outputs.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
from scipy import stats
warnings.filterwarnings('ignore')

# Set style
try:
    plt.style.use('seaborn-v0_8-darkgrid')
except:
    plt.style.use('seaborn-darkgrid')
sns.set_palette("husl")

# Set display options
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', 100)
pd.set_option('display.float_format', lambda x: f'{x:,.2f}')

print("=" * 60)
print("GHGRP UNITED STATES EMISSIONS ANALYTICS")
print("=" * 60)
print("\nLibraries imported successfully!")
print(f"Pandas version: {pd.__version__}")
print(f"NumPy version: {np.__version__}")

# Load the cleaned dataset
print("\n" + "=" * 60)
print("LOADING DATA")
print("=" * 60)
data_path = Path('data_processed/ghg_all_years_clean.csv')
df = pd.read_csv(data_path)

print(f"Dataset loaded: {len(df):,} rows, {len(df.columns)} columns")
print(f"Date range: {df['reporting_year'].min()} - {df['reporting_year'].max()}")

# PART 1: Dataset Structure
print("\n" + "=" * 60)
print("PART 1: DATASET STRUCTURE")
print("=" * 60)

print("\nDataset Information:")
print(f"  Shape: {df.shape}")
print(f"  Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

print("\nMissing Values Report:")
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(2)
missing_df = pd.DataFrame({
    'Missing Count': missing,
    'Missing Percentage': missing_pct
})
missing_df = missing_df[missing_df['Missing Count'] > 0].sort_values('Missing Count', ascending=False)
if len(missing_df) > 0:
    print(missing_df.head(10))
else:
    print("  No missing values found!")

# Statistical summary
print("\nStatistical Summary (Key Numeric Columns):")
numeric_cols = ['total_reported_direct_emissions', 'co2_emissions_non_biogenic', 
                'ch4_emissions', 'n2o_emissions']
available_cols = [col for col in numeric_cols if col in df.columns]
if available_cols:
    print(df[available_cols].describe())

# PART 1.2: Trends Over Time
print("\n" + "=" * 60)
print("PART 1.2: TRENDS OVER TIME")
print("=" * 60)

# Load aggregated data
state_year = pd.read_csv('data_processed/ghg_state_year.csv')
sector_year = pd.read_csv('data_processed/ghg_sector_year.csv')

# US total emissions by year
us_totals = df.groupby('reporting_year')['total_reported_direct_emissions'].sum().reset_index()
us_totals.columns = ['year', 'total_emissions']

print("\nUS Total Emissions by Year:")
print(us_totals.to_string(index=False))

total_change = ((us_totals.iloc[-1]['total_emissions'] - us_totals.iloc[0]['total_emissions']) / 
                us_totals.iloc[0]['total_emissions'] * 100)
print(f"\nTotal emissions change (2010-2023): {total_change:.2f}%")
print(f"2010: {us_totals.iloc[0]['total_emissions']/1e6:.2f} Million MT CO2e")
print(f"2023: {us_totals.iloc[-1]['total_emissions']/1e6:.2f} Million MT CO2e")

# Create trend visualization
plt.figure(figsize=(12, 6))
plt.plot(us_totals['year'], us_totals['total_emissions'] / 1e6, 
         marker='o', linewidth=2, markersize=8, color='#2E86AB')
plt.title('US Total Greenhouse Gas Emissions (2010-2023)', fontsize=16, fontweight='bold')
plt.xlabel('Year', fontsize=12)
plt.ylabel('Total Emissions (Million Metric Tons CO2e)', fontsize=12)
plt.grid(True, alpha=0.3)
plt.xticks(us_totals['year'], rotation=45)
plt.tight_layout()
plt.savefig('data_processed/trend_emissions_over_time.png', dpi=150, bbox_inches='tight')
print("\n✓ Saved trend chart: data_processed/trend_emissions_over_time.png")
plt.close()

# PART 2: EDA and Insights
print("\n" + "=" * 60)
print("PART 2: EDA AND INSIGHTS")
print("=" * 60)

# Top 5 States
print("\n--- Top 5 States by Total Emissions (2010-2023) ---")
state_totals = df.groupby('state')['total_reported_direct_emissions'].sum().reset_index()
state_totals = state_totals.sort_values('total_reported_direct_emissions', ascending=False)
top5_states = state_totals.head(5)
top5_states['total_emissions_mt'] = top5_states['total_reported_direct_emissions'] / 1e6
print(top5_states[['state', 'total_emissions_mt']].to_string(index=False))
print(f"\nTotal from top 5 states: {top5_states['total_reported_direct_emissions'].sum()/1e6:.2f} Million MT CO2e")
print(f"Percentage of US total: {top5_states['total_reported_direct_emissions'].sum() / df['total_reported_direct_emissions'].sum() * 100:.1f}%")

# Top 5 Sectors
print("\n--- Top 5 Sectors by Total Emissions (2010-2023) ---")
sector_totals = df.groupby('industry_type_sectors')['total_reported_direct_emissions'].sum().reset_index()
sector_totals = sector_totals.sort_values('total_reported_direct_emissions', ascending=False)
top5_sectors = sector_totals.head(5)
top5_sectors['total_emissions_mt'] = top5_sectors['total_reported_direct_emissions'] / 1e6
print(top5_sectors[['industry_type_sectors', 'total_emissions_mt']].to_string(index=False))
print(f"\nTotal from top 5 sectors: {top5_sectors['total_reported_direct_emissions'].sum()/1e6:.2f} Million MT CO2e")
print(f"Percentage of US total: {top5_sectors['total_reported_direct_emissions'].sum() / df['total_reported_direct_emissions'].sum() * 100:.1f}%")

# Outlier Detection
print("\n--- Outlier Detection ---")
emissions = df['total_reported_direct_emissions'].dropna()
z_scores = np.abs(stats.zscore(emissions))
threshold = 3
outliers_zscore = df[z_scores > threshold]

print(f"\nZ-Score Method (threshold = 3):")
print(f"  Total facilities: {len(df):,}")
print(f"  Outliers detected: {len(outliers_zscore):,} ({len(outliers_zscore)/len(df)*100:.2f}%)")
if len(outliers_zscore) > 0:
    print(f"  Min emissions: {outliers_zscore['total_reported_direct_emissions'].min()/1e6:.2f} Million MT CO2e")
    print(f"  Max emissions: {outliers_zscore['total_reported_direct_emissions'].max()/1e6:.2f} Million MT CO2e")
    print(f"  Mean emissions: {outliers_zscore['total_reported_direct_emissions'].mean()/1e6:.2f} Million MT CO2e")

# IQR Method
Q1 = emissions.quantile(0.25)
Q3 = emissions.quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
outliers_iqr = df[(df['total_reported_direct_emissions'] < lower_bound) | 
                  (df['total_reported_direct_emissions'] > upper_bound)]

print(f"\nIQR Method (1.5 * IQR):")
print(f"  Q1: {Q1/1e6:.2f} Million MT CO2e")
print(f"  Q3: {Q3/1e6:.2f} Million MT CO2e")
print(f"  IQR: {IQR/1e6:.2f} Million MT CO2e")
print(f"  Outliers detected: {len(outliers_iqr):,} ({len(outliers_iqr)/len(df)*100:.2f}%)")

# Top 10 Facilities
print("\n--- Top 10 Facilities by Emissions ---")
top_facilities = df.nlargest(10, 'total_reported_direct_emissions')[
    ['facility_name', 'state', 'industry_type_sectors', 'total_reported_direct_emissions']
].copy()
top_facilities['emissions_mt'] = top_facilities['total_reported_direct_emissions'] / 1e6
for idx, row in top_facilities.iterrows():
    print(f"\n{row['facility_name']}")
    print(f"  State: {row['state']}, Sector: {row['industry_type_sectors']}")
    print(f"  Emissions: {row['emissions_mt']:.2f} Million MT CO2e")

# PART 3: Visualizations
print("\n" + "=" * 60)
print("PART 3: VISUALIZATIONS")
print("=" * 60)

# Bar chart: Top 5 States
print("\nGenerating visualizations...")
fig, ax = plt.subplots(figsize=(12, 7))
colors = plt.cm.viridis(np.linspace(0, 1, 5))
bars = ax.barh(top5_states['state'], top5_states['total_emissions_mt'], color=colors)
ax.set_xlabel('Total Emissions (Million Metric Tons CO2e)', fontsize=12)
ax.set_title('Top 5 States by Total Emissions (2010-2023)', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3, axis='x')
ax.invert_yaxis()
for i, (state, val) in enumerate(zip(top5_states['state'], top5_states['total_emissions_mt'])):
    ax.text(val, i, f' {val:.1f}', va='center', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig('data_processed/top5_states.png', dpi=150, bbox_inches='tight')
print("✓ Saved: data_processed/top5_states.png")
plt.close()

# Bar chart: Top 5 Sectors
fig, ax = plt.subplots(figsize=(12, 7))
colors = plt.cm.plasma(np.linspace(0, 1, 5))
sector_names = [name[:40] + '...' if len(name) > 40 else name for name in top5_sectors['industry_type_sectors']]
bars = ax.barh(sector_names, top5_sectors['total_emissions_mt'], color=colors)
ax.set_xlabel('Total Emissions (Million Metric Tons CO2e)', fontsize=12)
ax.set_title('Top 5 Sectors by Total Emissions (2010-2023)', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3, axis='x')
ax.invert_yaxis()
for i, val in enumerate(top5_sectors['total_emissions_mt']):
    ax.text(val, i, f' {val:.1f}', va='center', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig('data_processed/top5_sectors.png', dpi=150, bbox_inches='tight')
print("✓ Saved: data_processed/top5_sectors.png")
plt.close()

# Histogram
emissions_data = df[df['total_reported_direct_emissions'] > 0]['total_reported_direct_emissions'] / 1e6
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
ax1.hist(emissions_data, bins=50, color='#2E86AB', alpha=0.7, edgecolor='black')
ax1.set_xlabel('Total Emissions (Million Metric Tons CO2e)', fontsize=12)
ax1.set_ylabel('Frequency', fontsize=12)
ax1.set_title('Distribution of Facility Emissions (Linear Scale)', fontsize=13, fontweight='bold')
ax1.grid(True, alpha=0.3, axis='y')
ax2.hist(emissions_data, bins=50, color='#A23B72', alpha=0.7, edgecolor='black')
ax2.set_xlabel('Total Emissions (Million Metric Tons CO2e)', fontsize=12)
ax2.set_ylabel('Frequency', fontsize=12)
ax2.set_title('Distribution of Facility Emissions (Log Scale)', fontsize=13, fontweight='bold')
ax2.set_xscale('log')
ax2.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.savefig('data_processed/emissions_distribution.png', dpi=150, bbox_inches='tight')
print("✓ Saved: data_processed/emissions_distribution.png")
plt.close()

# Scatter plot: CO2 vs CH4
plot_data = df[(df['co2_emissions_non_biogenic'] > 0) & (df['ch4_emissions'] > 0)].copy()
plot_data['co2_mt'] = plot_data['co2_emissions_non_biogenic'] / 1e6
plot_data['ch4_mt'] = plot_data['ch4_emissions'] / 1e6
fig, ax = plt.subplots(figsize=(10, 8))
ax.scatter(plot_data['co2_mt'], plot_data['ch4_mt'], alpha=0.5, s=20, color='#2E86AB')
ax.set_xlabel('CO2 Emissions (Million Metric Tons CO2e)', fontsize=12)
ax.set_ylabel('CH4 Emissions (Million Metric Tons CO2e)', fontsize=12)
ax.set_title('Relationship: CO2 vs CH4 Emissions', fontsize=14, fontweight='bold')
ax.set_xscale('log')
ax.set_yscale('log')
ax.grid(True, alpha=0.3)
correlation = np.corrcoef(plot_data['co2_mt'], plot_data['ch4_mt'])[0, 1]
ax.text(0.05, 0.95, f'Correlation: {correlation:.3f}', 
        transform=ax.transAxes, fontsize=12, verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
plt.tight_layout()
plt.savefig('data_processed/co2_vs_ch4.png', dpi=150, bbox_inches='tight')
print("✓ Saved: data_processed/co2_vs_ch4.png")
plt.close()

# Pie chart: Emissions by sector
sector_emissions = df.groupby('industry_type_sectors')['total_reported_direct_emissions'].sum().reset_index()
sector_emissions = sector_emissions.sort_values('total_reported_direct_emissions', ascending=False)
top_n = 8
top_sectors_pie = sector_emissions.head(top_n).copy()
other_emissions = sector_emissions.iloc[top_n:]['total_reported_direct_emissions'].sum()
other_row = pd.DataFrame({
    'industry_type_sectors': ['Other'],
    'total_reported_direct_emissions': [other_emissions]
})
pie_data = pd.concat([top_sectors_pie, other_row], ignore_index=True)
fig, ax = plt.subplots(figsize=(12, 10))
colors = plt.cm.Set3(range(len(pie_data)))
wedges, texts, autotexts = ax.pie(
    pie_data['total_reported_direct_emissions'] / 1e6,
    labels=pie_data['industry_type_sectors'],
    autopct='%1.1f%%',
    startangle=90,
    colors=colors,
    textprops={'fontsize': 10}
)
for autotext in autotexts:
    autotext.set_color('black')
    autotext.set_fontweight('bold')
    autotext.set_fontsize(10)
ax.set_title('Emissions Distribution by Sector (Top 8 + Other)', fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('data_processed/emissions_by_sector_pie.png', dpi=150, bbox_inches='tight')
print("✓ Saved: data_processed/emissions_by_sector_pie.png")
plt.close()

print("\n" + "=" * 60)
print("ANALYSIS COMPLETE!")
print("=" * 60)
print("\nAll visualizations saved to data_processed/ directory")
print("\nSummary Statistics:")
print(f"  Total facilities: {len(df):,}")
print(f"  Years covered: {df['reporting_year'].min()} - {df['reporting_year'].max()}")
print(f"  Total emissions (2010-2023): {df['total_reported_direct_emissions'].sum()/1e6:.2f} Million MT CO2e")
print(f"  Unique states: {df['state'].nunique()}")
print(f"  Unique sectors: {df['industry_type_sectors'].nunique()}")



