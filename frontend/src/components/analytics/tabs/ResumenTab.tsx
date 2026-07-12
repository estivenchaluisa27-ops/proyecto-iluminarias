import { useEffect, useState } from 'react';
import { Lightbulb, Zap, LightbulbOff, Thermometer, BarChart3, PieChart } from 'lucide-react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';
import ChartCard from '../ChartCard';
import type { KpiData } from '../AnalyticsDashboard';
import type { LuminariaStats } from '../../../types/luminaria';

interface Props {
  stats: LuminariaStats | null;
}

export default function ResumenTab({ stats }: Props) {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [donutFig, setDonutFig] = useState<any>(null);
  const [countplotImg, setCountplotImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getKpi(),
      analyticsService.getPlotlyFigure('/tipo/donut'),
      analyticsService.getImage('/countplot/tipo-estado'),
    ]).then(([k, d, c]) => {
      setKpi(k);
      setDonutFig(d);
      setCountplotImg(c);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header"><Lightbulb size={14} /> Total Luminarias</div>
          <div className="stat-card-value">{stats?.total ?? kpi?.total ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><Zap size={14} /> Funcionan</div>
          <div className="stat-card-value success">{stats?.porEstado?.enciende ?? kpi?.funcionan ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><LightbulbOff size={14} /> No funcionan</div>
          <div className="stat-card-value warning">{kpi?.no_funcionan ?? '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><Thermometer size={14} /> Luxes Promedio</div>
          <div className="stat-card-value accent">{kpi?.luxes_promedio ? `${kpi.luxes_promedio} lx` : '...'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><BarChart3 size={14} /> Con medición</div>
          <div className="stat-card-value accent">{kpi?.con_medicion ?? '...'} <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>/ {kpi?.total ?? '...'}</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><PieChart size={14} /> Altura poste prom.</div>
          <div className="stat-card-value">{kpi?.altura_promedio ? `${kpi.altura_promedio} m` : '...'}</div>
        </div>
      </div>

      <div className="analytics-grid">
        <ChartCard
          title="Proporción LED vs Sodio"
          description="Proporción de luminarias LED versus Sodio en el campus. Indica el grado de adopción de tecnología eficiente."
        >
          <PlotlyChart figure={donutFig} loading={loading} height={350} />
        </ChartCard>
        <ChartCard
          title="Estado por Tipo de Luminaria"
          description="Cantidad de luminarias LED y Sodio en cada estado operativo. Permite comparar la confiabilidad entre tecnologías."
        >
          <StaticChart src={countplotImg} loading={loading} alt="Countplot tipo x estado" />
        </ChartCard>
      </div>
    </>
  );
}
