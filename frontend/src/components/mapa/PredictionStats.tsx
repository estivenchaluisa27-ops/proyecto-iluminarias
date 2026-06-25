import type { PredictionStatsData } from '../../types/luminaria';
import { TrendingUp, Zap, Wrench, Sun, BarChart3 } from 'lucide-react';

interface Props {
  stats: PredictionStatsData;
  visible: boolean;
}

export default function PredictionStats({ stats, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="prediction-stats">
      <div className="prediction-stats-header">
        <TrendingUp size={14} />
        Predicción: Transición a LED
      </div>

      <div className="prediction-stats-kpis">
        <div className="prediction-kpi">
          <div className="prediction-kpi-label">
            <Sun size={12} />
            Luxes Promedio
          </div>
          <div className="prediction-kpi-row">
            <span className="prediction-kpi-old">{stats.luxesPromedioActual} lx</span>
            <span className="prediction-kpi-arrow">→</span>
            <span className="prediction-kpi-new">{stats.luxesPromedioPredicho} lx</span>
          </div>
        </div>

        <div className="prediction-kpi">
          <div className="prediction-kpi-label">
            <TrendingUp size={12} />
            Mejora Proyectada
          </div>
          <div className="prediction-kpi-value accent">+{stats.mejoraPorcentual}%</div>
        </div>

        <div className="prediction-kpi">
          <div className="prediction-kpi-label">
            <Zap size={12} />
            Sodio → LED
          </div>
          <div className="prediction-kpi-value">{stats.sodioToLed}</div>
        </div>

        <div className="prediction-kpi">
          <div className="prediction-kpi-label">
            <Wrench size={12} />
            Reparadas
          </div>
          <div className="prediction-kpi-value success">{stats.reparadas}</div>
        </div>
      </div>

      <div className="prediction-stats-section">
        <div className="prediction-stats-section-title">
          <BarChart3 size={12} />
          Comparativa por Facultad
        </div>
        <table className="data-table prediction-table">
          <thead>
            <tr>
              <th>Facultad</th>
              <th>Luxes Act.</th>
              <th>Luxes Pred.</th>
              <th>Mejora</th>
              <th>S→LED</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.porFacultad)
              .sort(([, a], [, b]) => b.mejora - a.mejora)
              .map(([f, d]) => (
                <tr key={f}>
                  <td className="prediction-facultad-cell" title={f}>
                    {f.length > 28 ? f.slice(0, 26) + '…' : f}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.luxesActual} lx</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.luxesPredicho} lx</td>
                  <td>
                    <span className={`badge ${d.mejora > 0 ? 'badge-success' : 'badge-info'}`}>
                      +{d.mejora}%
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.sodioToLed}/{d.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="prediction-disclaimer">
        Simulación basada en datos reales del campus. Factor de conversión: 1.08 (ratio LED/Sodio observado).
      </div>
    </div>
  );
}
