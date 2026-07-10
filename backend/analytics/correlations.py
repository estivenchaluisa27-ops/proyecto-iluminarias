import io, base64
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from loader import load_dataframe

def _fig_to_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

def matriz_correlacion():
    df = load_dataframe()
    cols = ['luxes', 'altura_poste', 'altitude', 'precision', 'grupo', 'edificio_bin']
    corr = df[cols].corr(method='pearson')
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(corr, annot=True, fmt='.2f', cmap='RdBu_r', center=0, vmin=-1, vmax=1,
                square=True, linewidths=0.5, ax=ax, cbar_kws={'shrink': 0.8})
    ax.set_title('Matriz de Correlación (Pearson)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    return _fig_to_png(fig)

def scatter_matrix():
    df = load_dataframe()
    con = df[df['luxes'].notna() & (df['luxes'] > 0)].copy()
    cols = ['luxes', 'altura_poste', 'altitude', 'precision', 'grupo']
    fig = sns.pairplot(con[cols].dropna(), diag_kind='kde', plot_kws={'alpha': 0.4, 's': 15})
    fig.fig.suptitle('Matriz de Dispersión (Pairplot)', fontsize=13, fontweight='bold', y=1.02)
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    buf.seek(0)
    plt.close()
    return base64.b64encode(buf.read()).decode('utf-8')
