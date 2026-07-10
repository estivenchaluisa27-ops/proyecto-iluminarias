interface Props {
  src: string | null;
  loading?: boolean;
  alt?: string;
}

export default function StaticChart({ src, loading, alt = 'Gráfico' }: Props) {
  if (loading) {
    return <div className="chart-loading">Cargando gráfico...</div>;
  }
  if (!src) {
    return <div className="chart-empty">Gráfico no disponible</div>;
  }
  return (
    <div className="static-chart-wrapper">
      <img src={src} alt={alt} className="static-chart-img" />
    </div>
  );
}
