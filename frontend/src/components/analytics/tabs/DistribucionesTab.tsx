import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import ChartCard from '../ChartCard';

export default function DistribucionesTab() {
  const [histImg, setHistImg] = useState<string | null>(null);
  const [histPlotly, setHistPlotly] = useState<any>(null);
  const [boxplotTipo, setBoxplotTipo] = useState<string | null>(null);
  const [violin, setViolin] = useState<string | null>(null);
  const [ecdf, setEcdf] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getImage('/distribucion/luxes'),
      analyticsService.getPlotlyFigure('/distribucion/luxes-plotly'),
      analyticsService.getImage('/boxplot/tipo'),
      analyticsService.getImage('/violin/tipo-estado'),
      analyticsService.getImage('/ecdf/luxes'),
    ]).then(([h, hp, b, v, e]) => {
      setHistImg(h); setHistPlotly(hp); setBoxplotTipo(b); setViolin(v); setEcdf(e);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Distribución de Luxes (estático + KDE)"
          description="Distribución de los niveles de iluminación (luxes). La curva azul estima la densidad de los datos."
        >
          <StaticChart src={histImg} loading={loading} alt="Histograma luxes" />
        </ChartCard>
        <ChartCard
          full
          title="Distribución de Luxes (interactivo)"
          description="Misma distribución de luxes con exploración interactiva. Pasa el cursor sobre las barras para ver conteos exactos."
        >
          <PlotlyChart figure={histPlotly} loading={loading} height={400} />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          title="Boxplot: Luxes por Tipo"
          description="Comparación de luxes entre LED y Sodio. La caja muestra mediana y rango intercuartílico; los puntos son valores atípicos."
        >
          <StaticChart src={boxplotTipo} loading={loading} alt="Boxplot por tipo" />
        </ChartCard>
        <ChartCard
          title="Violin Plot: Luxes por Tipo y Estado"
          description="Densidad de luxes por tipo y estado operativo. Revela si las luminarias dañadas tienen lecturas erráticas o bajas."
        >
          <StaticChart src={violin} loading={loading} alt="Violin plot" />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Curva de Distribución Acumulada (ECDF)"
          description="Distribución acumulada de luxes. Muestra qué porcentaje de luminarias está por debajo de cada nivel de iluminación."
        >
          <StaticChart src={ecdf} loading={loading} alt="ECDF" />
        </ChartCard>
      </div>
    </>
  );
}
