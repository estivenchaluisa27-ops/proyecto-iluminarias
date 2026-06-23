import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { luminariasService } from '../services/luminarias.service';
import type { Luminaria } from '../types/luminaria';
import 'leaflet/dist/leaflet.css';

const estadoColor: Record<string, string> = {
  enciende: '#22c55e',
  'no enciende': '#ef4444',
  'dañado/parpadea': '#f97316',
};

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; color: white;
    ">⚡</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function MapView() {
  const [luminarias, setLuminarias] = useState<Luminaria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    luminariasService.getAll().then(setLuminarias).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Cargando mapa...</div>;
  }

  if (luminarias.length === 0) return null;

  const center: [number, number] = [luminarias[0].latitude, luminarias[0].longitude];

  return (
    <div style={{ height: 'calc(100vh - 120px)', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {luminarias.map((l) => {
          const color = estadoColor[l.estado] ?? '#6b7280';
          return (
            <Marker key={l.id} position={[l.latitude, l.longitude]} icon={createIcon(color)}>
              <Tooltip sticky>
                <div>
                  <strong>#{l.id}</strong> | {l.tipo.toUpperCase()} | {l.estado}
                  <br />
                  <span style={{ fontSize: '0.85em' }}>{l.facultad}</span>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: 220, padding: 4 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 16, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                    Luminaria #{l.id}
                  </h4>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr><td style={{ padding: '4px 0', color: '#666' }}>Tipo:</td><td style={{ fontWeight: 600 }}>{l.tipo.toUpperCase()}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: '#666' }}>Altura:</td><td style={{ fontWeight: 600 }}>{l.altura_poste ?? 'N/A'} m</td></tr>
                      <tr><td style={{ padding: '4px 0', color: '#666' }}>Luxes:</td><td style={{ fontWeight: 600 }}>{l.luxes !== null ? `${l.luxes} lx` : 'Sin medición'}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: '#666' }}>Estado:</td><td style={{ fontWeight: 600, color }}>{l.estado}</td></tr>
                      <tr><td style={{ padding: '4px 0', color: '#666' }}>Sector:</td><td style={{ fontWeight: 600 }}>{l.facultad}</td></tr>
                    </tbody>
                  </table>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
