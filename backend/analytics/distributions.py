import io, base64, os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from loader import load_dataframe

plt.rcParams['figure.dpi'] = 120
sns.set_style('whitegrid')
COLOR_LED = '#2563EB'
COLOR_SODIO = '#D97706'

PLOTS_DIR = os.path.join(os.path.dirname(__file__), 'plots')

def _fig_to_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

def _ensure_plots_dir():
    os.makedirs(PLOTS_DIR, exist_ok=True)

def histograma_kde():
    df = load_dataframe()
    vals = df['luxes'].dropna().values
    vals = vals[vals > 0]
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.histplot(vals, bins=15, kde=True, color='#2563EB', edgecolor='white', alpha=0.7, ax=ax)
    ax.set_title('Distribución de Luxes', fontsize=13, fontweight='bold')
    ax.set_xlabel('Luxes (lx)')
    ax.set_ylabel('Frecuencia')
    return _fig_to_png(fig)

def histograma_plotly():
    df = load_dataframe()
    vals = df['luxes'].dropna().values
    vals = vals[vals > 0]
    fig = go.Figure()
    fig.add_trace(go.Histogram(x=vals, nbinsx=20, name='Luxes', marker_color='#2563EB', opacity=0.75))
    fig.update_layout(title='Distribución de Luxes (interactivo)', xaxis_title='Luxes (lx)', yaxis_title='Frecuencia',
                      template='plotly_white', hovermode='x')
    return fig.to_json()

def boxplot_tipo():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0)].copy()
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(data=con, x='tipo', y='luxes', palette={'led': COLOR_LED, 'sodio': COLOR_SODIO}, ax=ax)
    ax.set_title('Distribución de Luxes por Tipo de Luminaria', fontsize=13, fontweight='bold')
    ax.set_xlabel('Tipo')
    ax.set_ylabel('Luxes (lx)')
    return _fig_to_png(fig)

def boxplot_facultad():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0)].copy()
    medias = con.groupby('facultad')['luxes'].mean().sort_values(ascending=False)
    con['facultad_ord'] = con['facultad'].map(lambda x: medias.index.tolist().index(x) if x in medias.index else -1)
    con = con.sort_values('facultad_ord')
    fig, ax = plt.subplots(figsize=(14, 6))
    order = medias.index.tolist()
    sns.boxplot(data=con, x='facultad', y='luxes', order=order, palette='Blues_r', ax=ax, width=0.6)
    ax.set_title('Distribución de Luxes por Facultad', fontsize=13, fontweight='bold')
    ax.set_xlabel('')
    ax.set_ylabel('Luxes (lx)')
    plt.xticks(rotation=45, ha='right', fontsize=8)
    plt.tight_layout()
    return _fig_to_png(fig)

def violin_tipo_estado():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0)].copy()
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.violinplot(data=con, x='tipo', y='luxes', hue='estado', split=True,
                   palette={'enciende': '#059669', 'no enciende': '#DC2626', 'dañado/parpadea': '#D97706'}, ax=ax)
    ax.set_title('Violin Plot: Luxes por Tipo y Estado', fontsize=13, fontweight='bold')
    ax.set_xlabel('Tipo')
    ax.set_ylabel('Luxes (lx)')
    return _fig_to_png(fig)

def ecdf_luxes():
    df = load_dataframe()
    vals = df['luxes'].dropna().values
    vals = vals[vals > 0]
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.ecdfplot(vals, color='#2563EB', linewidth=2, ax=ax)
    ax.set_title('Curva de Distribución Acumulada (ECDF) de Luxes', fontsize=13, fontweight='bold')
    ax.set_xlabel('Luxes (lx)')
    ax.set_ylabel('Proporción Acumulada')
    ax.axhline(0.25, ls='--', color='gray', alpha=0.5)
    ax.axhline(0.5, ls='--', color='gray', alpha=0.5)
    ax.axhline(0.75, ls='--', color='gray', alpha=0.5)
    return _fig_to_png(fig)

def countplot_tipo_estado():
    df = load_dataframe()
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.countplot(data=df, x='tipo', hue='estado', palette={'enciende': '#059669', 'no enciende': '#DC2626', 'dañado/parpadea': '#D97706'}, ax=ax)
    ax.set_title('Estado por Tipo de Luminaria', fontsize=13, fontweight='bold')
    ax.set_xlabel('Tipo')
    ax.set_ylabel('Cantidad')
    ax.legend(title='Estado')
    return _fig_to_png(fig)
