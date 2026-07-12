import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import ChartCard from '../ChartCard';

export default function ComparativasTab() {
  const [corrImg, setCorrImg] = useState<string | null>(null);
  const [scatterImg, setScatterImg] = useState<string | null>(null);
  const [scatterPlotly, setScatterPlotly] = useState<any>(null);
  const [sparklinesImg, setSparklinesImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getImage('/correlacion/matriz'),
      analyticsService.getImage('/scatter/altura-luxes'),
      analyticsService.getPlotlyFigure('/scatter/altura-luxes-plotly'),
      analyticsService.getImage('/sparklines/grupos'),
    ]).then(([c, s, sp, spk]) => {
      setCorrImg(c); setScatterImg(s); setScatterPlotly(sp); setSparklinesImg(spk);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="analytics-grid">
        <ChartCard
          title="Matriz de Correlación (Pearson)"
          description="Correlaciones lineales entre variables numéricas. Valores cercanos a ±1 indican relación fuerte."
        >
          <StaticChart src={corrImg} loading={loading} alt="Matriz correlación" />
        </ChartCard>
        <ChartCard
          title="Scatter: Altura vs Luxes (estático)"
          description="Relación entre altura del poste y luxes. La línea roja muestra la tendencia; colores distinguen LED vs Sodio."
        >
          <StaticChart src={scatterImg} loading={loading} alt="Scatter altura luxes" />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Scatter: Altura vs Luxes (interactivo)"
          description="Misma relación altura-luxes con exploración. Pasa el cursor para ver facultad y estado de cada punto."
        >
          <PlotlyChart figure={scatterPlotly} loading={loading} height={450} />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Distribución de Estado por Grupo"
          description="Mini gráficos por circuito eléctrico. Picos en 'no enciende' señalan fallas eléctricas localizadas."
        >
          <StaticChart src={sparklinesImg} loading={loading} alt="Sparklines grupos" />
        </ChartCard>
      </div>
    </>
  );
}
