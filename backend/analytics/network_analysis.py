import io, base64, json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import networkx as nx
from loader import load_dataframe

PLOTS_DIR = 'backend/analytics/plots'

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1))*np.cos(np.radians(lat2))*np.sin(dlon/2)**2
    return 2 * R * np.arcsin(np.sqrt(a))

def build_proximity_graph(threshold=50):
    df = load_dataframe()
    G = nx.Graph()
    coords = df[['latitude', 'longitude', 'id', 'facultad', 'estado', 'tipo', 'grupo']].to_dict('records')
    for c in coords:
        g = c.get('grupo')
        grupo_val = int(g) if (g is not None and not (isinstance(g, float) and np.isnan(g))) else 0
        G.add_node(c['id'], facultad=c['facultad'], estado=c['estado'], tipo=c['tipo'],
                    grupo=grupo_val, lat=c['latitude'], lon=c['longitude'])
    for i in range(len(coords)):
        for j in range(i+1, len(coords)):
            d = _haversine(coords[i]['latitude'], coords[i]['longitude'],
                           coords[j]['latitude'], coords[j]['longitude'])
            if d < threshold:
                G.add_edge(coords[i]['id'], coords[j]['id'], distance=round(d, 1))
    return G, df

def grafo_proximidad_png(threshold=50):
    G, df = build_proximity_graph(threshold)
    fig, ax = plt.subplots(figsize=(16, 12))
    pos = {n: (G.nodes[n]['lon'], G.nodes[n]['lat']) for n in G.nodes()}
    colores = []
    color_map = {'enciende': '#059669', 'no enciende': '#DC2626', 'dañado/parpadea': '#D97706'}
    for n in G.nodes():
        colores.append(color_map.get(G.nodes[n]['estado'], '#94A3B8'))
    nx.draw_networkx_edges(G, pos, alpha=0.15, edge_color='#94A3B8', ax=ax, width=0.5)
    nx.draw_networkx_nodes(G, pos, node_size=20, node_color=colores, alpha=0.8, ax=ax)
    ax.set_title(f'Red de Proximidad entre Luminarias (<{threshold}m)', fontsize=14, fontweight='bold')
    ax.set_xlabel('Longitud')
    ax.set_ylabel('Latitud')
    ax.axis('off')
    plt.tight_layout()
    return _fig_to_png(fig)

def _fig_to_png(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    plt.close(fig)
    return base64.b64encode(buf.read()).decode('utf-8')

def grafo_proximidad_plotly(threshold=50):
    import plotly.graph_objects as go
    G, df = build_proximity_graph(threshold)
    edge_lons, edge_lats = [], []
    for u, v, d in G.edges(data=True):
        edge_lons.extend([G.nodes[u]['lon'], G.nodes[v]['lon'], None])
        edge_lats.extend([G.nodes[u]['lat'], G.nodes[v]['lat'], None])
    edge_trace = go.Scattergeo(
        lon=edge_lons, lat=edge_lats, mode='lines',
        line=dict(width=0.5, color='#94A3B8'), hoverinfo='none')
    color_map = {'enciende': '#059669', 'no enciende': '#DC2626', 'dañado/parpadea': '#D97706'}
    node_colors = [color_map.get(G.nodes[n]['estado'], '#94A3B8') for n in G.nodes()]
    node_trace = go.Scattergeo(
        lon=[G.nodes[n]['lon'] for n in G.nodes()],
        lat=[G.nodes[n]['lat'] for n in G.nodes()],
        mode='markers', marker=dict(size=5, color=node_colors, opacity=0.8),
        text=[f"ID: {n}<br>Facultad: {G.nodes[n]['facultad']}<br>Estado: {G.nodes[n]['estado']}" for n in G.nodes()],
        hoverinfo='text')
    fig = go.Figure(data=[edge_trace, node_trace])
    fig.update_layout(title=f'Red de Proximidad (<{threshold}m)', template='plotly_white', height=600,
                      geo=dict(projection_type='mercator', showland=True, showocean=False,
                               lataxis=dict(range=[-0.22, -0.19]), lonaxis=dict(range=[-78.52, -78.48])))
    return fig.to_json()

def comunidades_json(threshold=50):
    G, df = build_proximity_graph(threshold)
    comps = list(nx.connected_components(G))
    comunidades = []
    for i, comp in enumerate(comps):
        if len(comp) < 2:
            continue
        comunidades.append({
            'id': i + 1,
            'nodos': len(comp),
            'facultades': list(set(G.nodes[n]['facultad'] for n in comp)),
            'tasa_falla': round(sum(1 for n in comp if G.nodes[n]['estado'] != 'enciende') / len(comp) * 100, 1),
        })
    comunidades.sort(key=lambda x: x['nodos'], reverse=True)
    return {'total_comunidades': len(comunidades), 'comunidades': comunidades[:20],
            'total_pares_menor_50m': G.number_of_edges(),
            'total_nodos_en_red': G.number_of_nodes(),
            'cobertura_campus': round(G.number_of_nodes() / len(df) * 100, 1)}
