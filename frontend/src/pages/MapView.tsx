import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  FeatureGroup,
} from 'react-leaflet';
import L from 'leaflet';
import { PanelRightClose, PanelRightOpen, Map } from 'lucide-react';
import { luminariasService } from '../services/luminarias.service';
import type { Luminaria } from '../types/luminaria';
import type { PredictionLuminaria } from '../types/luminaria';
import HeatmapLayer from '../components/mapa/HeatmapLayer';
import FullscreenControl from '../components/mapa/FullscreenControl';
import MiniMapControl from '../components/mapa/MiniMapControl';
import SearchControl from '../components/mapa/SearchControl';
import FacultyFilter from '../components/mapa/FacultyFilter';
import PredictionToggle from '../components/mapa/PredictionToggle';
import PredictionStats from '../components/mapa/PredictionStats';
import { usePrediction } from '../hooks/usePrediction';
import { FACULTADES } from '../types/luminaria';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const ESTADO_CONFIG: Record<
  string,
  { color: string; label: string }
> = {
  enciende: { color: '#22c55e', label: 'Funciona correctamente' },
  'no enciende': { color: '#ef4444', label: 'No enciende' },
  'dañado/parpadea': { color: '#f97316', label: 'Dañado o parpadea' },
};

const TIPOS_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  led: { icon: 'fa-bolt', label: 'LED', color: '#eab308' },
  sodio: { icon: 'fa-lightbulb', label: 'Sodio', color: '#f97316' },
};

function safeStr(val: unknown, fallback = 'No especificado'): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
}

function obtenerConfigEstado(estado: string) {
  const key = safeStr(estado, 'desconocido').toLowerCase();
  return ESTADO_CONFIG[key] ?? { color: '#6b7280', label: 'Estado desconocido' };
}

function obtenerConfigTipo(tipo: string) {
  const key = safeStr(tipo, 'desconocido').toLowerCase();
  return (
    TIPOS_CONFIG[key] ?? {
      icon: 'fa-question-circle',
      label: key.toUpperCase(),
      color: '#6b7280',
    }
  );
}

