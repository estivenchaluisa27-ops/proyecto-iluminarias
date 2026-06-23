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
import { luminariasService } from '../services/luminarias.service';
import type { Luminaria } from '../types/luminaria';
import HeatmapLayer from '../components/mapa/HeatmapLayer';
import FullscreenControl from '../components/mapa/FullscreenControl';
import MiniMapControl from '../components/mapa/MiniMapControl';
import SearchControl from '../components/mapa/SearchControl';
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
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#94a3b8',
        }}
      >
        Cargando mapa...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}
      >
        <p style={{ marginBottom: '1rem' }}>Error al cargar el mapa: {error}</p>
        <button onClick={retry} className="btn-primary">
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
    markers: luminarias.filter(
      (l) => l.tipo?.toLowerCase() === 'led'
    ),
    show: true,
  };
  const fgSodio = {
    markers: luminarias.filter(
      (l) => l.tipo?.toLowerCase() === 'sodio'
    ),
    show: true,
  };
  const fgOtros = {
    markers: luminarias.filter(
      (l) =>
        l.tipo?.toLowerCase() !== 'led' &&
        l.tipo?.toLowerCase() !== 'sodio'
    ),
    show: true,
  };

  const heatmapData: Array<[number, number, number]> = luminarias
    .filter((l) => l.luxes !== null && l.luxes > 0)
    .map((l) => [l.latitude, l.longitude, l.luxes! * 0.5]);

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
      >
        <Tooltip sticky>{tooltipText}</Tooltip>
        <Popup>
          <div dangerouslySetInnerHTML={{ __html: popupHTML }} />
        </Popup>
      </Marker>
    );
  };

  return (
    <div
      style={{
        height: 'calc(100vh - 120px)',
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
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
          <Overlay name=" Mapa de Calor">
            {heatmapData.length > 0 && (
              <HeatmapLayer latlngs={heatmapData} />
            )}
          </Overlay>
        </LayersControl>

        <FullscreenControl />
        <MiniMapControl />
        <SearchControl luminarias={luminarias} />
      </MapContainer>
    </div>
  );
}
