import json, os
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'luminarias.json')

def load_dataframe():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        raw = json.load(f)
    df = pd.DataFrame(raw)
    df['luxes'] = pd.to_numeric(df['luxes'], errors='coerce')
    df['altura_poste'] = pd.to_numeric(df['altura_poste'], errors='coerce')
    df['altitude'] = pd.to_numeric(df['altitude'], errors='coerce')
    df['precision'] = pd.to_numeric(df['precision'], errors='coerce')
    df['grupo'] = pd.to_numeric(df['grupo'], errors='coerce')
    df['edificio_bin'] = df['edificio'].map({'Si': 1, 'No': 0})
    return df
