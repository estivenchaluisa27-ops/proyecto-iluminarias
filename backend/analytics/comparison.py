import io, base64
import numpy as np
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

def scatter_altura_luxes():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0) & df['altura_poste'].notna()].copy()
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.scatterplot(data=con, x='altura_poste', y='luxes', hue='tipo',
                    palette={'led': '#2563EB', 'sodio': '#D97706'}, alpha=0.6, ax=ax)
    sns.regplot(data=con, x='altura_poste', y='luxes', scatter=False, color='#DC2626', ax=ax)
    ax.set_title('Relación Altura del Poste vs Luxes', fontsize=13, fontweight='bold')
    ax.set_xlabel('Altura del poste (m)')
    ax.set_ylabel('Luxes (lx)')
    return _fig_to_png(fig)

def scatter_altura_luxes_plotly():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0) & df['altura_poste'].notna()].copy()
    fig = px.scatter(con, x='altura_poste', y='luxes', color='tipo',
                     hover_data=['facultad', 'estado', 'luxes'],
                     color_discrete_map={'led': '#2563EB', 'sodio': '#D97706'},
                     title='Relación Altura vs Luxes (interactivo)',
                     labels={'altura_poste': 'Altura (m)', 'luxes': 'Luxes (lx)'})
    fig.update_layout(template='plotly_white')
    return fig.to_json()

def donut_tipo():
    df = load_dataframe()
    tipos = df['tipo'].value_counts()
    fig = go.Figure(data=[go.Pie(labels=tipos.index.tolist(), values=tipos.values.tolist(),
                                  hole=0.4, marker_colors=['#D97706', '#2563EB', '#94A3B8'])])
    fig.update_layout(title='Proporción LED vs Sodio', template='plotly_white', height=400)
    return fig.to_json()

def tipo_estado_heatmap_altair():
    df = load_dataframe()
    ct = df.groupby(['tipo', 'estado']).size().reset_index(name='count')
    spec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'data': {'values': ct.to_dict('records')},
        'mark': {'type': 'rect', 'tooltip': True},
        'encoding': {
            'x': {'field': 'estado', 'type': 'nominal', 'title': 'Estado'},
            'y': {'field': 'tipo', 'type': 'nominal', 'title': 'Tipo'},
            'color': {'field': 'count', 'type': 'quantitative', 'title': 'Cantidad'},
        },
        'width': 400, 'height': 200,
        'title': 'Tipo vs Estado',
    }
    return spec

def sparklines_grupos():
    df = load_dataframe()
    fig, axes = plt.subplots(3, 2, figsize=(12, 6))
    axes = axes.flatten()
    for i, g in enumerate(sorted(df['grupo'].dropna().unique())):
        sub = df[df['grupo'] == g]
        estados = sub['estado'].value_counts()
        cols = ['enciende', 'no enciende', 'dañado/parpadea']
        vals = [estados.get(c, 0) for c in cols]
        axes[i].plot(cols, vals, marker='o', color='#2563EB', linewidth=2)
        axes[i].fill_between(range(len(cols)), vals, alpha=0.1, color='#2563EB')
        axes[i].set_title(f'Grupo {int(g)} (n={len(sub)})', fontsize=10)
        axes[i].set_ylim(0, max(vals) + 10)
        axes[i].tick_params(labelsize=8)
    plt.suptitle('Distribución de Estado por Grupo', fontsize=13, fontweight='bold')
    plt.tight_layout()
    return _fig_to_png(fig)
