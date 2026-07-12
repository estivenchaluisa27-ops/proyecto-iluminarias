import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import ChartCard from '../ChartCard';

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
        <ChartCard
          full
          title="Mapa de Valores Faltantes por Campo"
          description="Auditoría visual de datos. Verde = presente, rojo = faltante. Bandas rojas indican campos con baja cobertura."
        >
          <StaticChart src={heatmapImg} loading={loading} alt="Missing heatmap" />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="% Datos Faltantes por Facultad y Campo"
          description="Porcentaje de datos faltantes por campo y facultad. Colores rojos priorizan dónde enviar brigadas de medición."
        >
          <PlotlyChart figure={missingFig} loading={loading} height={500} />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Cobertura de Medición de Luxes por Facultad"
          description="Porcentaje de luminarias con medición de luxes por facultad. Rojo = sin mediciones; no se puede evaluar el rendimiento."
        >
          <PlotlyChart figure={coberturaFig} loading={loading} height={500} />
        </ChartCard>
      </div>
    </>
  );
}
