import { useEffect, useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import PlotlyChart from '../PlotlyChart';
import StaticChart from '../StaticChart';

export default function RedesTab() {
  const [grafoPng, setGrafoPng] = useState<string | null>(null);
  const [grafoPlotly, setGrafoPlotly] = useState<any>(null);
  const [comunidades, setComunidades] = useState<any>(null);
  const [threshold, setThreshold] = useState(50);
  const [loading, setLoading] = useState(true);
  const [loadingCom, setLoadingCom] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsService.getImage(`/red/proximidad-png?threshold=${threshold}`),
      analyticsService.getGrafoPlotly(threshold),
    ]).then(([p, pl]) => {
      setGrafoPng(p); setGrafoPlotly(pl);
    }).catch(console.error).finally(() => setLoading(false));
  }, [threshold]);

  useEffect(() => {
    setLoadingCom(true);
    analyticsService.getComunidades(threshold)
      .then(setComunidades).catch(console.error)
      .finally(() => setLoadingCom(false));
  }, [threshold]);

  return (
    <>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-title">
            Red de Proximidad (estático)
            <select className="analytics-select-sm" value={threshold} onChange={e => setThreshold(Number(e.target.value))}>
              <option value={30}>30m</option>
              <option value={50}>50m</option>
              <option value={100}>100m</option>
            </select>
          </div>
          <StaticChart src={grafoPng} loading={loading} alt="Grafo proximidad" />
        </div>
        <div className="analytics-card">
          <div className="analytics-card-title">Red de Proximidad (interactivo)</div>
          <PlotlyChart figure={grafoPlotly} loading={loading} height={500} />
        </div>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card full">
          <div className="analytics-card-title">Comunidades Detectadas</div>
          {loadingCom ? (
            <div className="chart-loading">Analizando comunidades...</div>
          ) : comunidades ? (
            <div className="comunidades-grid">
              <div className="comunidad-stat">
                <span className="comunidad-label">Comunidades</span>
                <span className="comunidad-value">{comunidades.total_comunidades}</span>
              </div>
              <div className="comunidad-stat">
                <span className="comunidad-label">Pares &lt;{threshold}m</span>
                <span className="comunidad-value">{comunidades.total_pares_menor_50m}</span>
              </div>
              <div className="comunidad-stat">
                <span className="comunidad-label">Nodos en red</span>
                <span className="comunidad-value">{comunidades.total_nodos_en_red}</span>
              </div>
              <div className="comunidad-stat">
                <span className="comunidad-label">Cobertura campus</span>
                <span className="comunidad-value">{comunidades.cobertura_campus}%</span>
              </div>
            </div>
          ) : null}
          {comunidades?.comunidades && (
            <table className="data-table" style={{marginTop:'1rem'}}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nodos</th>
                  <th>Facultades</th>
                  <th>Tasa falla</th>
                </tr>
              </thead>
              <tbody>
                {comunidades.comunidades.slice(0, 10).map((c: any) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nodos}</td>
                    <td style={{maxWidth:'300px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {c.facultades.slice(0, 3).join(', ')}{c.facultades.length > 3 ? '...' : ''}
                    </td>
                    <td><span className={`badge ${c.tasa_falla > 50 ? 'badge-danger' : c.tasa_falla > 20 ? 'badge-warning' : 'badge-success'}`}>{c.tasa_falla}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
