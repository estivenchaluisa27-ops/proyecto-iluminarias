import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';

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
        <div className="analytics-card full">
          <div className="analytics-card-title">Distribución de Luxes (estático + KDE)</div>
          <StaticChart src={histImg} loading={loading} alt="Histograma luxes" />
        </div>
        <div className="analytics-card full">
          <div className="analytics-card-title">Distribución de Luxes (interactivo)</div>
          <PlotlyChart figure={histPlotly} loading={loading} height={400} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-title">Boxplot: Luxes por Tipo</div>
          <StaticChart src={boxplotTipo} loading={loading} alt="Boxplot por tipo" />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Violin Plot: Luxes por Tipo y Estado</div>
          <StaticChart src={violin} loading={loading} alt="Violin plot" />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Curva de Distribución Acumulada (ECDF)</div>
          <StaticChart src={ecdf} loading={loading} alt="ECDF" />
        </div>
      </div>
    </>
  );
}
