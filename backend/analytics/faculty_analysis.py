import io, base64
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from loader import load_dataframe

def _fig_to_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

def ranking_luxes_plotly():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0)].copy()
    agg = con.groupby('facultad').agg(luxes_medio=('luxes', 'mean'), n=('luxes', 'count')).reset_index()
    agg = agg.sort_values('luxes_medio', ascending=True)
    fig = px.bar(agg, x='luxes_medio', y='facultad', orientation='h', text=agg['luxes_medio'].round(1),
                 color='luxes_medio', color_continuous_scale='Blues', title='Luxes Promedio por Facultad')
    fig.update_traces(texttemplate='%{text} lx', textposition='outside')
    fig.update_layout(template='plotly_white', xaxis_title='Luxes promedio (lx)', yaxis_title='',
                      height=600, margin=dict(l=200))
    return fig.to_json()

def stacked_estado_facultad():
    df = load_dataframe()
    ct = pd.crosstab(df['facultad'], df['estado'])
    ct = ct.sort_values('enciende', ascending=False)
    fig, ax = plt.subplots(figsize=(14, 7))
    colors = {'enciende': '#059669', 'no enciende': '#DC2626', 'dañado/parpadea': '#D97706'}
    ct.plot(kind='barh', stacked=True, color=[colors.get(c, '#94A3B8') for c in ct.columns], ax=ax)
    ax.set_title('Estado de Luminarias por Facultad', fontsize=13, fontweight='bold')
    ax.set_xlabel('Cantidad')
    ax.set_ylabel('')
    ax.legend(title='Estado')
    plt.tight_layout()
    return _fig_to_png(fig)

def radar_facultad(facultad=None):
    df = load_dataframe()
    if facultad:
        df = df[df['facultad'] == facultad]
    agg = df.groupby('facultad').agg(
        total=('id', 'count'),
        pct_led=('tipo', lambda x: (x == 'led').mean() * 100),
        pct_enciende=('estado', lambda x: (x == 'enciende').mean() * 100),
        luxes_avg=('luxes', lambda x: x[x.notna() & (x > 0)].mean()),
        altura_avg=('altura_poste', 'mean'),
    ).reset_index()
    agg['luxes_norm'] = agg['luxes_avg'] / agg['luxes_avg'].max() * 100
    agg['altura_norm'] = agg['altura_avg'] / agg['altura_avg'].max() * 100

    facets = agg['facultad'].tolist()
    fig = go.Figure()
    for i, row in agg.iterrows():
        fig.add_trace(go.Scatterpolar(
            r=[row['total'], row['pct_led'], row['pct_enciende'], row['luxes_norm'], row['altura_norm']],
            theta=['Total', '% LED', '% Enciende', 'Luxes (norm)', 'Altura (norm)'],
            fill='toself', name=row['facultad'], opacity=0.6,
        ))
    fig.update_layout(template='plotly_white', title='Perfil por Facultad', height=500, margin=dict(l=80, r=80, t=60, b=40))
    return fig.to_json()

def treemap_plotly():
    df = load_dataframe()
    agg = df.groupby('facultad').agg(total=('id', 'count'),
                                      con_med=('luxes', lambda x: x.notna().sum())).reset_index()
    agg['pct_medicion'] = (agg['con_med'] / agg['total'] * 100).round(1)
    fig = px.treemap(agg, path=['facultad'], values='total', color='pct_medicion',
                     color_continuous_scale='RdYlGn', title='Distribución por Facultad (% medición)')
    fig.update_traces(textinfo='label+value+percent root')
    fig.update_layout(template='plotly_white', height=500)
    return fig.to_json()

def led_adopcion_plotly():
    df = load_dataframe()
    agg = df.groupby('facultad').agg(total=('id', 'count'),
                                      led=('tipo', lambda x: (x == 'led').sum())).reset_index()
    agg['pct_led'] = (agg['led'] / agg['total'] * 100).round(1)
    agg = agg.sort_values('pct_led', ascending=True)
    fig = px.bar(agg, x='pct_led', y='facultad', orientation='h',
                 text=agg['pct_led'].apply(lambda x: f'{x}%'),
                 color='pct_led', color_continuous_scale='Greens', title='Adopción de LED por Facultad')
    fig.update_traces(textposition='outside')
    fig.update_layout(template='plotly_white', xaxis_title='% LED', yaxis_title='', height=600, margin=dict(l=200))
    return fig.to_json()

import pandas as pd
