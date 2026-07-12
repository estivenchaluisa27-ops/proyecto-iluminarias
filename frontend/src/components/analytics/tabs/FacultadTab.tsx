import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import AltairChart from '../AltairChart';
import ChartCard from '../ChartCard';

export default function FacultadTab() {
  const [rankingFig, setRankingFig] = useState<any>(null);
  const [stackedImg, setStackedImg] = useState<string | null>(null);
  const [radarFig, setRadarFig] = useState<any>(null);
  const [treemapFig, setTreemapFig] = useState<any>(null);
  const [ledFig, setLedFig] = useState<any>(null);
  const [linkedSpec, setLinkedSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [facultadRadar, setFacultadRadar] = useState('');

  useEffect(() => {
    Promise.all([
      analyticsService.getPlotlyFigure('/facultad/ranking-luxes'),
      analyticsService.getImage('/facultad/stacked-estado'),
      analyticsService.getPlotlyFigure('/facultad/treemap'),
      analyticsService.getPlotlyFigure('/facultad/led-adopcion'),
      analyticsService.getAltairSpec('/tipo-estado/heatmap-altair'),
    ]).then(([r, s, t, l, h]) => {
      setRankingFig(r); setStackedImg(s); setTreemapFig(t);
      setLedFig(l); setLinkedSpec(h);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    analyticsService.getRadar(facultadRadar || undefined)
      .then(setRadarFig).catch(console.error);
  }, [facultadRadar]);

  const facultades = [
    'Facultad de Ciencias Médicas', 'Facultad de Odontología', 'Facultad Jurisprudencia',
    'Facultad de Ciencias Psicológicas', 'Facultad de Ingenieria Química',
    'Facultad de Ingeniería en Geología, Minas, Petróleos y Ambiental',
    'Facultad de Filosofía y Letras', 'Facultad de Ingeniería y Ciencias Aplicadas',
    'Facultad de Ciencias Económicas', 'Facultad de Artes',
  ];

  return (
    <>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Ranking de Luxes Promedio por Facultad"
          description="Facultades ordenadas por luxes promedio. Las barras largas indican mayor iluminación; prioriza las más cortas."
        >
          <PlotlyChart figure={rankingFig} loading={loading} height={500} />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          full
          title="Estado de Luminarias por Facultad"
          description="Composición de estados por facultad. Verde = funcionando, rojo = no funcionando, ámbar = dañado."
        >
          <StaticChart src={stackedImg} loading={loading} alt="Stacked por facultad" />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          title="Treemap: Distribución por Facultad"
          description="Tamaño proporcional al total de luminarias por facultad. Color = % con medición de luxes (rojo = baja cobertura)."
        >
          <PlotlyChart figure={treemapFig} loading={loading} height={400} />
        </ChartCard>
        <ChartCard
          title="Radar por Facultad"
          description="Perfil multidimensional: total, %LED, %funciona, luxes y altura. Polígonos grandes = mejor equipamiento."
        >
          <select className="analytics-select" value={facultadRadar} onChange={e => setFacultadRadar(e.target.value)}>
            <option value="">Todas las facultades</option>
            {facultades.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <PlotlyChart figure={radarFig} loading={loading} height={400} />
        </ChartCard>
      </div>
      <div className="analytics-grid">
        <ChartCard
          title="Adopción de LED por Facultad"
          description="Porcentaje de luminarias LED por facultad. Identifica facultades rezagadas en eficiencia energética."
        >
          <PlotlyChart figure={ledFig} loading={loading} height={500} />
        </ChartCard>
        <ChartCard
          title="Heatmap: Tipo vs Estado"
          description="Frecuencia de cada combinación tipo-estado. Colores intensos = mayor cantidad en esa categoría."
        >
          <AltairChart spec={linkedSpec} loading={loading} />
        </ChartCard>
      </div>
    </>
  );
}
