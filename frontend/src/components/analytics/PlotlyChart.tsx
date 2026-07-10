import Plot from 'react-plotly.js';

interface Props {
  figure: Record<string, unknown> | null;
  loading?: boolean;
  height?: number;
}

export default function PlotlyChart({ figure, loading, height = 400 }: Props) {
  if (loading) {
    return <div className="chart-loading">Cargando gráfico...</div>;
  }
  if (!figure) {
    return <div className="chart-empty">Gráfico no disponible</div>;
  }
  const data = (figure as any).data || [];
  const layout = {
    ...((figure as any).layout || {}),
    height,
    autosize: true,
    margin: { l: 60, r: 30, t: 40, b: 60 },
  };
  return (
    <Plot
      data={data}
      layout={layout}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  );
}
