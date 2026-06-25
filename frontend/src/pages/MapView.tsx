import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  FeatureGroup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { luminariasService } from '../services/luminarias.service';
import type { Luminaria } from '../types/luminaria';
import type { PredictionLuminaria } from '../types/luminaria';
// import HeatmapLayer from '../components/mapa/HeatmapLayer';
import SearchControl from '../components/mapa/SearchControl';
import FacultyFilter from '../components/mapa/FacultyFilter';
import PredictionToggle from '../components/mapa/PredictionToggle';
import PredictionStats from '../components/mapa/PredictionStats';
import { ActualPopup, PredictionPopup } from '../components/mapa/LuminariaPopup';
import { usePrediction } from '../hooks/usePrediction';
import { FACULTADES } from '../types/luminaria';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const ESTADO_CONFIG: Record<
  string,
  { color: string; label: string }
> = {
  enciende: { color: '#059669', label: 'Funciona correctamente' },
  'no enciende': { color: '#DC2626', label: 'No enciende' },
  'dañado/parpadea': { color: '#D97706', label: 'Dañado o parpadea' },
};

const TIPOS_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  led: { icon: 'fa-bolt', label: 'LED', color: '#2563EB' },
  sodio: { icon: 'fa-lightbulb', label: 'Sodio', color: '#D97706' },
};

function safeStr(val: unknown, fallback = 'No especificado'): string {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s || fallback;
}

function obtenerConfigEstado(estado: string) {
  const key = safeStr(estado, 'desconocido').toLowerCase();
  return ESTADO_CONFIG[key] ?? { color: '#94A3B8', label: 'Estado desconocido' };
}

function obtenerConfigTipo(tipo: string) {
  const key = safeStr(tipo, 'desconocido').toLowerCase();
  return (
    TIPOS_CONFIG[key] ?? {
      icon: 'fa-question-circle',
      label: key.toUpperCase(),
      color: '#94A3B8',
    }
  );
}

function MapResizer() {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [map]);
  return null;
}

function createIcon(color: string, faClass: string, iconColor: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 2.5px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.18);
      display: flex; align-items: center; justify-content: center;
    ">
      <i class="fa ${faClass}" style="color:${iconColor};font-size:12px;"></i>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapView() {
  const [luminarias, setLuminarias] = useState<Luminaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // Si no hay luminarias, usar un centro por defecto (campus universitario)
  const center: [number, number] = luminarias.length > 0
    ? [luminarias[0].latitude, luminarias[0].longitude]
    : [4.6386, -74.0842]; // Coordenadas por defecto (Bogotá, campus universitario)
  
  // Mostrar mensaje si no hay luminarias, pero mantener el mapa
  const noData = luminarias.length === 0;

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

  // const heatmapData: Array<[number, number, number]> = displayLuminarias
  //   .filter((l) => l.luxes !== null && l.luxes > 0)
  //   .map((l) => [l.latitude, l.longitude, l.luxes! * 0.5]);

  const renderMarker = (l: Luminaria) => {
    const configEstado = obtenerConfigEstado(l.estado);
    const color = configEstado.color;
    const configTipo = obtenerConfigTipo(l.tipo);

    const tooltipText = `${configTipo.label} | ${safeStr(l.estado).charAt(0).toUpperCase() + safeStr(l.estado).slice(1)} | ${l.facultad}`;

    return (
      <Marker
        key={l.id}
        position={[l.latitude, l.longitude]}
        icon={createIcon(color, configTipo.icon, '#ffffff')}
      >
        <Tooltip sticky>{tooltipText}</Tooltip>
        <Popup>
          <ActualPopup l={l} colorEstado={color} />
        </Popup>
      </Marker>
    );
  };

  const PREDICTION_ICON = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: #059669; border: 2.5px solid #86efac;
      box-shadow: 0 1px 4px rgba(5,150,105,0.25);
      display: flex; align-items: center; justify-content: center;
    ">
      <i class="fa fa-bolt" style="color:#ffffff;font-size:12px;"></i>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const renderPredictionMarker = (l: PredictionLuminaria) => {
    const luxDisplay = l.luxes !== null ? `${l.luxes} lx` : 'Sin medición';

    return (
      <Marker
        key={`pred-${l.id}`}
        position={[l.latitude, l.longitude]}
        icon={PREDICTION_ICON}
      >
        <Tooltip sticky>LED Pred. | {luxDisplay} | {l.facultad}</Tooltip>
        <Popup>
          <PredictionPopup l={l} />
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="map-wrapper">
      {noData && (
        <div className="no-data-overlay">
          <div className="no-data-message">
            <p>No hay datos de luminarias disponibles</p>
            <button onClick={retry} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      )}
      <div className="map-container-full">
        <MapContainer
          center={center}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
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
            {/* <Overlay name=" Mapa de Calor">
              {heatmapData.length > 0 && (
                <HeatmapLayer latlngs={heatmapData} />
              )}
            </Overlay> */}
          </LayersControl>

          <MapResizer />
          <SearchControl luminarias={displayLuminarias} />
        </MapContainer>

        <FacultyFilter
          selected={selectedFacultad}
          onChange={setSelectedFacultad}
          filteredCount={luminarias.length > 0 ? filteredLuminarias.length : 0}
          totalCount={luminarias.length}
        />

        <PredictionToggle mode={predictionMode} onChange={setPredictionMode} />

        <PredictionStats stats={predictionStats} visible={predictionMode === 'prediccion'} />

        {predictionMode === 'prediccion' && (
          <div className="prediction-badge">SIMULACIÓN LED</div>
        )}
      </div>
    </div>
  );
}
