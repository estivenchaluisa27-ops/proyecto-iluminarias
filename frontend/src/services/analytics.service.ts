const API = '/analytics';

async function fetchJson(endpoint: string) {
  const res = await fetch(`${API}${endpoint}`);
  if (!res.ok) throw new Error(`Analytics error: ${res.statusText}`);
  return res.json();
}

export const analyticsService = {
  async getKpi() {
    return fetchJson('/kpi') as Promise<{
      total: number; funcionan: number; no_funcionan: number;
      led: number; sodio: number; con_medicion: number; sin_medicion: number;
      altura_promedio: number; luxes_promedio: number;
    }>;
  },
  async getDescribe() {
    return fetchJson('/describe') as Promise<Record<string, unknown>>;
  },

  async getImage(endpoint: string) {
    const data = await fetchJson(endpoint) as { image: string };
    return `data:image/png;base64,${data.image}`;
  },

  async getPlotlyFigure(endpoint: string) {
    const data = await fetchJson(endpoint) as { figure: string };
    return JSON.parse(data.figure);
  },

  async getAltairSpec(endpoint: string) {
    return fetchJson(endpoint);
  },

  async getComunidades(threshold = 50) {
    return fetchJson(`/red/comunidades?threshold=${threshold}`);
  },

  async getRadar(facultad?: string) {
    const q = facultad ? `?facultad=${encodeURIComponent(facultad)}` : '';
    const data = await fetchJson(`/facultad/radar${q}`) as { figure: string };
    return JSON.parse(data.figure);
  },

  async getGrafoPlotly(threshold = 50) {
    const data = await fetchJson(`/red/proximidad-plotly?threshold=${threshold}`) as { figure: string };
    return JSON.parse(data.figure);
  },
};
