import type { Luminaria, PredictionLuminaria } from '../../types/luminaria';
import { ExternalLink } from 'lucide-react';

function safeStr(val: unknown, fallback = 'No especificado'): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
}

interface ActualPopupProps {
  l: Luminaria;
  colorEstado: string;
}

export function ActualPopup({ l, colorEstado }: ActualPopupProps) {
  const luxDisplay = l.luxes !== null && l.luxes !== undefined ? `${l.luxes} lx` : 'Sin medición';
  const altura = l.altura_poste ? String(l.altura_poste) : 'N/A';
  const altDisplay = l.altitude !== null && l.altitude !== undefined ? `${l.altitude.toFixed(1)} msnm` : 'N/A';

  return (
    <div className="popup-container">
      <h4 className="popup-title">
        Luminaria #{l.id}
        <div className="popup-subtitle">
          {safeStr(l.facultad).charAt(0).toUpperCase() + safeStr(l.facultad).slice(1)}
        </div>
      </h4>
      <table className="popup-table">
        <tbody>
          <tr>
            <td>Tipo:</td>
            <td>{safeStr(l.tipo).toUpperCase()}</td>
          </tr>
          <tr>
            <td>Altura Poste:</td>
            <td>{altura} m</td>
          </tr>
          <tr>
            <td>Medición Luxes:</td>
            <td>{luxDisplay}</td>
          </tr>
          <tr>
            <td>Estado:</td>
            <td>
              <span className="popup-badge" style={{ backgroundColor: colorEstado }}>
                {safeStr(l.estado).toUpperCase()}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="popup-coords">
        Lat: {l.latitude.toFixed(6)}<br />
        Lon: {l.longitude.toFixed(6)}<br />
        Alt: {altDisplay}
      </div>
      {l.foto_url ? (
        <a href={l.foto_url} target="_blank" rel="noopener noreferrer" className="popup-link">
          <ExternalLink size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Ver Foto
        </a>
      ) : null}
    </div>
  );
}

interface PredictionPopupProps {
  l: PredictionLuminaria;
}

export function PredictionPopup({ l }: PredictionPopupProps) {
  const luxDisplay = l.luxes !== null ? `${l.luxes} lx` : 'Sin medición';
  const origTipo = l.tipoOriginal?.toUpperCase() || 'N/A';
  const origEstado = l.estadoOriginal || 'N/A';
  const origLux = l.luxesOriginal !== null ? `${l.luxesOriginal} lx` : 'N/A';

  return (
    <div className="popup-container">
      <h4 className="popup-title">
        Luminaria #{l.id}
        <div className="popup-subtitle" style={{ color: 'var(--success)' }}>
          Predicción LED
        </div>
      </h4>
      <table className="popup-table">
        <tbody>
          <tr>
            <td>Tipo Pred.:</td>
            <td className="popup-pred-value">LED</td>
          </tr>
          <tr>
            <td>Tipo Original:</td>
            <td className="popup-orig-value">{origTipo}</td>
          </tr>
          <tr>
            <td>Luxes Pred.:</td>
            <td className="popup-pred-value">{luxDisplay}</td>
          </tr>
          <tr>
            <td>Luxes Original:</td>
            <td className="popup-orig-muted">{origLux}</td>
          </tr>
          <tr>
            <td>Estado Pred.:</td>
            <td>
              <span className="popup-badge" style={{ backgroundColor: '#22c55e' }}>
                ENCIENDE
              </span>
            </td>
          </tr>
          <tr>
            <td>Estado Original:</td>
            <td className="popup-orig-value">{origEstado.toUpperCase()}</td>
          </tr>
        </tbody>
      </table>
      <div className="popup-coords">
        Lat: {l.latitude.toFixed(6)}<br />
        Lon: {l.longitude.toFixed(6)}
      </div>
    </div>
  );
}
