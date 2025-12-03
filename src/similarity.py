"""
Cosine similarity module for comparing states and sectors by emissions profile.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple


def compute_cosine_similarity_matrix(feature_matrix: pd.DataFrame, 
                                     entity_col: str = 'state') -> pd.DataFrame:
    """
    Compute cosine similarity matrix for entities (states or sectors).
    
    Args:
        feature_matrix: DataFrame with entity features
        entity_col: Name of column containing entity identifiers
        
    Returns:
        DataFrame with cosine similarity matrix (entities x entities)
    """
    # Extract entity names
    entities = feature_matrix[entity_col].values
    
    # Select feature columns (exclude entity column and non-numeric columns)
    feature_cols = [col for col in feature_matrix.columns 
                   if col != entity_col and pd.api.types.is_numeric_dtype(feature_matrix[col])]
    
    if not feature_cols:
        raise ValueError("No numeric feature columns found")
    
    # Extract features
    X = feature_matrix[feature_cols].values
    
    # Normalize features using StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Compute cosine similarity
    # Cosine similarity = dot product of normalized vectors
    # Normalize each row to unit length
    norms = np.linalg.norm(X_scaled, axis=1, keepdims=True)
    norms[norms == 0] = 1  # Avoid division by zero
    X_normalized = X_scaled / norms
    
    # Compute similarity matrix
    similarity_matrix = np.dot(X_normalized, X_normalized.T)
    
    # Create DataFrame
    similarity_df = pd.DataFrame(
        similarity_matrix,
        index=entities,
        columns=entities
    )
    
    return similarity_df


def compute_state_similarity(state_features: pd.DataFrame) -> pd.DataFrame:
    """
    Compute cosine similarity matrix for states.
    
    Args:
        state_features: DataFrame with state features (from transform.create_state_feature_matrix)
        
    Returns:
        DataFrame with state similarity matrix
    """
    return compute_cosine_similarity_matrix(state_features, entity_col='state')


def compute_sector_similarity(sector_features: pd.DataFrame) -> pd.DataFrame:
    """
    Compute cosine similarity matrix for sectors.
    
    Args:
        sector_features: DataFrame with sector features (from transform.create_sector_feature_matrix)
        
    Returns:
        DataFrame with sector similarity matrix
    """
    return compute_cosine_similarity_matrix(sector_features, entity_col='sector')


def save_similarity_matrix(similarity_df: pd.DataFrame, 
                           output_path: str,
                           entity_name: str = 'entity') -> None:
    """
    Save similarity matrix to CSV in a readable format.
    
    Args:
        similarity_df: Similarity matrix DataFrame
        output_path: Path to save CSV
        entity_name: Name of entity type (for column naming)
    """
    # Reset index to make entity a column
    similarity_df = similarity_df.reset_index()
    similarity_df = similarity_df.rename(columns={'index': entity_name})
    
    similarity_df.to_csv(output_path, index=False)
    print(f"✓ Saved similarity matrix to {output_path}")


if __name__ == "__main__":
    # Test similarity computation
    from .ingest import load_all_ghgp_files
    from .clean import clean_ghgp_data
    from .transform import create_state_feature_matrix, create_sector_feature_matrix
    
    dfs = load_all_ghgp_files()
    if dfs:
        df_clean = clean_ghgp_data(dfs)
        
        print("\n=== State Similarity ===")
        state_features = create_state_feature_matrix(df_clean)
        state_sim = compute_state_similarity(state_features)
        print(f"State similarity matrix shape: {state_sim.shape}")
        print(state_sim.head())
        
        print("\n=== Sector Similarity ===")
        sector_features = create_sector_feature_matrix(df_clean)
        sector_sim = compute_sector_similarity(sector_features)
        print(f"Sector similarity matrix shape: {sector_sim.shape}")
        print(sector_sim.head())



