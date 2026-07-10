import numpy as np
from loader import load_dataframe

def describe():
    df = load_dataframe()
    numeric_cols = ['luxes', 'altura_poste', 'altitude', 'precision', 'grupo']
    result = {}
    for col in numeric_cols:
        vals = df[col].dropna().values
        if len(vals) == 0:
            continue
        q1, q2, q3 = np.percentile(vals, [25, 50, 75])
        result[col] = {
            'n': int(len(vals)),
            'nulos': int(df[col].isna().sum()),
            'media': round(float(np.mean(vals)), 2),
            'std': round(float(np.std(vals, ddof=1)), 2),
            'min': round(float(np.min(vals)), 2),
            'q1': round(float(q1), 2),
            'mediana': round(float(q2), 2),
            'q3': round(float(q3), 2),
            'max': round(float(np.max(vals)), 2),
        }
    result['tipos'] = df['tipo'].value_counts().to_dict()
    result['estados'] = df['estado'].value_counts().to_dict()
    result['edificios'] = df['edificio'].value_counts().to_dict()
    result['total'] = len(df)
    result['facultades'] = int(df['facultad'].nunique())
    result['con_medicion'] = int(df['luxes'].notna().sum())
    result['sin_medicion'] = int(df['luxes'].isna().sum())
    con = df[df['luxes'].notna() & (df['luxes'] > 0)]
    result['luxes_promedio'] = round(float(con['luxes'].mean()), 1) if len(con) > 0 else 0
    return result

def kpi_resumen():
    df = load_dataframe()
    total = len(df)
    funcionan = int((df['estado'] == 'enciende').sum())
    no_funcionan = int((df['estado'] != 'enciende').sum())
    led = int((df['tipo'] == 'led').sum())
    sodio = int((df['tipo'] == 'sodio').sum())
    con_med = int(df['luxes'].notna().sum())
    sin_med = int(df['luxes'].isna().sum())
    altura_avg = round(float(df['altura_poste'].mean()), 1)
    luxes_avg = round(float(df.loc[df['luxes'].notna() & (df['luxes'] > 0), 'luxes'].mean()), 1)
    return {
        'total': total, 'funcionan': funcionan, 'no_funcionan': no_funcionan,
        'led': led, 'sodio': sodio, 'con_medicion': con_med, 'sin_medicion': sin_med,
        'altura_promedio': altura_avg, 'luxes_promedio': luxes_avg,
    }