function createIcon(color: string, faClass: string, iconColor: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <i class="fa ${faClass}" style="color:${iconColor};font-size:13px;"></i>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function generarPopupHTML(
  id: string,
  sector: string,
  tipo: string,
  altura: string,
  luxes: string,
  estadoFoco: string,
  colorEstado: string,
  lat: number,
  lon: number,
  alt: number | null,
  urlFoto: string
) {
  const altDisplay = alt !== null && alt !== undefined ? `${alt.toFixed(1)} msnm` : 'N/A';

  return `
    <style>
      .leaflet-popup-content-wrapper {
        background: rgba(15, 23, 42, 0.85) !important;
        backdrop-filter: blur(4px) !important;
        color: #f8fafc !important;
        border-radius: 6px !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
      }
      .leaflet-popup-tip {
        background: rgba(15, 23, 42, 0.85) !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
      }
    </style>
    <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:280px;font-size:15px;padding:16px;color:#cbd5e1;">
      <h4 style="margin:0 0 12px 0;font-size:17px;color:#ffffff;font-weight:600;border-bottom:1px solid #334155;padding-bottom:8px;">
        Luminaria #${id}
        <div style="font-size:13px;font-weight:400;color:#94a3b8;margin-top:4px;">
          ${safeStr(sector).charAt(0).toUpperCase() + safeStr(sector).slice(1)}
        </div>
      </h4>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td style="color:#94a3b8;padding:6px 0;width:45%;">Tipo:</td>
          <td style="font-weight:500;color:#ffffff;padding:6px 0;">${safeStr(tipo).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;padding:6px 0;">Altura Poste:</td>
          <td style="font-weight:500;color:#ffffff;padding:6px 0;">${safeStr(altura)} m</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;padding:6px 0;">Medición Luxes:</td>
          <td style="font-weight:500;color:#ffffff;padding:6px 0;">${luxes}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;padding:6px 0;">Estado:</td>
          <td style="font-weight:500;color:#ffffff;padding:6px 0;">
            <span style="background-color:${colorEstado};color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;text-transform:uppercase;">
              ${safeStr(estadoFoco).toUpperCase()}
            </span>
          </td>
        </tr>
      </table>
      <div style="font-size:15px;color:#64748b;border-top:1px solid #334155;padding-top:15px;margin-bottom:16px;line-height:1.6;">
        Lat: ${lat.toFixed(6)}<br>
        Lon: ${lon.toFixed(6)}<br>
        Alt: ${altDisplay}
      </div>
      <a href="${safeStr(urlFoto, '#')}" target="_blank"
         style="display:block;text-align:center;border:1px solid #475569;background:rgba(255,255,255,0.05);
                color:#ffffff;text-decoration:none;padding:8px;border-radius:4px;
                font-weight:500;font-size:14px;">
        Ver Foto
      </a>
    </div>
  `;
}

export default function MapView() {
  const [luminarias, setLuminarias] = useState<Luminaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLuminaria, setSelectedLuminaria] = useState<Luminaria | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedFacultad, setSelectedFacultad] = useState(FACULTADES[0]);
  const [predictionMode, setPredictionMode] = useState<'actual' | 'prediccion'>('actual');

  const filteredLuminarias = selectedFacultad === FACULTADES[0]
    ? luminarias
    : luminarias.filter((l) => l.facultad?.trim() === selectedFacultad);

  const { predicted, stats: predictionStats } = usePrediction(filteredLuminarias);

  const displayLuminarias = predictionMode === 'prediccion'
    ? (predicted as unknown as Luminaria[])
    : filteredLuminarias;

  const retry = () => {
    setError('');
    setLoading(true);
    luminariasService
      .getAll()
      .then(setLuminarias)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    luminariasService
      .getAll()
      .then(setLuminarias)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="map-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
        Cargando mapa...
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--danger)' }}>
        <p>Error al cargar el mapa: {error}</p>
        <button onClick={retry} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  if (luminarias.length === 0) return null;

  const center: [number, number] = [
    luminarias[0].latitude,
    luminarias[0].longitude,
  ];

  const fgLed = {
    markers: displayLuminarias.filter(
      (l) => l.tipo?.toLowerCase() === 'led'
    ),
    show: true,
  };
  const fgSodio = {
    markers: displayLuminarias.filter(
      (l) => l.tipo?.toLowerCase() === 'sodio'
    ),
    show: true,
  };
  const fgOtros = {
    markers: displayLuminarias.filter(
      (l) =>
        l.tipo?.toLowerCase() !== 'led' &&
        l.tipo?.toLowerCase() !== 'sodio'
    ),
    show: true,
  };

  const heatmapData: Array<[number, number, number]> = displayLuminarias
    .filter((l) => l.luxes !== null && l.luxes > 0)
    .map((l) => [l.latitude, l.longitude, l.luxes! * 0.5]);

  const handleMarkerClick = (l: Luminaria) => {
    setSelectedLuminaria(l);
    setPanelOpen(true);
  };

  const renderMarker = (l: Luminaria) => {
    const configEstado = obtenerConfigEstado(l.estado);
    const color = configEstado.color;
    const configTipo = obtenerConfigTipo(l.tipo);
    const luxDisplay =
      l.luxes !== null && l.luxes !== undefined
        ? `${l.luxes} lx`
        : 'Sin medición';
    const altura = l.altura_poste
      ? String(l.altura_poste)
      : 'N/A';

    const popupHTML = generarPopupHTML(
      String(l.id),
      l.facultad,
      l.tipo,
      altura,
      luxDisplay,
      l.estado,
      color,
      l.latitude,
      l.longitude,
      l.altitude,
      l.foto_url
    );

    const tooltipText = `${configTipo.label} | ${safeStr(l.estado).charAt(0).toUpperCase() + safeStr(l.estado).slice(1)} | ${l.facultad}`;

    return (
      <Marker
        key={l.id}
        position={[l.latitude, l.longitude]}
        icon={createIcon(color, configTipo.icon, '#ffffff')}
        eventHandlers={{
          click: () => handleMarkerClick(l),
        }}
      >
        <Tooltip sticky>{tooltipText}</Tooltip>
        <Popup>
          <div dangerouslySetInnerHTML={{ __html: popupHTML }} />
        </Popup>
      </Marker>
    );
  };

  const PREDICTION_ICON = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #22c55e; border: 3px solid #86efac;
      box-shadow: 0 2px 6px rgba(34,197,94,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <i class="fa fa-bolt" style="color:#ffffff;font-size:13px;"></i>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const renderPredictionMarker = (l: PredictionLuminaria) => {
    const luxDisplay = l.luxes !== null ? `${l.luxes} lx` : 'Sin medición';
    const origTipo = l.tipoOriginal?.toUpperCase() || 'N/A';
    const origEstado = l.estadoOriginal || 'N/A';
    const origLux = l.luxesOriginal !== null ? `${l.luxesOriginal} lx` : 'N/A';

    const popupHTML = `
      <style>
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.85) !important;
          backdrop-filter: blur(4px) !important;
          color: #f8fafc !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.85) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      </style>
      <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:280px;font-size:15px;padding:16px;color:#cbd5e1;">
        <h4 style="margin:0 0 12px 0;font-size:17px;color:#ffffff;font-weight:600;border-bottom:1px solid #334155;padding-bottom:8px;">
          Luminaria #${l.id}
          <div style="font-size:13px;font-weight:400;color:#4ade80;margin-top:4px;">
            Predicción LED
          </div>
        </h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
          <tr>
            <td style="color:#94a3b8;padding:6px 0;width:45%;">Tipo Pred.:</td>
            <td style="font-weight:500;color:#ffffff;padding:6px 0;">LED</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Tipo Original:</td>
            <td style="font-weight:500;color:#f97316;padding:6px 0;">${origTipo}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Luxes Pred.:</td>
            <td style="font-weight:500;color:#4ade80;padding:6px 0;">${luxDisplay}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Luxes Original:</td>
            <td style="font-weight:500;color:#94a3b8;padding:6px 0;">${origLux}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Estado Pred.:</td>
            <td style="font-weight:500;color:#ffffff;padding:6px 0;">
              <span style="background-color:#22c55e;color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;text-transform:uppercase;">
                ENCIENDE
              </span>
            </td>
          </tr>
          <tr>
            <td style="color:#94a3b8;padding:6px 0;">Estado Original:</td>
            <td style="font-weight:500;color:#f87171;padding:6px 0;">${origEstado.toUpperCase()}</td>
          </tr>
        </table>
        <div style="font-size:15px;color:#64748b;border-top:1px solid #334155;padding-top:15px;margin-bottom:16px;line-height:1.6;">
          Lat: ${l.latitude.toFixed(6)}<br>
          Lon: ${l.longitude.toFixed(6)}
        </div>
      </div>
    `;

    return (
      <Marker
        key={`pred-${l.id}`}
        position={[l.latitude, l.longitude]}
        icon={PREDICTION_ICON}
        eventHandlers={{
          click: () => handleMarkerClick(l as unknown as Luminaria),
        }}
      >
        <Tooltip sticky>LED Pred. | {luxDisplay} | {l.facultad}</Tooltip>
        <Popup>
          <div dangerouslySetInnerHTML={{ __html: popupHTML }} />
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="map-wrapper">
      <div className="map-container-full">
        <MapContainer
          center={center}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <LayersControl position="topright" collapsed={false}>
            <BaseLayer checked name=" Calles">
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name=" Claro">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </BaseLayer>
            <BaseLayer name=" Oscuro">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </BaseLayer>
            <BaseLayer name=" Satelital">
              <TileLayer
                attribution="Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={20}
                maxNativeZoom={17}
              />
            </BaseLayer>

            {predictionMode === 'actual' ? (
              <>
                <Overlay checked name=" Luminarias LED">
                  <FeatureGroup>
                    {fgLed.markers.map(renderMarker)}
                  </FeatureGroup>
                </Overlay>
                <Overlay checked name=" Luminarias Sodio">
                  <FeatureGroup>
                    {fgSodio.markers.map(renderMarker)}
                  </FeatureGroup>
                </Overlay>
                <Overlay checked name=" Otros tipos">
                  <FeatureGroup>
                    {fgOtros.markers.map(renderMarker)}
                  </FeatureGroup>
                </Overlay>
              </>
            ) : (
              <Overlay checked name=" Predicción LED (todas)">
                <FeatureGroup>
                  {predicted.map(renderPredictionMarker)}
                </FeatureGroup>
              </Overlay>
            )}
            <Overlay name=" Mapa de Calor">
              {heatmapData.length > 0 && (
                <HeatmapLayer latlngs={heatmapData} />
              )}
            </Overlay>
          </LayersControl>

          <FullscreenControl />
          <MiniMapControl />
          <SearchControl luminarias={displayLuminarias} />
        </MapContainer>

        <FacultyFilter
          selected={selectedFacultad}
          onChange={setSelectedFacultad}
          filteredCount={luminarias.length > 0 ? filteredLuminarias.length : 0}
          totalCount={luminarias.length}
        />

        <PredictionToggle mode={predictionMode} onChange={setPredictionMode} />

        <PredictionStats stats={predictionStats} visible={predictionMode === 'prediccion' && !panelOpen} />

        {predictionMode === 'prediccion' && (
          <div className="prediction-badge">SIMULACIÓN LED</div>
        )}
      </div>

      <button
        className={`btn-icon map-panel-toggle ${panelOpen ? 'panel-open' : ''}`}
        onClick={() => setPanelOpen(!panelOpen)}
        title={panelOpen ? 'Cerrar panel' : 'Abrir panel'}
      >
        {panelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
      </button>

      <div className={`detail-panel-overlay ${panelOpen ? '' : 'closed'}`}>
        <div className="detail-panel-header">
          <div className="detail-panel-title">
            {selectedLuminaria ? `Luminaria #${selectedLuminaria.id}` : 'Detalles'}
          </div>
          <button className="btn-icon" onClick={() => setPanelOpen(false)}>
            <PanelRightClose size={16} />
          </button>
        </div>
        <div className="detail-panel-body">
          {selectedLuminaria ? (
            <>
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>ID</th>
                    <td>{selectedLuminaria.id}</td>
                  </tr>
                  <tr>
                    <th>Sector</th>
                    <td>{safeStr(selectedLuminaria.facultad)}</td>
                  </tr>
                  <tr>
                    <th>Tipo</th>
                    <td>{safeStr(selectedLuminaria.tipo).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <th>Altura Poste</th>
                    <td>{selectedLuminaria.altura_poste ?? 'N/A'} m</td>
                  </tr>
                  <tr>
                    <th>Estado</th>
                    <td>
                      <span className={`badge ${selectedLuminaria.estado?.toLowerCase() === 'enciende' ? 'badge-success' : selectedLuminaria.estado?.toLowerCase() === 'no enciende' ? 'badge-danger' : 'badge-warning'}`}>
                        {selectedLuminaria.estado}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Luxes</th>
                    <td>{selectedLuminaria.luxes !== null ? `${selectedLuminaria.luxes} lx` : 'Sin medición'}</td>
                  </tr>
                  <tr>
                    <th>Edificio</th>
                    <td>{safeStr(selectedLuminaria.edificio)}</td>
                  </tr>
                  <tr>
                    <th>Latitud</th>
                    <td>{selectedLuminaria.latitude.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <th>Longitud</th>
                    <td>{selectedLuminaria.longitude.toFixed(6)}</td>
                  </tr>
                  <tr>
                    <th>Altitud</th>
                    <td>{selectedLuminaria.altitude !== null ? `${selectedLuminaria.altitude.toFixed(1)} msnm` : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>

              <hr className="section-divider" />

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Fotografía
              </div>
              {selectedLuminaria.foto_url ? (
                <img
                  src={selectedLuminaria.foto_url}
                  alt={`Luminaria #${selectedLuminaria.id}`}
                  className="detail-photo"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                  Sin fotografía disponible
                </div>
              )}
            </>
          ) : (
            <div className="detail-empty">
              <div className="detail-empty-icon">
                <Map size={20} />
              </div>
              <div>Selecciona una luminaria en el mapa para ver sus detalles.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
