import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';

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
        <div className="analytics-card">
          <div className="analytics-card-title">Matriz de Correlación (Pearson)</div>
          <StaticChart src={corrImg} loading={loading} alt="Matriz correlación" />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Scatter: Altura vs Luxes (estático)</div>
          <StaticChart src={scatterImg} loading={loading} alt="Scatter altura luxes" />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Scatter: Altura vs Luxes (interactivo)</div>
          <PlotlyChart figure={scatterPlotly} loading={loading} height={450} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Distribución de Estado por Grupo</div>
          <StaticChart src={sparklinesImg} loading={loading} alt="Sparklines grupos" />
        </div>
      </div>
    </>
  );
}
