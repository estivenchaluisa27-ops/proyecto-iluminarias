import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import AltairChart from '../AltairChart';

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
        <div className="analytics-card full">
          <div className="analytics-card-title">Ranking de Luxes Promedio por Facultad</div>
          <PlotlyChart figure={rankingFig} loading={loading} height={500} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Estado de Luminarias por Facultad</div>
          <StaticChart src={stackedImg} loading={loading} alt="Stacked por facultad" />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-title">Treemap: Distribución por Facultad</div>
          <PlotlyChart figure={treemapFig} loading={loading} height={400} />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Radar por Facultad</div>
          <select className="analytics-select" value={facultadRadar} onChange={e => setFacultadRadar(e.target.value)}>
            <option value="">Todas las facultades</option>
            {facultades.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <PlotlyChart figure={radarFig} loading={loading} height={400} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-title">Adopción de LED por Facultad</div>
          <PlotlyChart figure={ledFig} loading={loading} height={500} />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Heatmap: Tipo vs Estado</div>
          <AltairChart spec={linkedSpec} loading={loading} />
        </div>
      </div>
    </>
  );
}
