import io, base64
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from loader import load_dataframe

def _fig_to_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

def missing_heatmap():
    df = load_dataframe()
    cols = ['luxes', 'altura_poste', 'altitude', 'precision', 'etiqueta', 'grupo', 'edificio']
    fig, ax = plt.subplots(figsize=(12, 5))
    missing = df[cols].isna()
    sns.heatmap(missing.T, cbar=False, cmap=['#059669', '#DC2626'],
                yticklabels=cols, ax=ax)
    ax.set_title('Mapa de Valores Faltantes por Campo', fontsize=13, fontweight='bold')
    ax.set_xlabel('Registro')
    ax.set_ylabel('Campo')
    plt.tight_layout()
    return _fig_to_png(fig)

def missing_por_facultad_plotly():
    df = load_dataframe()
    campos = ['luxes', 'altura_poste', 'etiqueta', 'grupo', 'edificio']
    agg = df.groupby('facultad')[campos].apply(lambda x: x.isna().mean() * 100).reset_index()
    agg_melted = agg.melt(id_vars='facultad', var_name='campo', value_name='pct_faltante')
    fig = px.density_heatmap(agg_melted, x='campo', y='facultad', z='pct_faltante',
                             text_auto='.0f', color_continuous_scale='RdYlGn_r',
                             title='% Datos Faltantes por Facultad y Campo',
                             labels={'pct_faltante': '% Faltante', 'campo': 'Campo'})
    fig.update_layout(template='plotly_white', height=600)
    return fig.to_json()

def cobertura_medicion():
    df = load_dataframe()
    agg = df.groupby('facultad').agg(
        total=('id', 'count'),
        con_medicion=('luxes', lambda x: x.notna().sum()),
    ).reset_index()
    agg['pct'] = (agg['con_medicion'] / agg['total'] * 100).round(1)
    agg = agg.sort_values('pct')
    fig = px.bar(agg, x='pct', y='facultad', orientation='h',
                 color='pct', color_continuous_scale='RdYlGn',
                 text=agg['pct'].apply(lambda x: f'{x}%'),
                 title='Cobertura de Medición de Luxes por Facultad')
    fig.update_traces(textposition='outside')
    fig.update_layout(template='plotly_white', xaxis_title='% con medición', yaxis_title='', height=600, margin=dict(l=200))
    return fig.to_json()
