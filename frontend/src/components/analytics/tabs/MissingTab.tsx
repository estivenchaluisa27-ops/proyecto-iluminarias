import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';

export default function MissingTab() {
  const [heatmapImg, setHeatmapImg] = useState<string | null>(null);
  const [missingFig, setMissingFig] = useState<any>(null);
  const [coberturaFig, setCoberturaFig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getImage('/missing/heatmap'),
      analyticsService.getPlotlyFigure('/missing/por-facultad'),
      analyticsService.getPlotlyFigure('/missing/cobertura'),
    ]).then(([h, m, c]) => {
      setHeatmapImg(h); setMissingFig(m); setCoberturaFig(c);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Mapa de Valores Faltantes por Campo</div>
          <StaticChart src={heatmapImg} loading={loading} alt="Missing heatmap" />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">% Datos Faltantes por Facultad y Campo</div>
          <PlotlyChart figure={missingFig} loading={loading} height={500} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Cobertura de Medición de Luxes por Facultad</div>
          <PlotlyChart figure={coberturaFig} loading={loading} height={500} />
        </div>
      </div>
    </>
  );
}
